import React, { useState, useEffect, useRef } from "react";
import "./css/alertas.css";

function Alertas() {
  const [clippingValue, setClippingValue] = useState(3.0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [logs, setLogs] = useState([
    { id: 1, time: "11:20:00", value: 3.0, state: "normal", message: "Sistema inicializado en rango óptimo." }
  ]);

  const lastStateRef = useRef("normal");
  const simIntervalRef = useRef(null);
  const simAngleRef = useRef(0);

  // Determinar el estado y detalles según el valor de Superclipping
  let state = "normal";
  let statusTitle = "ÓPTIMO (RANGO REGULADO)";
  let statusDesc = "La recuperación de energía a 350 kW está operando dentro del rango ideal (2-4 segundos). La eficiencia de carga y la velocidad en rectas son óptimas.";

  if (clippingValue > 4.0) {
    state = "danger";
    statusTitle = "¡PELIGRO! CLIPPING EXCESIVO";
    statusDesc = "El tiempo de Superclipping supera los 4.0 segundos. Esto provoca una pérdida crítica de velocidad en recta (desinfle del motor) y un sobrecalentamiento térmico del MGU-K.";
  } else if (clippingValue < 2.0) {
    state = "low";
    statusTitle = "CARGA INSUFICIENTE (EFICIENCIA BAJA)";
    statusDesc = "El tiempo de Superclipping es menor a 2.0 segundos. La batería del monoplaza no se recargará lo suficiente para la potencia requerida en la siguiente vuelta.";
  }

  // Registrar un log cuando cambia el estado de alerta
  useEffect(() => {
    if (state !== lastStateRef.current) {
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0];
      const stateLabels = {
        normal: "Normal (Óptimo)",
        danger: "Peligro (Crítico)",
        low: "Bajo (Advertencia)"
      };

      setLogs((prevLogs) => [
        {
          id: Date.now(),
          time: timeStr,
          value: parseFloat(clippingValue).toFixed(2),
          state: state,
          message: `Transición a estado ${stateLabels[state]}. Valor: ${parseFloat(clippingValue).toFixed(2)}s.`
        },
        ...prevLogs
      ]);
      lastStateRef.current = state;
    }
  }, [state, clippingValue]);

  // Manejar el cambio manual del valor
  const handleInputChange = (e) => {
    let val = parseFloat(e.target.value);
    if (isNaN(val)) {
      val = 0;
    }
    // Permitir valores decimales
    setClippingValue(Math.max(0, parseFloat(val.toFixed(2))));
  };

  const handleSliderChange = (e) => {
    setClippingValue(parseFloat(e.target.value));
  };

  // Simulación interactiva de carrera (fluctuación de telemetría)
  useEffect(() => {
    if (isSimulating) {
      simIntervalRef.current = setInterval(() => {
        // Usar una función seno combinada con un poco de ruido para simular fluctuaciones realistas en pista
        simAngleRef.current += 0.15;
        const baseVal = 3.0; // Centro óptimo
        const wave = Math.sin(simAngleRef.current) * 2.2; // Rango de fluctuación +/- 2.2s
        const noise = (Math.random() - 0.5) * 0.3; // Ruido menor de 0.3s
        
        let newVal = baseVal + wave + noise;
        if (newVal < 0) newVal = 0;
        
        setClippingValue(parseFloat(newVal.toFixed(2)));
      }, 500); // Actualiza cada 500ms para una sensación dinámica de telemetría en tiempo real
    } else {
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
      }
    }

    return () => {
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
      }
    };
  }, [isSimulating]);

  const clearLogs = () => {
    setLogs([]);
  };

  // Valores predefinidos rápidos
  const setQuickValue = (val) => {
    setIsSimulating(false);
    setClippingValue(val);
  };

  return (
    <div className="alertas-container">
      <div className="alertas-header">
        <h2>Panel de Alertas de Superclipping</h2>
        <p className="alertas-subtitle">Telemetría de la Unidad de Potencia ERS - Normativa FIA 2026</p>
      </div>

      <div className="alertas-grid">
        {/* PANEL PRINCIPAL: Cambia de color reactivamente */}
        <div className={`status-panel state-${state}`}>
          <div className="status-badge-container">
            <span className="status-badge">
              {state === "normal" ? "✔ NORMAL" : state === "danger" ? "⚠ PELIGRO" : "⚠ BAJO"}
            </span>
            <span style={{ fontSize: "12px", color: "var(--text)", fontFamily: "var(--mono)" }}>
              SISTEMA ERS ACTIVE
            </span>
          </div>

          <div className="value-display">
            <div className="value-number">
              {clippingValue.toFixed(2)}
              <span className="value-unit">seg</span>
            </div>
            <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "var(--text)", textTransform: "uppercase", letterSpacing: "1px" }}>
              Duración de Frenado de Motor en Recta
            </p>
          </div>

          <div className="status-info">
            <h3 className="status-title">{statusTitle}</h3>
            <p className="status-desc">{statusDesc}</p>
          </div>
        </div>

        {/* PANEL DE CONTROLES */}
        <div className="control-panel">
          <h3 className="control-title">Ajustes del Simulador</h3>
          
          <div className="input-group">
            <span className="input-label">Entrada manual de tiempo (s)</span>
            <div className="number-input-wrapper">
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={clippingValue}
                onChange={handleInputChange}
                className="styled-number-input"
              />
              <span style={{ fontSize: "14px", color: "var(--text)" }}>Rango: [0.0s - 10.0s]</span>
            </div>
          </div>

          <div className="input-group">
            <span className="input-label">Ajuste Fino (Slider)</span>
            <input
              type="range"
              min="0"
              max="7"
              step="0.1"
              value={clippingValue}
              onChange={handleSliderChange}
              className="styled-slider"
            />
          </div>

          <div className="input-group">
            <span className="input-label">Valores Rápidos de Prueba</span>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button onClick={() => setQuickValue(1.5)} className="btn btn-low" style={{ padding: "6px 10px", fontSize: "12px" }}>
                1.5s (Bajo)
              </button>
              <button onClick={() => setQuickValue(3.0)} className="btn btn-normal" style={{ padding: "6px 10px", fontSize: "12px" }}>
                3.0s (Óptimo)
              </button>
              <button onClick={() => setQuickValue(4.8)} className="btn btn-danger" style={{ padding: "6px 10px", fontSize: "12px" }}>
                4.8s (Peligro)
              </button>
            </div>
          </div>

          <div className="action-buttons">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`btn btn-primary ${isSimulating ? `btn-active state-${state}` : ""}`}
            >
              {isSimulating ? "⏸ Detener Telemetría" : "▶ Iniciar Telemetría Realtime"}
            </button>
          </div>
        </div>

        {/* LOG DE EVENTOS / HISTORIAL DE ALERTAS */}
        <div className="logs-section">
          <h3 className="logs-title">
            Registro de Eventos ERS
            {logs.length > 0 && (
              <button onClick={clearLogs} className="logs-clear">
                Limpiar Historial
              </button>
            )}
          </h3>
          {logs.length === 0 ? (
            <p style={{ fontSize: "13px", color: "var(--text)", fontStyle: "italic", margin: 0 }}>
              No hay eventos en el registro. Cambia el valor de superclipping para registrar eventos.
            </p>
          ) : (
            <div className="logs-list">
              {logs.map((log) => (
                <div key={log.id} className={`log-item state-${log.state}`}>
                  <span className="log-time">[{log.time}]</span>
                  <span style={{ flexGrow: 1, margin: "0 10px" }}>{log.message}</span>
                  <span className="log-val">{log.value}s</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* INFORMACIÓN SOBRE LA REGULACIÓN */}
        <div className="info-section">
          <span className="info-icon">ℹ</span>
          <div className="info-content">
            <h4>¿Por qué ocurre el Superclipping?</h4>
            <p>
              En la temporada 2026, la recarga del MGU-K está limitada a 350 kW. Para evitar un drenaje acelerado,
              el motor de combustión realiza un frenado activo para inyectar torque extra al generador eléctrico.
              Si dura menos de 2s, la batería queda infrecargada. Si dura más de 4s, el auto pierde demasiada
              velocidad en las rectas principales de DRS, comprometiendo los tiempos de vuelta.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Alertas;
