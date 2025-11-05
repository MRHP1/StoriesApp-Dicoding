import { addNewStory } from '../../data/api.js';

export default class AddStoryPage {
  async render() {
    return `
      <section class="container page">
        <h1>Tambah Story Baru</h1>
        <form id="story-form">
          <label for="description">Deskripsi:</label>
          <textarea id="description" required></textarea>

          <label for="photo">Foto:</label>
          <input id="photo" type="file" accept="image/*" capture="camera" required>

          <button type="submit">Kirim</button>
        </form>
      </section>`;
  }

  async afterRender() {
    const form = document.querySelector('#story-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const desc = document.querySelector('#description').value;
      const photo = document.querySelector('#photo').files[0];
      if (!photo) return alert('Silakan pilih foto.');

      const formData = new FormData();
      formData.append('description', desc);
      formData.append('photo', photo);

      const res = await addNewStory(formData);
      if (!res.error) {
        alert('Story berhasil ditambahkan!');
        window.location.hash = '#/';
        setTimeout(() => window.location.reload(), 800);
      } else {
        alert(`Gagal menambahkan story: ${res.message}`);
      }
    });
  }
}
