const VAPID_PUBLIC_KEY =
  "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";

// Convert Base64 → Uint8Array (dibutuhkan untuk pushManager.subscribe)
function urlBase64ToUint8Array(base64) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Safe = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64Safe);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) output[i] = raw.charCodeAt(i);
  return output;
}

// Cek apakah browser sudah subscribe
export async function isSubscribed() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return Boolean(subscription);
}

// Subscribe → lalu register ke server Dicoding
export async function subscribePush() {
  const registration = await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  console.log("📌 Subscription Browser:", subscription);

  // Kirim subscription ke server API
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Login terlebih dahulu untuk mengaktifkan notifikasi.");
    return;
  }

  await fetch("https://story-api.dicoding.dev/v1/notifications/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(subscription),
  });

  console.log("✅ Subscription berhasil dikirim ke server API");
  alert("Notifikasi berhasil diaktifkan ✅");

  return subscription;
}

// Unsubscribe → lalu hapus dari server Dicoding
export async function unsubscribePush() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  const token = localStorage.getItem("token");

  if (!subscription) return;

  // Hapus dari server API
  await fetch("https://story-api.dicoding.dev/v1/notifications/subscribe", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ endpoint: subscription.endpoint }),
  });

  // Hapus dari browser
  await subscription.unsubscribe();
  console.log("🚫 Push unsubscribed dari browser & server");
  alert("Notifikasi dimatikan 🚫");
}
