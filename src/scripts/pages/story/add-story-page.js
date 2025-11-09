import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { addNewStory } from '../../data/api.js';

export default class AddStoryPage {
  async render() {
    return `
      <section class="container page">
        <h1>Tambah Story Baru</h1>
        <a href="#/" id="back-home" class="back-btn">← Kembali ke Beranda</a>

        <form id="story-form">
          <label for="description">Deskripsi:</label>
          <textarea id="description" required></textarea>

          <label for="photo-file">Upload Foto:</label>
          <input id="photo-file" name="photo-file" type="file" accept="image/*" style="display:none;">

          <div class="upload-switch">
            <button type="button" id="use-camera">📷 Kamera</button>
            <button type="button" id="use-file">🖼️ File</button>
          </div>

          <!-- Real-Time Camera Section -->
          <p id="camera-label">Ambil foto dengan kamera:</p>
          <div id="camera-section" style="display:none; margin-top:10px;">
            <video id="camera-stream" autoplay playsinline style="width:100%; border-radius:8px;"></video>
            <button type="button" id="capture-btn" style="margin-top:8px;">📸 Ambil Foto</button>
          </div>

          <!-- File Upload Fallback -->
          <label for="photo-file">Upload Foto (File):</label>
          <input id="photo-file" name="photo-file" type="file" accept="image/*" style="display:none;">
          
          <p>Pilih lokasi pada peta atau gunakan lokasi saya:</p>
          <button type="button" id="locate-me">📍 Gunakan Lokasi Saya</button>

          <div id="map" style="height: 350px; border-radius: 8px; margin-top:8px;"></div>

          <button type="submit">Kirim</button>
        </form>
      </section>`;
  }

  async afterRender() {
    import('leaflet/dist/leaflet.css');
    import('leaflet/dist/images/marker-icon.png');
    import('leaflet/dist/images/marker-shadow.png');

    const map = L.map('map', {
      minZoom: 2,
      maxZoom: 16,
      maxBounds: [[85, -180], [-85, 180]],
      maxBoundsViscosity: 1.0,
    }).setView([-2.5, 118], 5);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      noWrap: true,
      continuousWorld: false,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    setTimeout(() => map.invalidateSize(), 200);

    let selected = null;
    let selectedMarker = null;

    const placeMarker = (lat, lon) => {
      if (selectedMarker) map.removeLayer(selectedMarker);
      selected = { lat, lon };
      selectedMarker = L.marker([lat, lon]).addTo(map);
      map.setView([lat, lon], 13);
    };

    map.on('click', (e) => placeMarker(e.latlng.lat, e.latlng.lng));

    document.querySelector('#locate-me').addEventListener('click', () => {
      if (!navigator.geolocation) return alert('Browser Anda tidak mendukung GPS.');
      navigator.geolocation.getCurrentPosition(
        (pos) => placeMarker(pos.coords.latitude, pos.coords.longitude),
        () => alert('Tidak dapat mengambil lokasi Anda.')
      );
    });

    const cameraBtn = document.querySelector('#use-camera');
    const fileBtn = document.querySelector('#use-file');
    const cameraSection = document.querySelector('#camera-section');
    const video = document.querySelector('#camera-stream');
    const captureBtn = document.querySelector('#capture-btn');
    const fileInput = document.querySelector('#photo-file');
    let capturedBlob = null;
    let stream = null;

    cameraBtn.addEventListener('click', async () => {
      cameraSection.style.display = 'block';
      fileInput.style.display = 'none';
      fileInput.value = '';

      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        video.srcObject = stream;
      } catch {
        alert('Camera tidak dapat diakses.');
      }
    });

    fileBtn.addEventListener('click', () => {
      cameraSection.style.display = 'none';
      fileInput.style.display = 'block';
      capturedBlob = null;
      if (stream) stream.getTracks().forEach(t => t.stop());
    });

    captureBtn.addEventListener('click', () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      canvas.toBlob((blob) => {
        capturedBlob = blob;
        alert("Foto berhasil diambil!");
      }, 'image/jpeg', 0.9);
    });

    document.querySelector('#story-form').addEventListener('submit', async (e) => {
      e.preventDefault();

      const desc = document.querySelector('#description').value;
      const imageFile = capturedBlob || fileInput.files[0];

      if (!imageFile) return alert('Harap ambil foto atau pilih file.');
      if (!selected) return alert('Klik peta atau gunakan lokasi otomatis!');

      const formData = new FormData();
      formData.append('description', desc);
      formData.append('photo', imageFile);
      formData.append('lat', selected.lat);
      formData.append('lon', selected.lon);

      const res = await addNewStory(formData);

      if (!res.error) {
        alert('Story berhasil ditambahkan!');
        new Notification("Lihat story terbaru kamu: ", {
          body: desc,
          icon: "/favicon.png"
        });
        if (stream) stream.getTracks().forEach(t => t.stop());
        window.location.hash = '#/';
        setTimeout(() => window.location.reload(), 300);
      } else {
        alert(`Gagal menambahkan story: ${res.message}`);
      }
    });
  }
}
