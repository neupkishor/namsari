import NextAuth from "next-auth";
import { prisma } from "@/lib/prisma";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { createHmac } from "node:crypto";

const AUTH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60;
const OPERATING_ID_CACHE_TTL_MS = 5 * 60 * 1000;
const OPERATING_ID_LOOKUP_TIMEOUT_MS = 250;

type OperatingIdCacheEntry = {
  operatingId: number | null;
  expiresAt: number;
};

const globalForAuth = global as unknown as {
  operatingIdCache?: Map<string, OperatingIdCacheEntry>;
  operatingIdRequests?: Map<string, Promise<number | null>>;
};

const operatingIdCache = globalForAuth.operatingIdCache ?? new Map<string, OperatingIdCacheEntry>();
const operatingIdRequests = globalForAuth.operatingIdRequests ?? new Map<string, Promise<number | null>>();

if (process.env.NODE_ENV !== "production") {
  globalForAuth.operatingIdCache = operatingIdCache;
  globalForAuth.operatingIdRequests = operatingIdRequests;
}

function setCachedOperatingId(sessionId: string, operatingId: number | null) {
  operatingIdCache.set(sessionId, {
    operatingId,
    expiresAt: Date.now() + OPERATING_ID_CACHE_TTL_MS,
  });
}

function getCachedOperatingId(sessionId: string) {
  const cached = operatingIdCache.get(sessionId);
  if (!cached) return undefined;

  if (cached.expiresAt <= Date.now()) {
    operatingIdCache.delete(sessionId);
    return undefined;
  }

  return cached.operatingId;
}

async function getOperatingIdForSession(sessionId: string, fallback: number | null = null) {
  const cached = getCachedOperatingId(sessionId);
  if (cached !== undefined) return cached;

  const existingRequest = operatingIdRequests.get(sessionId);
  if (existingRequest) {
    return Promise.race([
      existingRequest,
      new Promise<number | null>((resolve) => setTimeout(() => resolve(fallback), OPERATING_ID_LOOKUP_TIMEOUT_MS)),
    ]);
  }

  const request = prisma.session.findUnique({
    where: { sessionToken: sessionId },
    select: { operatingId: true },
  })
    .then((dbSession) => {
      const operatingId = dbSession?.operatingId ?? null;
      setCachedOperatingId(sessionId, operatingId);
      return operatingId;
    })
    .catch((error) => {
      console.error("Operating session lookup error:", error);
      return fallback;
    })
    .finally(() => {
      operatingIdRequests.delete(sessionId);
    });

  operatingIdRequests.set(sessionId, request);
  return Promise.race([
    request,
    new Promise<number | null>((resolve) => setTimeout(() => resolve(fallback), OPERATING_ID_LOOKUP_TIMEOUT_MS)),
  ]);
}

function base64Url(input: string | Buffer) {
  return Buffer.from(input).toString("base64url");
}

function getAuthCookieSecret() {
  return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "";
}

function createAuthCookieJwt(user: { id: string | number; type?: string | null; username?: string | null; sessionId?: string | null; operatingId?: number | null }) {
  const secret = getAuthCookieSecret();
  if (!secret) return "";

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    user: {
      id: String(user.id),
      type: user.type || "user",
      username: user.username || "",
      sessionId: user.sessionId || null,
      operatingId: user.operatingId ?? null,
    },
    iat: now,
    exp: now + AUTH_COOKIE_MAX_AGE,
  };
  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedPayload = base64Url(JSON.stringify(payload));
  const signature = createHmac("sha256", secret).update(`${encodedHeader}.${encodedPayload}`).digest("base64url");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

async function setPhpAuthCookie(user: { id: string | number; type?: string | null; username?: string | null; sessionId?: string | null; operatingId?: number | null }) {
  const value = createAuthCookieJwt(user);
  if (!value) return;

  try {
    const cookieStore = await import("next/headers").then(h => h.cookies());
    (await cookieStore).set("auth", value, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: AUTH_COOKIE_MAX_AGE,
    });
  } catch (error) {
    console.error("Error setting PHP auth cookie:", error);
  }
}

