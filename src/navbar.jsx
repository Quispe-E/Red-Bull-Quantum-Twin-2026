import { Link, useLocation } from "react-router-dom";
import "./css/navbar.css";

function Navbar() {
  const location = useLocation();

  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  return (
    <nav className="nav">
      <Link to="/" className="logo-container">
        <div className="logo-mark" aria-hidden="true">
          <span className="logo-mark__text">RB</span>
        </div>
        <div className="logo-text-group">
          <h2 className="logo">Red Bull Quantum-Twin 2026</h2>
          <span className="logo-sub">Digital Twin · F1 Telemetry</span>
        </div>
      </Link>

      <div className="links">
        <Link to="/" className={`link ${isActive("/") ? "link--active" : ""}`}>
          Inicio
        </Link>
        <Link
          to="/graficas"
          className={`link ${isActive("/graficas") ? "link--active" : ""}`}
        >
          Gráficas
        </Link>
        <Link
          to="/alertas"
          className={`link ${isActive("/alertas") ? "link--active" : ""}`}
        >
          Alertas
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
