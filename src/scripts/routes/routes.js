import HomePage from '../pages/home/home-page.js';
import AboutPage from '../pages/about/about-page.js';
import LoginPage from '../pages/auth/login-page.js';
import RegisterPage from '../pages/auth/register-page.js';
import AddStoryPage from '../pages/story/add-story-page.js';
import DetailStoryPage from '../pages/story/detail-story-page.js';
import OfflinePage from "../pages/offline/offline-page.js";

const routes = {
  '/': new HomePage(),
  '/about': new AboutPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  '/add-story': new AddStoryPage(),
  '/story/:id': new DetailStoryPage(),
  "/offline": new OfflinePage(),
};

export default routes;
