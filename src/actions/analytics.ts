'use server';

import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { logActivity } from '@/lib/activity';

export async function trackVisit(sessionId: string, path: string) {
    try {
        const headersList = await headers();
        const userAgent = headersList.get('user-agent') || 'unknown';
        
        // Get IP address (try multiple headers for proxies)
        const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 
                   headersList.get('x-real-ip') || 
                   'unknown';

        await prisma.visitor.create({
            data: {
                session_id: sessionId,
                page_url: path,
                user_agent: userAgent,
                ip_address: ip
            }
        });

        // Log to ActivityLog as requested
        await logActivity({
            activity_type: 'page_visit',
            description: `visited to "${path}"`,
            temp_account_id: sessionId,
            // account_id will be resolved inside logActivity if user is logged in
        });
        
        return { success: true };
    } catch (error) {
        console.error('Failed to track visit:', error);
        return { success: false };
    }
}
