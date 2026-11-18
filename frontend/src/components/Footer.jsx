export default function Footer() {
  return (
    <footer className="paw-footer py-4 mt-auto">
      <div className="container d-flex flex-wrap justify-content-between align-items-center gap-2">
        <span className="brand-name text-white fs-5">🐾 PawHaven</span>
        <span>Made with care for pets and the people who love them.</span>
        <small>© {new Date().getFullYear()} PawHaven</small>
      </div>
    </footer>
  );
}