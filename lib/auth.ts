import NextAuth from "next-auth";
import { prisma } from "@/lib/prisma";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

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
            include: { credentials: true },
          });

          if (!user || !user.credentials?.password) return null;

          // Check status
          if (user.status === 'banned' || user.status === 'suspended') {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.credentials.password
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
        
        // Fetch operatingId from our manual session tracking
        if (token.sessionId) {
          try {
            const dbSession = await prisma.session.findUnique({
              where: { sessionToken: token.sessionId as string },
              select: { operatingId: true }
            });
            if (dbSession) {
              (session.user as any).operatingId = dbSession.operatingId;
            }
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
          }
         } catch (error) {
           console.error("Error creating manual session in jwt callback:", error);
         }
       }
       return token;
     },
  },
  events: {
    async signOut(data) {
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
    return true;
  } catch (error) {
    console.error("Error switching profile:", error);
    return false;
  }
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
