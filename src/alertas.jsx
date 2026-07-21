import { useState, useEffect } from 'react';
import { fetchRiskClassification, fetchSafety } from './api/client';
import './css/alertas.css';

function getRiskClass(riskClass) {
  const c = (riskClass ?? '').toUpperCase();
  if (c.includes('CRÍTICO') || c.includes('CRITICO')) return 'critico';
  if (c.includes('ALERTA')) return 'alerta';
  return 'normal';
}

function getSafetyClass(status) {
  const s = (status ?? '').toLowerCase();
  if (s === 'critico' || s === 'crítico') return 'critico';
  return 'normal';
}

function formatConfidence(value) {
  if (value == null) return '—';
  const n = Number(value);
  const pct = n <= 1 ? n * 100 : n;
  return `${Math.round(pct)}%`;
}

export default function Alertas() {
  const [risk, setRisk] = useState(null);
  const [riskLoading, setRiskLoading] = useState(true);
  const [riskError, setRiskError] = useState(false);

  const [safety, setSafety] = useState(null);
  const [safetyLoading, setSafetyLoading] = useState(true);
  const [safetyError, setSafetyError] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const data = await fetchRiskClassification();
        setRisk(data);
        setRiskError(false);
      } catch (e) {
        console.error('Risk classification error:', e);
        setRiskError(true);
      } finally {
        setRiskLoading(false);
      }

      try {
        const data = await fetchSafety();
        setSafety(data);
        setSafetyError(false);
      } catch (e) {
        console.error('Safety error:', e);
        setSafetyError(true);
      } finally {
        setSafetyLoading(false);
      }
    };

    fetchAll();
    const interval = setInterval(fetchAll, 3000);
    return () => clearInterval(interval);
  }, []);

  const riskClass = getRiskClass(risk?.class);
  const probabilities = risk?.probabilities ?? {};
  const safetyClass = getSafetyClass(safety?.status);

  return (
    <section className="alertas-page" aria-label="Alertas">
      <h2 className="alertas-title">Alertas &amp; Clasificación IA</h2>

      <div className="alertas-grid">
        <div className="alert-card">
          <div className="alert-card__header">
            <span className="alert-card__title">Clasificación de Riesgo</span>
            <span className="alert-card__subtitle">Árbol de Decisión</span>
          </div>

          {riskLoading && <div className="alert-card__status">Cargando...</div>}
          {!riskLoading && riskError && (
            <div className="alert-card__status">Sin datos disponibles</div>
          )}
          {!riskLoading && !riskError && (
            <>
              <span className={`alert-card__badge alert-card__badge--${riskClass}`}>
                {risk?.class ?? '—'}
              </span>
              <div className="alert-card__bars">
                {Object.entries(probabilities).map(([label, value]) => (
                  <div className="prob-bar" key={label}>
                    <div className="prob-bar__label">
                      <span>{label}</span>
                      <span>{Math.round(Number(value) * 100)}%</span>
                    </div>
                    <div className="prob-bar__track">
                      <div
                        className={`prob-bar__fill prob-bar__fill--${getRiskClass(label)}`}
                        style={{ width: `${Math.min(100, Math.max(0, Number(value) * 100))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="alert-card">
          <div className="alert-card__header">
            <span className="alert-card__title">Seguridad</span>
            <span className="alert-card__subtitle">SVM</span>
          </div>

          {safetyLoading && <div className="alert-card__status">Cargando...</div>}
          {!safetyLoading && safetyError && (
            <div className="alert-card__status">Sin datos disponibles</div>
          )}
          {!safetyLoading && !safetyError && (
            <>
              <span className={`alert-card__badge alert-card__badge--${safetyClass}`}>
                {safety?.status?.toUpperCase() ?? '—'}
              </span>
              <div className="alert-card__confidence">
                <span className="alert-card__confidence-label">CONFIANZA</span>
                <span className="alert-card__confidence-value">
                  {formatConfidence(safety?.confidence)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
