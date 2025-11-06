import '../styles/styles.css';
import App from './pages/app.js';
import { getUserData, logoutUser } from './utils/index.js';
import { showLoader, hideLoader } from './utils/index.js';
import 'leaflet/dist/leaflet.css';
import { fixLeafletIcons } from './utils/map-icons.js';

fixLeafletIcons();


document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  const { name, token } = getUserData();
  const userSection = document.querySelector('#user-section');

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
 
  // --- Protect routes ---
  const protectedRoutes = ['#/', '#/add-story'];
  if (!token && protectedRoutes.includes(window.location.hash)) {
    window.location.hash = '#/login';
  }

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

  window.addEventListener('hashchange', async () => {
    const { token } = getUserData();
    if (!token && protectedRoutes.includes(window.location.hash)) {
      alert("Silakan login untuk menambah story.");
      window.location.hash = '#/login';
      return;
    }
    await render();
  });
});
