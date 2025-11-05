import CONFIG from '../config.js';

// ---------- AUTH ----------
export async function registerUser(name, email, password) {
  const res = await fetch(`${CONFIG.BASE_URL}/register`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
}

export async function loginUser(email, password) {
  const res = await fetch(`${CONFIG.BASE_URL}/login`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

// ---------- STORIES ----------
export async function getAllStories() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Silakan login untuk melihat stories.');
    window.location.hash = '#/login';
    return [];
  }
  
//   const res = await fetch(`${CONFIG.BASE_URL}/stories?page=1&size=100&location=1`, {
// diatas yang nampilin stories dengan lokasi
  const res = await fetch(`${CONFIG.BASE_URL}/stories?page=1&size=100&location=0`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  return json.listStory || [];
}




export async function getStoryDetail(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${CONFIG.BASE_URL}/stories/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const json = await res.json();
  return json.story;
}

export async function addNewStory(formData) {
  const token = localStorage.getItem('token');
  const url = token ? `${CONFIG.BASE_URL}/stories` : `${CONFIG.BASE_URL}/stories/guest`;

  const res = await fetch(url, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  return res.json();
}
