import '../styles/styles.css';
import App from './pages/app.js';
import { getUserData, logoutUser } from './utils/index.js';
import { showLoader, hideLoader } from './utils/index.js';
import 'leaflet/dist/leaflet.css';
import { fixLeafletIcons } from './utils/map-icons.js';
import { isSubscribed, subscribePush, unsubscribePush } from './utils/push-manager.js';

fixLeafletIcons();

// ---------------- PUSH BUTTON UI ----------------
async function renderPushButton() {
  const pushSection = document.getElementById('push-section');
  if (!pushSection) return;

  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(() => console.log('SW Registered'))
      .catch(err => console.log('SW Failed:', err));
  }

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

    renderPushButton();
  };
}

// ---------------- MAIN APP ----------------
document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(() => console.log('SW Registered'))
      .catch(err => console.log('SW Failed:', err));
  }

  let deferredPrompt;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log("✅ App installable");
  });

  document.addEventListener('click', async (e) => {
    if (e.target.id === 'install-btn' && deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      console.log("User install choice:", choice.outcome);
      deferredPrompt = null;
    }
  });

  const { name, token } = getUserData();
  const userSection = document.querySelector('#user-section');

  // User login state UI
  if (token && name) {
    userSection.innerHTML = `
      <span>👋 Hi, <b>${name}</b></span>
      <button id="logout-btn" class="logout-btn">Logout</button>
    `;
    document.querySelector('#logout-btn').addEventListener('click', logoutUser);

    // ✅ Auto-subscribe setelah login (jika belum)
    if (!(await isSubscribed())) {
      subscribePush();
    }

  } else {
    userSection.innerHTML = `
      <a href="#/login">Login</a> |
      <a href="#/register">Register</a>
      <small>(Guest Mode)</small>
    `;
  }

  // Protected routes
  const protectedRoutes = ['#/', '#/add-story'];
  if (!token && protectedRoutes.includes(window.location.hash)) {
    window.location.hash = '#/login';
  }

  // SPA renderer
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
  await renderPushButton();

  window.addEventListener('hashchange', async () => {
    const { token } = getUserData();
    if (!token && protectedRoutes.includes(window.location.hash)) {
      alert("Silakan login untuk menambah story.");
      window.location.hash = '#/login';
      return;
    }

    await render();
    await renderPushButton();
  });
});
