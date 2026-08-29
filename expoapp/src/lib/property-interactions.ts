import { AuthSession } from '@/lib/auth';

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || 'https://namsari.com').replace(/\/$/, '');

export type PropertyInteraction = 'like' | 'enquiry:whatsapp' | 'enquiry:phone';

type InteractionResponse = {
  success: true;
  property_id: number;
  interaction: PropertyInteraction;
  liked?: boolean;
  likes_count?: number;
  recorded?: boolean;
};

export class PropertyInteractionError extends Error {}

export async function interactWithProperty(
  propertyId: number,
  interaction: PropertyInteraction,
  session?: AuthSession | null,
): Promise<InteractionResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/bridge/api.v1/property/${propertyId}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
      },
      body: JSON.stringify({ interaction }),
    });
  } catch {
    throw new PropertyInteractionError('Unable to connect. Check your internet connection and try again.');
  }

  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
      ? data.error
      : 'Unable to process this interaction.';
    throw new PropertyInteractionError(message);
  }

  if (!data || typeof data !== 'object' || !('success' in data) || data.success !== true) {
    throw new PropertyInteractionError('The server returned an invalid response.');
  }

  return data as InteractionResponse;
}
