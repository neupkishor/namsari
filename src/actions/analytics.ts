'use server';

import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

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
        
        return { success: true };
    } catch (error) {
        console.error('Failed to track visit:', error);
        return { success: false };
    }
}
