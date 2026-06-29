import React from "react";
import './css/graficas.css';
import img1 from './assets/motorbat1.jpg'
import img2 from './assets/diagram.png'
import img3 from './assets/red4.jpg'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

function Graficas() {

  // Datos simulados F1
  const data = [
    { tiempo: "0s", velocidad: 0, bateria: 100 },
    { tiempo: "5s", velocidad: 120, bateria: 98 },
    { tiempo: "10s", velocidad: 220, bateria: 95 },
    { tiempo: "15s", velocidad: 310, bateria: 92 },
    { tiempo: "20s", velocidad: 330, bateria: 90 },
    { tiempo: "25s", velocidad: 340, bateria: 87 },
    { tiempo: "30s", velocidad: 320, bateria: 85 },
    { tiempo: "35s", velocidad: 300, bateria: 80 },
    { tiempo: "40s", velocidad: 280, bateria: 75 },
    { tiempo: "45s", velocidad: 260, bateria: 70 },
    { tiempo: "50s", velocidad: 240, bateria: 65 }
  ];

  return (
    <div>
      <h2 className="title">Telemetría F1</h2>

      <div className="charts-container">

        {/* Velocidad */}
        <div className="chart-card">
          <h3 className="chart-title">Velocidad vs Tiempo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid stroke="#333" />
              <XAxis dataKey="tiempo" stroke="#fff"/>
              <YAxis stroke="#fff"/>
              <Tooltip />
              <Line
                type="monotone"
                dataKey="velocidad"
                stroke="#ff3b3b"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Batería */}
        <div className="chart-card">
          <h3 className="chart-title">SOC Batería vs Tiempo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid stroke="#333" />
              <XAxis dataKey="tiempo" stroke="#fff"/>
              <YAxis stroke="#fff"/>
              <Tooltip />
              <Line
                type="monotone"
                dataKey="bateria"
                stroke="#ffcc00"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>

      <div className="fila">
        <div className="description">
          <p>La línea de la Batería (SOC): En 2026, la batería se agota tan rápido que verás caídas drásticas
             de potencia. El límite de recarga en clasificación bajó de 8MJ a 7MJ el pasado 20 de abril, lo que 
             obliga a una gestión de energía perfecta para no quedarse "sin pilas" antes de la meta.</p>
        </div>
        <img src={img1} alt="Batería F1" className="imagen"/>
      </div>

      <div className="fila-reversa">
        <div className="description">
          <p>Superclipping: Para cargar la batería a fondo, el coche frena su motor mientras el piloto sigue acelerando.
             Gracias al cambio de normativa de hace dos días, esto ahora ocurre a 350 kW para que solo dure 
             entre 2 y 4 segundos, evitando que el coche parezca "lento" en plena recta.</p>
        </div>
        <img src={img2} alt="Batería F1" className="imagen"/>
      </div>

      <div className="fila">
        <div className="description">
          <p>Aerodinámica Activa: Ya no hablamos de X-Mode o Z-Mode (nombres descartados por la FIA). Ahora se llaman 
            oficialmente Straight Mode (baja resistencia) y Corner Mode (máximo agarre). Es el flujo de datos inalámbrico que el 
            coche envía a los ingenieros en tiempo real. El coche tiene más de 300 sensores que monitorizan todo, 
            desde la temperatura de la batería hasta la presión de los neumáticos.</p>
        </div>
        <img src={img3} alt="Batería F1" className="imagen"/>
      </div>
      
      
      
    </div>
  );
};

export default Graficas;