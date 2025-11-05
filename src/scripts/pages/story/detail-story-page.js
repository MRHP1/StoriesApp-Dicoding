import { parseActivePathname } from '../../routes/url-parser.js';
import { getStoryDetail } from '../../data/api.js';

export default class DetailStoryPage {
  async render() {
    return `<section class="container page"><div id="story-detail"></div></section>`;
  }

  async afterRender() {
    const { id } = parseActivePathname();
    const s = await getStoryDetail(id);
    const c = document.querySelector('#story-detail');
    c.innerHTML = `
      <h2>${s.name}</h2>
      <img src="${s.photoUrl}" alt="Foto story oleh ${s.name}">
      <p>${s.description}</p>
      <small>${new Date(s.createdAt).toLocaleString('id-ID')}</small>`;
  }
}
