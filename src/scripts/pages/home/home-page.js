import { getAllStories } from '../../data/api.js';

export default class HomePage {
  async render() {
    return `
      <section class="container page">
        <h1>Beranda</h1>
        <p>Daftar Story dari pengguna Dicoding.</p>
        <div id="story-list" class="story-list">
          <p style="grid-column: 1 / -1; text-align:center;">Memuat stories...</p>
        </div>
      </section>`;
  }

  async afterRender() {
    const stories = await getAllStories();
    const list = document.querySelector('#story-list');
    list.innerHTML = '';

    if (!stories.length) {
      list.innerHTML = '<p>Tidak ada story ditemukan.</p>';
      return;
    }

    stories.forEach((s) => {
      const article = document.createElement('article');
      article.className = 'story-card';
      article.innerHTML = `
        <img src="${s.photoUrl}" alt="Foto oleh ${s.name}">
        <h3>${s.name}</h3>
        <p>${s.description}</p>
        <small>${new Date(s.createdAt).toLocaleString('id-ID')}</small><br>
        <a href="#/story/${s.id}">Lihat Detail</a>`;
      list.appendChild(article);
    });
  }
}
