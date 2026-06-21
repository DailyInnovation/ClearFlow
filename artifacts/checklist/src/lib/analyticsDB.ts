import { openDB } from 'idb';
import { AnalyticsEvent } from '../types';

const DB_NAME = 'focus-kit-analytics';
const DB_VERSION = 1;
const STORE_NAME = 'events';

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('kitId', 'kitId');
        store.createIndex('timestamp', 'timestamp');
        store.createIndex('type', 'type');
      }
    },
  });
}

export async function logEvent(event: Omit<AnalyticsEvent, 'id'>): Promise<void> {
  try {
    const db = await getDB();
    await db.add(STORE_NAME, event);
  } catch {
    // Silent fail — analytics must never break the main flow
  }
}

export async function getAllEvents(): Promise<AnalyticsEvent[]> {
  try {
    const db = await getDB();
    return (await db.getAll(STORE_NAME)) as AnalyticsEvent[];
  } catch {
    return [];
  }
}

export async function clearAllEvents(): Promise<void> {
  try {
    const db = await getDB();
    await db.clear(STORE_NAME);
  } catch {
    // Silent fail
  }
}
