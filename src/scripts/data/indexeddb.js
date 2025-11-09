import { openDB } from 'idb';

const DB_NAME = 'storymap-db';
const STORE_NAME = 'stories';

export async function getDB() {
  return await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
}

export async function saveStories(stories) {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  stories.forEach(story => tx.store.put(story));
  await tx.done;
}

export async function getAllStoredStories() {
  const db = await getDB();
  return await db.getAll(STORE_NAME);
}