async function clearPhpAuthCookie() {
  try {
    const cookieStore = await import("next/headers").then(h => h.cookies());
    (await cookieStore).delete("auth");
  } catch (error) {
    console.error("Error clearing PHP auth cookie:", error);
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        identifier: { label: "Username/Email/Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.identifier || !credentials?.password) return null;

          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: credentials.identifier as string },
                { username: credentials.identifier as string },
                { contact_number: credentials.identifier as string },
              ],
            },
          });

          if (!user) return null;

          const account = await prisma.account.findUnique({
            where: { id: user.id.toString() },
            select: { password_hash: true },
          });

          if (!account?.password_hash) return null;

          // Check status
          if (user.status === 'banned' || user.status === 'suspended') {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            account.password_hash
          );

          if (!isPasswordValid) return null;

          return {
            id: user.id.toString(),
            name: user.name || "",
            email: user.email || "",
            image: (user as any).image || (user as any).profile_picture || "",
            type: user.type,
            username: user.username || "",
          };
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
  ],
  trustHost: true,
  callbacks: {
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        (session.user as any).type = token.type;
        (session.user as any).username = token.username;
        (session.user as any).sessionId = token.sessionId;
        
        (session.user as any).operatingId = typeof token.operatingId === "number" ? token.operatingId : null;

        // Fetch operatingId from manual tracking only when it is not already cached.
        if (token.sessionId) {
          try {
            (session.user as any).operatingId = await getOperatingIdForSession(
              token.sessionId as string,
              (session.user as any).operatingId
            );
          } catch (error) {
            console.error("Session callback error:", error);
          }
        }
      }
      return session;
    },
    async jwt({ token, user }) {
       if (user) {
         token.id = user.id;
         token.type = (user as any).type;
         token.username = (user as any).username;
         
         // Create a unique session ID for manual tracking and revocation
         const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
         token.sessionId = sessionId;
         token.operatingId = null;

         // Create the record in the database for manual session management
         try {
           const headersList = await import('next/headers').then(h => h.headers());
           const ip = (await headersList).get('x-forwarded-for') || (await headersList).get('x-real-ip') || "";
           const ua = (await headersList).get('user-agent') || "";

           if (user.id) {
            await prisma.session.create({
              data: {
                sessionToken: sessionId,
                userId: parseInt(user.id),
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                ipAddress: ip,
                userAgent: ua,
              }
            });
            setCachedOperatingId(sessionId, null);
          }
         } catch (error) {
          console.error("Error creating manual session in jwt callback:", error);
         }
         if (user.id) {
          await setPhpAuthCookie({
            id: user.id,
            type: (user as any).type,
            username: (user as any).username,
            sessionId,
            operatingId: null,
          });
         }
       }
       return token;
     },
  },
  events: {
    async signOut(data) {
       await clearPhpAuthCookie();
       // Clean up audit session on logout if we can find it
       try {
         const cookieStore = await import('next/headers').then(h => h.cookies());
         const sessionToken = (await cookieStore).get('authjs.session-token')?.value || 
                              (await cookieStore).get('__Secure-authjs.session-token')?.value;

         if (sessionToken) {
           // This is a fallback, primarily handled in logoutAction
           // Note: We'll need a way to link NextAuth session token to our sessionId
           // For now, we'll keep this as a partial cleanup
         }
       } catch (error) {
         console.error("Error in signOut event tracking:", error);
       }
     }
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
});

// --- Compatibility Layer ---

/**
 * @deprecated Use `auth()` from NextAuth instead
 */
export async function getSession() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return {
    id: session.user.id,
    type: (session.user as any).type,
    username: (session.user as any).username,
    operatingId: (session.user as any).operatingId,
  };
}

/**
 * @deprecated Use `auth()` from NextAuth instead
 */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.id) return null;
  return {
    id: parseInt(session.id),
    type: session.type,
    username: session.username,
    operatingId: session.operatingId,
  };
}

/**
 * @deprecated Use `signIn()` from NextAuth instead
 */
export async function createSession(userId: number) {
  console.warn("createSession is deprecated. Use signIn from NextAuth instead.");
}

/**
 * @deprecated Use `signIn()` from NextAuth instead
 */
export async function setSession(userId: string) {
  console.warn("setSession is deprecated. Use signIn from NextAuth instead.");
}

/**
 * @deprecated Use `signOut()` from NextAuth instead
 */
export async function clearSession() {
  await signOut();
}

/**
 * Profile switching logic for NextAuth
 */
export async function switchProfile(targetId: number | null) {
  const session = await auth();
  if (!session?.user?.id) return false;

  const sessionId = (session.user as any).sessionId;
  if (!sessionId) return false;

  try {
    await prisma.session.update({
      where: { sessionToken: sessionId },
      data: { operatingId: targetId }
    });
    setCachedOperatingId(sessionId, targetId);
    await setPhpAuthCookie({
      id: session.user.id,
      type: (session.user as any).type,
      username: (session.user as any).username,
      sessionId,
      operatingId: targetId,
    });
    return true;
  } catch (error) {
    console.error("Error switching profile:", error);
    return false;
  }
}

export async function syncPhpAuthCookieFromSession() {
  const session = await auth();
  if (!session?.user?.id) return false;

  const tokenUser = {
    id: session.user.id,
    type: (session.user as any).type,
    username: (session.user as any).username,
    sessionId: (session.user as any).sessionId,
    operatingId: (session.user as any).operatingId ?? null,
  };

  await setPhpAuthCookie(tokenUser);

  return createAuthCookieJwt(tokenUser);
}

/**
 * Revoke session logic for NextAuth
 */
export async function revokeSession(sessionId: string) {
  try {
    await prisma.session.delete({
      where: { id: sessionId }
    });
    return true;
  } catch (error) {
    console.error("Error revoking session:", error);
    return false;
  }
}
