import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || 'https://namsari.com').replace(/\/$/, '');
const SESSION_KEY = 'namsari.auth.session';

export type AuthProfile = {
  id?: number;
  name: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  image: string | null;
};

export function getSessionUserId(session: AuthSession | null) {
  if (session?.profile.id) return session.profile.id;
  if (!session?.token) return null;

  try {
    const payload = session.token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const decoded = JSON.parse(globalThis.atob(padded)) as { sub?: string };
    const id = Number(decoded.sub);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

export type AuthSession = {
  token: string;
  profile: AuthProfile;
};

type AuthResponse = AuthSession & {
  status: 'success';
  method: 'signin' | 'signup';
};

export class AuthRequestError extends Error {}

async function requestAuth(path: 'signin' | 'signup', body: Record<string, string>) {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/bridge/api.v1/auth/${path}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new AuthRequestError('Unable to connect. Check your internet connection and try again.');
  }

  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
        ? data.error
        : 'Authentication failed. Please try again.';
    throw new AuthRequestError(message);
  }

  if (
    !data ||
    typeof data !== 'object' ||
    !('token' in data) ||
    typeof data.token !== 'string' ||
    !('profile' in data) ||
    !data.profile ||
    typeof data.profile !== 'object'
  ) {
    throw new AuthRequestError('The server returned an invalid authentication response.');
  }

  const authResponse = data as AuthResponse;
  await saveAuthSession({ token: authResponse.token, profile: authResponse.profile });
  return authResponse;
}

export function signIn(identifier: string, password: string) {
  return requestAuth('signin', { identifier: identifier.trim(), password });
}

export function signUp(name: string, email: string, password: string, contactNumber: string) {
  return requestAuth('signup', {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    contact_number: contactNumber.trim(),
  });
}

export async function saveAuthSession(session: AuthSession) {
  const value = JSON.stringify(session);
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(SESSION_KEY, value);
    return;
  }
  await SecureStore.setItemAsync(SESSION_KEY, value);
}

export async function getAuthSession(): Promise<AuthSession | null> {
  const value =
    Platform.OS === 'web'
      ? globalThis.localStorage?.getItem(SESSION_KEY)
      : await SecureStore.getItemAsync(SESSION_KEY);
  if (!value) return null;

  try {
    return JSON.parse(value) as AuthSession;
  } catch {
    await clearAuthSession();
    return null;
  }
}

export async function clearAuthSession() {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(SESSION_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
