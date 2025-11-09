import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getAllStories } from '../../data/api.js';
import { formatDate } from '../../utils/time.js';

export default class HomePage {
  async render() {
    return `
      <section class="container page">

        <div style="display:flex;justify-content:space-between;align-items:center;">
          <h1>Beranda</h1>
          <span id="net-status" class="status-badge">Checking...</span>
        </div>

        <small id="last-reload" style="color:#666;"></small>

        <p>Daftar Story dari pengguna Dicoding.</p>

        <div id="map" style="height: 400px; margin-top: 1rem; border-radius: 8px; overflow: hidden;"></div>
        <div id="story-list" class="story-list" style="margin-top: 1.5rem;"></div>
      </section>`;
  }

  async afterRender() {
    const { source, stories } = await getAllStories();  // ✅ perbarui
    const list = document.querySelector('#story-list');
    const mapContainer = document.getElementById('map');
    const netStatus = document.getElementById('net-status');
    const reloadLabel = document.getElementById('last-reload');

    reloadLabel.textContent = `Last reload: ${new Date().toLocaleString('id-ID')} (${source === "online" ? "🌍 Online API" : "💾 Offline Cache"})`;


    // 🌐 Update UI: online / offline status
    function updateNetworkState() {
      netStatus.textContent = navigator.onLine ? "Online ✅" : "Offline ⚠";
      netStatus.style.color = navigator.onLine ? "green" : "red";
    }
    updateNetworkState();
    window.addEventListener('online', updateNetworkState);
    window.addEventListener('offline', updateNetworkState);

    list.innerHTML = '';

    // 🌍 MAP
    const map = L.map(mapContainer).setView([-2.5, 118], 5);

    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    const topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png');

    L.control.layers({ OSM: osm, Topografi: topo }).addTo(map);
    setTimeout(() => map.invalidateSize(), 300);

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

        <small>📅 ${formatDate(s.createdAt)}</small><br>
        ${
          s.lat && s.lon 
            ? `<small>📍 ${s.lat.toFixed(4)}, ${s.lon.toFixed(4)}</small>`
            : `<small>Tidak ada lokasi</small>`
        }
        <br>
        <a href="#/story/${s.id}">Lihat Detail</a>
      `;

      list.appendChild(article);

      if (s.lat && s.lon) {
        const marker = L.marker([s.lat, s.lon]).addTo(map);
        marker.bindPopup(`<b>${s.name}</b><br>${s.description}`);
      }
    });

    const bounds = L.latLngBounds(
      stories.filter(s => s.lat && s.lon).map(s => [s.lat, s.lon])
    );
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [30, 30] });
  }
}
