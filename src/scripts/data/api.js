import CONFIG from '../config.js';
import { showLoader, hideLoader } from '../utils/index.js';
import { saveStories, getAllStoredStories } from './indexeddb.js';

// ---------- AUTH ----------
export async function registerUser(name, email, password) {
  try {
    showLoader();
    const res = await fetch(`${CONFIG.BASE_URL}/register`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ name, email, password }),
    });
    return await res.json();
  } finally {
    hideLoader();
  }
}

export async function loginUser(email, password) {
  try {
    showLoader();
    const res = await fetch(`${CONFIG.BASE_URL}/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email, password }),
    });
    return await res.json();
  } finally {
    hideLoader();
  }
}

// ---------- STORIES ----------
export async function getAllStories() {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${CONFIG.BASE_URL}/stories?page=1&size=100&location=1`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    const json = await res.json();

    if (!json.error && json.listStory) {
      await saveStories(json.listStory); // ✅ simpan ke IndexedDB
      return { source: "online", stories: json.listStory };
    }

  } catch (err) {
    console.warn("⚠ Offline: mengambil dari IndexedDB");
  }

  const stored = await getAllStoredStories();
  return { source: "offline", stories: stored };
}


export async function getStoryDetail(id) {
  try {
    showLoader();
    const token = localStorage.getItem('token');
    const res = await fetch(`${CONFIG.BASE_URL}/stories/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const json = await res.json();
    return json.story;
  } finally {
    hideLoader();
  }
}

export async function addNewStory(formData) {
  const token = localStorage.getItem('token');
  const url = token ? `${CONFIG.BASE_URL}/stories` : `${CONFIG.BASE_URL}/stories/guest`;

  try {
    showLoader();
    const res = await fetch(url, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    return await res.json();
  } finally {
    hideLoader();
  }
}
