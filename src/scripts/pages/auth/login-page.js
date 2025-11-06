import { loginUser } from '../../data/api.js';

export default class LoginPage {
  async render() {
    return `
      <section class="container page">
        <h1>Masuk</h1>
        <form id="login-form">
          <label for="email">Email:</label>
          <input id="email" name="email" type="email" required>
          <label for="password">Password:</label>
          <input id="password" name="password" type="password" required minlength="8">
          <button type="submit">Login</button>
        </form>
      </section>`;
  }

  async afterRender() {
    document.querySelector('#login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = e.target.email.value;
      const pass = e.target.password.value;

      const res = await loginUser(email, pass);
      if (!res.error) {
        localStorage.setItem('token', res.loginResult.token);
        localStorage.setItem('name', res.loginResult.name);
        alert('Login berhasil!');
        window.location.hash = '#/';
        setTimeout(() => window.location.reload(), 500);
      } else {
        alert(res.message);
      }
    });
  }
}
