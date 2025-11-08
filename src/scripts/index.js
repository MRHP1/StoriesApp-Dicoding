import '../styles/styles.css';
import App from './pages/app.js';
import { getUserData, logoutUser } from './utils/index.js';
import { showLoader, hideLoader } from './utils/index.js';
import 'leaflet/dist/leaflet.css';
import { fixLeafletIcons } from './utils/map-icons.js';
import { isSubscribed, subscribePush, unsubscribePush } from './utils/push-manager.js';

fixLeafletIcons();

async function renderPushButton() {
  const pushSection = document.getElementById('push-section');
  if (!pushSection) return; // safety: tombol tidak dibuat jika elemen belum ada

  // Pastikan browser mendukung push
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    pushSection.innerHTML = `<small>Push Not Supported</small>`;
    return;
  }

  // Pastikan SW sudah aktif
  await navigator.serviceWorker.ready;

  const subscribed = await isSubscribed();

  pushSection.innerHTML = `
    <button id="push-toggle-btn" class="logout-btn">
      ${subscribed ? 'Disable Notification' : 'Enable Notification'}
    </button>
  `;

  document.getElementById('push-toggle-btn').onclick = async () => {
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    if (Notification.permission !== 'granted') {
      alert('Izin notifikasi ditolak oleh pengguna.');
      return;
    }

    if (await isSubscribed()) {
      await unsubscribePush();
    } else {
      await subscribePush();
    }

    renderPushButton(); // refresh UI
  };
}

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  // Register SW
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(() => console.log('SW Registered'))
      .catch(err => console.log('SW Failed:', err));
  }

  const { name, token } = getUserData();
  const userSection = document.querySelector('#user-section');

  // Render user login/logout state
  if (token && name) {
    userSection.innerHTML = `
      <span>👋 Hi, <b>${name}</b></span>
      <button id="logout-btn" class="logout-btn">Logout</button>
    `;
    document.querySelector('#logout-btn').addEventListener('click', logoutUser);
  } else {
    userSection.innerHTML = `
      <a href="#/login">Login</a> |
      <a href="#/register">Register</a>
      <small>(Guest Mode)</small>
    `;
  }

  // Route Protection
  const protectedRoutes = ['#/', '#/add-story'];
  if (!token && protectedRoutes.includes(window.location.hash)) {
    window.location.hash = '#/login';
  }

  // Page Renderer
  const render = async () => {
    showLoader();
    const run = () => app.renderPage();

    if (document.startViewTransition) {
      await document.startViewTransition(run).finished;
    } else {
      await run();
    }

    hideLoader();
  };

  await render();
  await renderPushButton(); // ⬅ tampilkan tombol pertama kali

  window.addEventListener('hashchange', async () => {
    const { token } = getUserData();
    if (!token && protectedRoutes.includes(window.location.hash)) {
      alert("Silakan login untuk menambah story.");
      window.location.hash = '#/login';
      return;
    }

    await render();
    await renderPushButton(); // ⬅ update tombol setelah pindah halaman
  });
});
