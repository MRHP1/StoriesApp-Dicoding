import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getAllStories } from '../../data/api.js';
import { formatDate } from '../../utils/time.js';
import { saveStory, deleteStory, getSavedStoryById } from "../../data/indexeddb.js";

export default class HomePage {
  async render() {
    return `
      <section class="container page">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <h1>Beranda</h1>
        </div>

        <small id="last-reload" style="color:#666;"></small>
        <p>Daftar Story dari pengguna Dicoding.</p>

        <div id="map" style="height: 400px; margin-top: 1rem; border-radius: 8px; overflow: hidden;"></div>
        <div id="story-list" class="story-list" style="margin-top: 1.5rem;"></div>
      </section>`;
  }

  async afterRender() {
    const { source, stories } = await getAllStories();
    const list = document.querySelector('#story-list');
    const mapContainer = document.getElementById('map');
    const reloadLabel = document.getElementById('last-reload');
    reloadLabel.textContent = `Last reload: ${new Date().toLocaleString('id-ID')} (${source === "online" ? "🌍 Online API" : "💾 Offline Cache"})`;

    list.innerHTML = '';

    const map = L.map(mapContainer, {
      minZoom: 2,
      maxZoom: 16,
      maxBounds: [[85, -180], [-85, 180]],
      maxBoundsViscosity: 1.0,
    }).setView([-2.5, 118], 5);

    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      detectRetina: true,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenTopoMap contributors',
    });
    L.control.layers({ OSM: osm, Topografi: topo }).addTo(map);
    setTimeout(() => map.invalidateSize(), 300);

    if (!stories.length) {
      list.innerHTML = '<p>Tidak ada story ditemukan.</p>';
      return;
    }

    for (const s of stories) {
      const isSaved = !!(await getSavedStoryById(s.id));

      const article = document.createElement('article');
      article.className = 'story-card';
      article.innerHTML = `
        <img src="${s.photoUrl}" alt="Foto story oleh ${s.name}">
        <h2>${s.name}</h2>
        <p>${s.description}</p>

        <small>📅 ${formatDate(s.createdAt)}</small><br>
        ${
          s.lat && s.lon 
            ? `<small>📍 ${s.lat.toFixed(4)}, ${s.lon.toFixed(4)}</small>`
            : `<small>Tidak ada lokasi</small>`
        }
        <br>
        <a href="#/story/${s.id}">Lihat Detail</a>

        <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">
          <button class="save-local-btn" data-id="${s.id}" style="
            background:#198754;padding:6px 10px;border-radius:8px;color:white;border:none;cursor:pointer;
          ">${isSaved ? 'Tersimpan ✓' : 'Simpan Lokal'}</button>

          ${isSaved ? `
            <button class="delete-local-btn" data-id="${s.id}" style="
              background:#dc3545;padding:6px 10px;border-radius:8px;color:white;border:none;cursor:pointer;
            ">Hapus Lokal</button>` : ``}
        </div>
      `;
      list.appendChild(article);

      if (s.lat && s.lon) {
        const marker = L.marker([s.lat, s.lon]).addTo(map);
        marker.bindPopup(`<b>${s.name}</b><br>${s.description}`);
      }
    }

    list.querySelectorAll(".save-local-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const story = stories.find(x => x.id === id);
        await saveStory(story);
        btn.textContent = 'Tersimpan ✓';
        let del = btn.parentElement.querySelector('.delete-local-btn');
        if (!del) {
          del = document.createElement('button');
          del.className = 'delete-local-btn';
          del.dataset.id = id;
          del.style.cssText = "background:#dc3545;padding:6px 10px;border-radius:8px;color:white;border:none;cursor:pointer;";
          del.textContent = 'Hapus Lokal';
          btn.parentElement.appendChild(del);
          del.addEventListener("click", async () => {
            await deleteStory(id);
            alert("🗑️ Dihapus dari simpanan lokal");
            btn.textContent = 'Simpan Lokal';
            del.remove();
          });
        }
        alert("✅ Disimpan ke IndexedDB");
      });
    });

    list.querySelectorAll(".delete-local-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        await deleteStory(btn.dataset.id);
        alert("🗑️ Dihapus dari simpanan lokal");
        const saveBtn = btn.parentElement.querySelector('.save-local-btn');
        if (saveBtn) saveBtn.textContent = 'Simpan Lokal';
        btn.remove();
      });
    });

    const bounds = L.latLngBounds(
      stories.filter(s => s.lat && s.lon).map(s => [s.lat, s.lon])
    );
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [30, 30] });
  }
}
