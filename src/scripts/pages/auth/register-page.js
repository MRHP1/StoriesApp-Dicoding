import { registerUser } from '../../data/api.js';

export default class RegisterPage {
  async render() {
    return `
      <section class="container page">
        <h1>Daftar</h1>
        <form id="register-form">
          <label for="name">Nama:</label>
          <input id="name" name="name" type="text" required>
          <label for="email">Email:</label>
          <input id="email" name="email" type="email" required>
          <label for="password">Password:</label>
          <input id="password" name="password" type="password" required minlength="8">
          <button type="submit">Daftar</button>
        </form>
      </section>`;
  }

  async afterRender() {
    document.querySelector('#register-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = e.target.name.value;
      const email = e.target.email.value;
      const pass = e.target.password.value;

      const res = await registerUser(name, email, pass);
      alert(res.message);
      if (!res.error) window.location.hash = '#/login';
    });
  }
}
