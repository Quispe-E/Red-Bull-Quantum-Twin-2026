import { useState } from 'react';
import './css/App.css';
import Dashboard from './Dashboard';
import Graficas from './graficas';
import Alertas from './alertas';

const NAV_ITEMS = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'graficas', label: 'Gráficas' },
  { id: 'alertas', label: 'Alertas' },
];

export default function App() {
  const [activeNav, setActiveNav] = useState('inicio');

  return (
    <div className={`app-shell${activeNav !== 'inicio' ? ' app-shell--scroll' : ''}`}>
      <nav className="dashboard-nav" aria-label="Navegación principal">
        <div className="dashboard-nav__brand">
          <span className="dashboard-nav__logo">RB</span>
          <div className="dashboard-nav__titles">
            <span className="dashboard-nav__title">Red Bull Quantum-Twin 2026</span>
            <span className="dashboard-nav__sub">Digital Twin · F1 Telemetry</span>
          </div>
        </div>
        <div className="dashboard-nav__links">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`dashboard-nav__link${activeNav === item.id ? ' dashboard-nav__link--active' : ''}`}
              onClick={() => setActiveNav(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="app-main">
        {activeNav === 'inicio' && <Dashboard />}
        {activeNav === 'graficas' && <Graficas />}
        {activeNav === 'alertas' && <Alertas />}
      </main>
    </div>
  );
}
