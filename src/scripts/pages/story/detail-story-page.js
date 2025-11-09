import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { parseActivePathname } from '../../routes/url-parser.js';
import { getStoryDetail } from '../../data/api.js';

export default class DetailStoryPage {
  async render() {
    return `
      <section class="container page">
      <a href="#/" id="back-home" class="back-btn">← Kembali ke Beranda</a>
        <div id="story-detail"></div>
        <div id="detail-map" style="height: 300px; margin-top: 1rem; border-radius: 8px; overflow:hidden;"></div>
      </section>`;
  }

  async afterRender() {
    const { id } = parseActivePathname();
    const s = await getStoryDetail(id);

    const c = document.querySelector('#story-detail');
    c.innerHTML = `
      <h1>${s.name}</h1>
      <img src="${s.photoUrl}" alt="Foto story oleh ${s.name}" style="width:100%;border-radius:8px;">
      <p>${s.description}</p>
      ${
        s.lat && s.lon
          ? `<small>Lokasi: ${s.lat.toFixed(4)}, ${s.lon.toFixed(4)}</small>`
          : `<small>Tidak ada lokasi untuk story ini.</small>`
      }
    `;

    if (!(s.lat && s.lon)) return;

    const map = L.map('detail-map', {
      minZoom: 2,
      maxZoom: 16,
      maxBounds: [[85, -180], [-85, 180]],
      maxBoundsViscosity: 1.0,
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([s.lat, s.lon], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      noWrap: true,
      continuousWorld: false,
      maxZoom: 18,
      detectRetina: true,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    L.marker([s.lat, s.lon]).addTo(map).bindPopup(`
      <b>${s.name}</b><br>${s.description}
    `);

    setTimeout(() => map.invalidateSize(), 300);
  }
}
