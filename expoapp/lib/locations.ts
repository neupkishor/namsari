import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || 'https://namsari.com').replace(/\/$/, '');
let databasePromise: Promise<SQLiteDatabase> | null = null;

async function database() {
  databasePromise ??= openDatabaseAsync('namsari.db');
  const db = await databasePromise;
  await db.execAsync(`CREATE TABLE IF NOT EXISTS locations (id INTEGER PRIMARY KEY NOT NULL, name TEXT NOT NULL, type TEXT NOT NULL, parent_id INTEGER, province TEXT, district TEXT, UNIQUE(name, type, parent_id));`);
  return db;
}

export type LocalCity = { id: number; city: string; district: string; province: string };

export async function syncLocations() {
  const db = await database();
  try {
    const response = await fetch(`${API_BASE_URL}/api/locations`, { headers: { Accept: 'application/json' } });
    if (!response.ok) return;
    const payload = await response.json() as { provinces?: Array<{ id: number; name: string; districts: Array<{ id: number; name: string; cities: Array<{ id: number; name: string }> }> }> };
    await db.withTransactionAsync(async () => {
      for (const province of payload.provinces || []) for (const district of province.districts || []) for (const city of district.cities || []) {
        await db.runAsync('INSERT OR REPLACE INTO locations (id, name, type, parent_id, province, district) VALUES (?, ?, ?, ?, ?, ?)', city.id, city.name, 'city', district.id, province.name, district.name);
      }
    });
  } catch { /* Offline: the existing local dataset remains available. */ }
}

export async function searchLocalCities(query: string) {
  const db = await database();
  return db.getAllAsync<LocalCity>('SELECT id, name AS city, district, province FROM locations WHERE type = ? AND (name LIKE ? OR district LIKE ? OR province LIKE ?) ORDER BY province, district, name LIMIT 50', 'city', `%${query}%`, `%${query}%`, `%${query}%`);
}
