import { Platform } from 'react-native';

import { AuthSession, getAuthSession, getSessionUserId } from '@@/lib/auth';

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || 'https://namsari.com').replace(/\/$/, '');
const WEB_STORAGE_KEY = 'namsari.interactions';

export type PropertyInteraction = 'like' | 'enquiry:whatsapp' | 'enquiry:phone';

export type InteractionResponse = {
  success: true;
  property_id: number;
  interaction: PropertyInteraction;
  liked?: boolean;
  likes_count?: number;
  recorded?: boolean;
  queued?: boolean;
};

type InteractionModel = {
  id: string;
  property_id: number;
  interaction: PropertyInteraction;
  account_id: number | null;
  created_at: string;
  attempts: number;
  last_error: string | null;
  payload_json: string | null;
};

export type PendingLikeToggle<T = Record<string, unknown>> = {
  propertyId: number;
  toggleCount: number;
  property: T | null;
};

let databasePromise: ReturnType<typeof import('expo-sqlite').openDatabaseAsync> | null = null;
let flushPromise: Promise<void> | null = null;

function interactionId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

async function getDatabase() {
  if (Platform.OS === 'web') return null;
  if (!databasePromise) {
    databasePromise = import('expo-sqlite').then(async (SQLite) => {
      const database = await SQLite.openDatabaseAsync('namsari.db');
      await database.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS interactions (
          id TEXT PRIMARY KEY NOT NULL,
          property_id INTEGER NOT NULL,
          interaction TEXT NOT NULL,
          account_id INTEGER,
          created_at TEXT NOT NULL,
          attempts INTEGER NOT NULL DEFAULT 0,
          last_error TEXT,
          payload_json TEXT
        );
        CREATE INDEX IF NOT EXISTS interactions_created_at_idx ON interactions (created_at);
        CREATE TABLE IF NOT EXISTS saved_properties_cache (
          account_id INTEGER NOT NULL,
          property_id INTEGER NOT NULL,
          payload_json TEXT NOT NULL,
          PRIMARY KEY (account_id, property_id)
        );
      `);
      const columns = await database.getAllAsync<{ name: string }>('PRAGMA table_info(interactions)');
      if (!columns.some((column) => column.name === 'payload_json')) {
        await database.execAsync('ALTER TABLE interactions ADD COLUMN payload_json TEXT');
      }
      return database;
    });
  }
  return databasePromise;
}

function readWebQueue(): InteractionModel[] {
  if (Platform.OS !== 'web') return [];
  try {
    const value = globalThis.localStorage?.getItem(WEB_STORAGE_KEY);
    return value ? JSON.parse(value) as InteractionModel[] : [];
  } catch {
    return [];
  }
}

function writeWebQueue(interactions: InteractionModel[]) {
  if (Platform.OS === 'web') globalThis.localStorage?.setItem(WEB_STORAGE_KEY, JSON.stringify(interactions));
}

async function insertInteraction(interaction: InteractionModel) {
  const database = await getDatabase();
  if (!database) {
    writeWebQueue([...readWebQueue(), interaction]);
    return;
  }
  await database.runAsync(
    `INSERT INTO interactions (id, property_id, interaction, account_id, created_at, attempts, last_error, payload_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    interaction.id,
    interaction.property_id,
    interaction.interaction,
    interaction.account_id,
    interaction.created_at,
    interaction.attempts,
    interaction.last_error,
    interaction.payload_json,
  );
}

async function getQueuedInteractions() {
  const database = await getDatabase();
  if (!database) return readWebQueue();
  return database.getAllAsync<InteractionModel>('SELECT * FROM interactions ORDER BY created_at ASC');
}

async function deleteInteraction(id: string) {
  const database = await getDatabase();
  if (!database) {
    writeWebQueue(readWebQueue().filter((interaction) => interaction.id !== id));
    return;
  }
  await database.runAsync('DELETE FROM interactions WHERE id = ?', id);
}

async function hasInteraction(id: string) {
  const database = await getDatabase();
  if (!database) return readWebQueue().some((interaction) => interaction.id === id);
  const row = await database.getFirstAsync<{ id: string }>('SELECT id FROM interactions WHERE id = ?', id);
  return Boolean(row);
}

async function markAttempt(id: string, error: string) {
  const database = await getDatabase();
  if (!database) {
    writeWebQueue(readWebQueue().map((interaction) => interaction.id === id
      ? { ...interaction, attempts: interaction.attempts + 1, last_error: error }
      : interaction));
    return;
  }
  await database.runAsync('UPDATE interactions SET attempts = attempts + 1, last_error = ? WHERE id = ?', error, id);
}

async function sendInteraction(interaction: InteractionModel, session: AuthSession | null): Promise<InteractionResponse> {
  const response = await fetch(`${API_BASE_URL}/bridge/api.v1/property/${interaction.property_id}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
    },
    body: JSON.stringify({ interaction: interaction.interaction }),
  });
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
      ? data.error
      : `Request failed with status ${response.status}`;
    throw new Error(message);
  }
  if (!data || typeof data !== 'object' || !('success' in data) || data.success !== true) {
    throw new Error('The server returned an invalid response');
  }
  return data as InteractionResponse;
}

async function syncQueue() {
  const session = await getAuthSession();
  const currentUserId = getSessionUserId(session);
  const interactions = await getQueuedInteractions();

  for (const interaction of interactions) {
    if (interaction.interaction === 'like' && interaction.account_id !== currentUserId) continue;
    try {
      await sendInteraction(interaction, session);
      await deleteInteraction(interaction.id);
    } catch (error) {
      await markAttempt(interaction.id, error instanceof Error ? error.message : 'Unable to send interaction');
      break;
    }
  }
}

export function flushInteractionQueue() {
  if (!flushPromise) {
    flushPromise = syncQueue().catch(() => undefined).finally(() => { flushPromise = null; });
  }
  return flushPromise;
}

export async function getPendingLikeToggles<T = Record<string, unknown>>(accountId: number) {
  const interactions = (await getQueuedInteractions()).filter((interaction) =>
    interaction.account_id === accountId && interaction.interaction === 'like');
  const grouped = new Map<number, PendingLikeToggle<T>>();
  for (const interaction of interactions) {
    const current = grouped.get(interaction.property_id);
    let property: T | null = current?.property ?? null;
    if (interaction.payload_json) {
      try { property = JSON.parse(interaction.payload_json) as T; } catch { /* Keep the earlier snapshot. */ }
    }
    grouped.set(interaction.property_id, {
      propertyId: interaction.property_id,
      toggleCount: (current?.toggleCount || 0) + 1,
      property,
    });
  }
  return [...grouped.values()];
}

export async function cacheSavedProperties<T>(accountId: number, properties: T[]) {
  const records = properties as Array<T & { id?: number }>;
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(`namsari.saved.${accountId}`, JSON.stringify(properties));
    return;
  }
  const database = await getDatabase();
  if (!database) return;
  await database.withExclusiveTransactionAsync(async (transaction) => {
    await transaction.runAsync('DELETE FROM saved_properties_cache WHERE account_id = ?', accountId);
    for (const property of records) {
      if (typeof property.id !== 'number') continue;
      await transaction.runAsync(
        'INSERT INTO saved_properties_cache (account_id, property_id, payload_json) VALUES (?, ?, ?)',
        accountId,
        property.id,
        JSON.stringify(property),
      );
    }
  });
}

export async function getCachedSavedProperties<T>(accountId: number): Promise<T[]> {
  if (Platform.OS === 'web') {
    try {
      const value = globalThis.localStorage?.getItem(`namsari.saved.${accountId}`);
      return value ? JSON.parse(value) as T[] : [];
    } catch { return []; }
  }
  const database = await getDatabase();
  if (!database) return [];
  const rows = await database.getAllAsync<{ payload_json: string }>(
    'SELECT payload_json FROM saved_properties_cache WHERE account_id = ?',
    accountId,
  );
  return rows.flatMap((row) => {
    try { return [JSON.parse(row.payload_json) as T]; } catch { return []; }
  });
}

export async function interactWithProperty(
  propertyId: number,
  interaction: PropertyInteraction,
  session?: AuthSession | null,
  propertySnapshot?: Record<string, unknown>,
): Promise<InteractionResponse> {
  const queuedInteraction: InteractionModel = {
    id: interactionId(),
    property_id: propertyId,
    interaction,
    account_id: getSessionUserId(session || null),
    created_at: new Date().toISOString(),
    attempts: 0,
    last_error: null,
    payload_json: propertySnapshot ? JSON.stringify(propertySnapshot) : null,
  };

  await insertInteraction(queuedInteraction);
  await flushInteractionQueue();

  return {
    success: true,
    property_id: propertyId,
    interaction,
    queued: await hasInteraction(queuedInteraction.id),
  };
}
