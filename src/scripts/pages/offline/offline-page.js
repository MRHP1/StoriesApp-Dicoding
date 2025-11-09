import { getAllStoredStories, deleteStory } from "../../data/indexeddb.js";
import { formatDate } from "../../utils/time.js";

export default class OfflinePage {
  async render() {
    return `
      <section class="container page">
        <h1>Story Tersimpan (Offline)</h1>
        <p>Story ini tersimpan dari mode offline / cache.</p>
        <div id="offline-list"></div>
      </section>
    `;
  }

  async afterRender() {
    const list = document.getElementById("offline-list");
    const stories = await getAllStoredStories();

    if (!stories.length) {
      list.innerHTML = "<p>Belum ada story tersimpan.</p>";
      return;
    }

    list.innerHTML = stories.map(s => `
      <article class="story-card">
        <img src="${s.photoUrl}">
        <h3>${s.name}</h3>
        <p>${s.description}</p>
        <small>📅 ${formatDate(s.createdAt)}</small>
        <button data-id="${s.id}" class="delete-local-btn" style="
          background:#dc3545;color:white;padding:5px;border-radius:6px;">
          Hapus dari Offline
        </button>
      </article>
    `).join("");

    document.querySelectorAll(".delete-local-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        await deleteStory(btn.dataset.id);
        alert("✅ Dihapus dari penyimpanan offline");
        location.reload();
      });
    });
  }
}
