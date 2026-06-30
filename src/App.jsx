import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import './css/App.css';
import Navbar from './navbar';
import Home from './home';
import Graficas from './graficas';

function AlertasVacio() {
  return <section className="page alertas-vacio" aria-label="Alertas" />;
}

const Alertas = lazy(() =>
  import('./alertas').then((mod) =>
    mod.default ? mod : { default: AlertasVacio }
  )
);

export default function App() {
  return (
    <div className="app">
      <Navbar />

      <main className="app__main" id="main-content">
        <Suspense fallback={<AlertasVacio />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/graficas" element={<Graficas />} />
            <Route path="/alertas" element={<Alertas />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}
