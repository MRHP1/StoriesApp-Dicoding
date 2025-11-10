import { openDB } from 'idb';

const DB_NAME = 'storymap-db';
const STORE_NAME = 'saved-stories';
const META_STORE = 'meta';

export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE);
      }
    },
  });
}

export async function saveStory(story) {
  const db = await getDB();
  return db.put(STORE_NAME, story);
}

export async function deleteStory(id) {
  const db = await getDB();
  return db.delete(STORE_NAME, id);
}

export async function getSavedStoryById(id) {
  const db = await getDB();
  return db.get(STORE_NAME, id);
}

export async function getAllSavedStories() {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}

export async function setMeta(key, value) {
  const db = await getDB();
  return db.put(META_STORE, value, key);
}
export async function getMeta(key) {
  const db = await getDB();
  return db.get(META_STORE, key);
}
