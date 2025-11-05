import { registerUser } from '../../data/api.js';

export default class RegisterPage {
  async render() {
    return `
      <section class="container page">
        <h1>Daftar</h1>
        <form id="register-form">
          <label>Nama:</label>
          <input id="name" type="text" required>
          <label>Email:</label>
          <input id="email" type="email" required>
          <label>Password:</label>
          <input id="password" type="password" required minlength="8">
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
