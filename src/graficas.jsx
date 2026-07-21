import { useState, useEffect } from 'react';
import './css/graficas.css';
import img1 from './assets/motorbat1.jpg';
import img2 from './assets/diagram.png';
import img3 from './assets/red4.jpg';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import { fetchStrategyClusters } from './api/client';

const data = [
  { tiempo: '0s', velocidad: 0, bateria: 100 },
  { tiempo: '5s', velocidad: 120, bateria: 98 },
  { tiempo: '10s', velocidad: 220, bateria: 95 },
  { tiempo: '15s', velocidad: 310, bateria: 92 },
  { tiempo: '20s', velocidad: 330, bateria: 90 },
  { tiempo: '25s', velocidad: 340, bateria: 87 },
  { tiempo: '30s', velocidad: 320, bateria: 85 },
  { tiempo: '35s', velocidad: 300, bateria: 80 },
  { tiempo: '40s', velocidad: 280, bateria: 75 },
  { tiempo: '45s', velocidad: 260, bateria: 70 },
  { tiempo: '50s', velocidad: 240, bateria: 65 },
];

export default function Graficas() {
  const [clusters, setClusters] = useState(null);
  const [clustersLoading, setClustersLoading] = useState(true);
  const [clustersError, setClustersError] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const data = await fetchStrategyClusters();
        setClusters(data);
        setClustersError(false);
      } catch (e) {
        console.error('Strategy clusters error:', e);
        setClustersError(true);
      } finally {
        setClustersLoading(false);
      }
    };

    fetchAll();
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
  }, []);

  const clusterPoints = clusters?.points ?? null;
  const currentPoint = clusters?.current_point ?? null;

  return (
    <div className="graficas-page">
      <h2 className="title">Telemetría F1</h2>

      <div className="charts-container">
        <div className="chart-card">
          <h3 className="chart-title">Velocidad vs Tiempo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid stroke="#333" />
              <XAxis dataKey="tiempo" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip />
              <Line type="monotone" dataKey="velocidad" stroke="#ff3b3b" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">SOC Batería vs Tiempo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid stroke="#333" />
              <XAxis dataKey="tiempo" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip />
              <Line type="monotone" dataKey="bateria" stroke="#ffcc00" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="fila">
        <div className="description">
          <p>
            La línea de la Batería (SOC): En 2026, la batería se agota tan rápido que verás caídas
            drásticas de potencia. El límite de recarga en clasificación bajó de 8MJ a 7MJ el pasado
            20 de abril, lo que obliga a una gestión de energía perfecta para no quedarse &quot;sin
            pilas&quot; antes de la meta.
          </p>
        </div>
        <img src={img1} alt="Batería F1" className="imagen" />
      </div>

      <div className="fila-reversa">
        <div className="description">
          <p>
            Superclipping: Para cargar la batería a fondo, el coche frena su motor mientras el piloto
            sigue acelerando. Gracias al cambio de normativa de hace dos días, esto ahora ocurre a 350
            kW para que solo dure entre 2 y 4 segundos, evitando que el coche parezca &quot;lento&quot;
            en plena recta.
          </p>
        </div>
        <img src={img2} alt="Diagrama superclipping" className="imagen" />
      </div>

      <div className="fila">
        <div className="description">
          <p>
            Aerodinámica Activa: Ya no hablamos de X-Mode o Z-Mode (nombres descartados por la FIA).
            Ahora se llaman oficialmente Straight Mode (baja resistencia) y Corner Mode (máximo agarre).
            Es el flujo de datos inalámbrico que el coche envía a los ingenieros en tiempo real. El
            coche tiene más de 300 sensores que monitorizan todo, desde la temperatura de la batería
            hasta la presión de los neumáticos.
          </p>
        </div>
        <img src={img3} alt="Aerodinámica activa" className="imagen" />
      </div>

      <h2 className="title">Clusters de Estrategia</h2>

      <div className="cluster-section">
        <div className="chart-card cluster-card">
          <h3 className="chart-title">Cluster Sugerido</h3>
          {clustersLoading && <p className="cluster-status">Cargando...</p>}
          {!clustersLoading && clustersError && (
            <p className="cluster-status">Sin datos disponibles</p>
          )}
          {!clustersLoading && !clustersError && (
            <div className="cluster-info">
              <span className="cluster-info__id">Cluster #{clusters?.cluster_id ?? '—'}</span>
              <p className="cluster-info__text">
                {clusters?.interpretation ?? 'Sin interpretación disponible.'}
              </p>
            </div>
          )}
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Mapa de Clusters</h3>
          {clusterPoints && currentPoint ? (
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                <CartesianGrid stroke="#333" />
                <XAxis type="number" dataKey="x" stroke="#fff" name="x" />
                <YAxis type="number" dataKey="y" stroke="#fff" name="y" />
                <ZAxis range={[60, 60]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Clusters" data={clusterPoints} fill="#ffcc00" />
                <Scatter name="Actual" data={[currentPoint]} fill="#ff3b3b" />
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <p className="cluster-status">
              El backend aún no expone coordenadas 2D para este gráfico.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
