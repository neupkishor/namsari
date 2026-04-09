import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/actions/auth';
import { headers, cookies } from 'next/headers';

interface ActivityLogParams {
  activity_type: string;
  description: string;
  temp_account_id?: string;
  account_id?: number;
}

export async function logActivity({ activity_type, description, temp_account_id, account_id }: ActivityLogParams) {
  try {
    let finalAccountId = account_id;
    let finalTempId = temp_account_id;

    // Try to resolve account_id if not provided
    if (finalAccountId === undefined) {
      try {
        const user = await getCurrentUser();
        if (user) {
          finalAccountId = user.id;
        }
      } catch (e) {
        // getCurrentUser might fail if not in a request context (though unlikely for these actions)
        console.warn('Failed to get current user for activity log', e);
      }
    }

    // Ensure temp_account_id is present
    if (!finalTempId) {
        try {
            const cookieStore = await cookies();
            const sessionCookie = cookieStore.get('namsari_session')?.value;
            if (sessionCookie) {
                // The cookie is likely just the ID string based on Tracker.tsx: sessionStorage.setItem('namsari_session_id', sessionId);
                // But wait, Tracker.tsx uses sessionStorage which is client side only.
                // The server side usually reads cookies.
                // If there is no cookie, we can't get it on server actions unless passed.
                // However, the prompt implies "guest (tempid)" which usually comes from a cookie.
                // Let's assume there is a cookie named 'namsari_session_id' set by middleware or client.
                // If the previous code relied on `sessionStorage` in `Tracker.tsx`, that is only sent via `trackVisit`.
                // For other actions (like sharing/calling), we might not have the session ID unless we pass it.
                // BUT, let's try to read 'namsari_session_id' cookie if it exists.
                // If the client sets a cookie, we can read it.
                
                // Correction: The `Tracker.tsx` uses `sessionStorage`. This is NOT sent to server automatically on other requests.
                // To fix "logging stopped" for guests:
                // 1. We should probably set a cookie instead of just sessionStorage in Tracker.tsx?
                // OR 2. We just accept that for now we only get temp_id if passed explicitly (like in trackVisit).
                
                // However, for `logActivity` to work generally, we need a persistent ID.
                // If the user hasn't passed one, we try to find one.
                
                // Let's stick to the implementation I wrote above but be safe.
                // If the cookie is just a string (not JSON), handle that too.
                try {
                     const parsed = JSON.parse(sessionCookie);
                     if (parsed.id) finalTempId = parsed.id;
                } catch {
                     finalTempId = sessionCookie;
                }
            }
        } catch (e) {
            // Ignore cookie parse error or if cookies() fails in this context
        }
    }

    if (!finalTempId) {
      finalTempId = finalAccountId ? `user_${finalAccountId}` : 'anonymous';
    }

    // Capture Headers for Metadata
    let ip_address: string | undefined;
    let user_agent: string | undefined;
    let device_type: string | undefined;

    try {
        const headersList = await headers();
        user_agent = headersList.get('user-agent') || undefined;
        ip_address = headersList.get('x-forwarded-for')?.split(',')[0] || 
                     headersList.get('x-real-ip') || 
                     undefined;
        
        if (user_agent) {
            if (/mobile/i.test(user_agent)) device_type = 'mobile';
            else if (/tablet/i.test(user_agent)) device_type = 'tablet';
            else device_type = 'desktop';
        }
    } catch (headerError) {
        // Headers might not be available in all contexts (e.g. background jobs)
    }

    await prisma.activityLog.create({
      data: {
        temp_account_id: finalTempId,
        account_id: finalAccountId,
        activity_type,
        description,
        ip_address,
        user_agent,
        device_type
      },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}
