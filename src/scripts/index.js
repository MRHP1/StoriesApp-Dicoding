import '../styles/styles.css';
import App from './pages/app.js';
import { getUserData, logoutUser } from './utils/index.js';

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
      <span>Hai, <b>${name}</b></span>
      <button id="logout-btn" style="margin-left:8px;">Logout</button>
    `;
    document.querySelector('#logout-btn').addEventListener('click', logoutUser);
  } else {
    userSection.innerHTML = `
      <a href="#/login">Login</a> |
      <a href="#/register">Register</a>
    `;
  }

  // --- Protect routes ---
  const protectedRoutes = ['#/', '#/about', '#/add-story'];
  if (!token && protectedRoutes.includes(window.location.hash)) {
    window.location.hash = '#/login';
  }

  const render = () =>
    document.startViewTransition
      ? document.startViewTransition(() => app.renderPage())
      : app.renderPage();

  await render();

  window.addEventListener('hashchange', async () => {
    const { token } = getUserData();
    if (!token && protectedRoutes.includes(window.location.hash)) {
      window.location.hash = '#/login';
      return;
    }
    await render();
  });
});
