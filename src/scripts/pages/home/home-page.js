import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getAllStories } from '../../data/api.js';

export default class HomePage {
  async render() {
    return `
      <section class="container page">
        <h1>Beranda</h1>
        <p>Daftar Story dari pengguna Dicoding.</p>
        <div id="map" style="height: 400px; margin-top: 1rem; border-radius: 8px; overflow: hidden;"></div>
        <div id="story-list" class="story-list" style="margin-top: 1.5rem;"></div>
      </section>`;
  }

  async afterRender() {
    const stories = await getAllStories();
    const list = document.querySelector('#story-list');
    const mapContainer = document.getElementById('map');
    list.innerHTML = '';

    // ✅ Initialize map only once per render
    const map = L.map(mapContainer).setView([-2.5, 118], 5);

    // ✅ Fix tile mismatch by using correct retina-safe URL
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      detectRetina: true,
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    }).addTo(map);

    // ✅ Add alternative layer for advanced criteria
    const topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 17,
      attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors',
    });
    L.control.layers({ Default: osm, Topographic: topo }).addTo(map);

    // ✅ Important: revalidate map size after SPA transition
    setTimeout(() => map.invalidateSize(), 400);

    // ✅ Display story list and markers
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

      if (s.lat && s.lon) {
        const marker = L.marker([s.lat, s.lon]).addTo(map);
        marker.bindPopup(`<b>${s.name}</b><br>${s.description}`);
      }
    });

    // ✅ Fit map to visible markers
    const markers = stories.filter(s => s.lat && s.lon).map(s => [s.lat, s.lon]);
    if (markers.length) {
      const bounds = L.latLngBounds(markers);
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }
}
