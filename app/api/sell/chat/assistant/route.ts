import { NextResponse } from 'next/server';
import { getSession } from '@/services/auth/session';
import { getPropertyAssistantResponse } from '@/services/chat/property-assistant';

// Returns the current development response for authenticated assistant requests.
export async function POST() {
    const session = await getSession();
    if (!session?.id) {
        return NextResponse.json({ error: 'Login required' }, { status: 401 });
    }

    return NextResponse.json({
        assistantMessage: await getPropertyAssistantResponse(),
        draft: {},
        missingFields: [],
        readyToCreate: false,
        createPayload: null,
    });
}
