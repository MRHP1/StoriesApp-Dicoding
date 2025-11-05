export default class AboutPage {
  async render() {
    return `
      <section class="container page">
        <h1>Tentang</h1>
        <p>Dicoding Story Map adalah aplikasi web SPA untuk berbagi foto dan cerita
        dengan lokasi geografis, dibangun untuk submission Dicoding Front-End Fundamental.</p>
      </section>`;
  }
  async afterRender() {}
}
