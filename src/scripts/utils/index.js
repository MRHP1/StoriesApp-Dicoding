export function getUserData() {
  const name = localStorage.getItem('name');
  const token = localStorage.getItem('token');
  return { name, token };
}

export function logoutUser() {
  if (confirm('Yakin ingin logout?')) {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    window.location.hash = '#/login';
    setTimeout(() => window.location.reload(), 300);
  }
}

export function showFormattedDate(date, locale = 'en-US', options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function showLoader() {
  document.getElementById('loader')?.classList.remove('hidden');
}

export function hideLoader() {
  document.getElementById('loader')?.classList.add('hidden');
}
