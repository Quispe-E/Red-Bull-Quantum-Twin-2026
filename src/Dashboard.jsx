import { useState, useEffect, useRef } from 'react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';
import {
  fetchTelemetry,
  fetchSuperclipping,
  fetchRace,
  fetchTires,
  fetchRecommendations,
  fetchStrategy,
} from './api/client';
import SystemStatusBadge from './SystemStatusBadge';
import './css/App.css';

const TIRE_KEYS = ['FL', 'FR', 'RL', 'RR'];

function TelemetryChart({ title, value, unit, data, color, dataKey = 'value' }) {
  return (
    <div className="telemetry-chart">
      <div className="telemetry-chart__header">
        <span className="panel-header">{title}</span>
        <span className="telemetry-chart__value" style={{ color }}>
          {value ?? '—'}
          {unit && <span className="telemetry-chart__unit">{unit}</span>}
        </span>
      </div>
      <div className="telemetry-chart__graph">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data ?? []} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={1.5}
              fill={color}
              fillOpacity={0.1}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function getWearColor(wear) {
  if (wear == null) return 'yellow';
  if (wear > 70) return 'green';
  if (wear >= 50) return 'yellow';
  return 'red';
}

function getSeverityClass(severity) {
  const s = (severity ?? '').toUpperCase();
  if (s.includes('CRÍTICO') || s.includes('CRITICO')) return 'critico';
  if (s.includes('ALERTA')) return 'alerta';
  return 'info';
}

function getSuperclipClass(superclipping) {
  const status = (superclipping?.status ?? '').toUpperCase();
  if (status.includes('PELIGRO') || status.includes('DANGER')) return 'danger';
  const color = (superclipping?.color ?? '').toLowerCase();
  if (color === 'red' || color === '#cc0000') return 'danger';
  return 'normal';
}

function getLogColorClass(color) {
  const c = (color ?? '').toLowerCase();
  if (c === 'red' || c === '#cc0000') return 'red';
  if (c === 'yellow' || c === '#ffcc00') return 'yellow';
  return 'green';
}

function getStintSegmentClass(stint) {
  const type = (stint?.type ?? '').toLowerCase();
  if (type === 'pit') return 'pit';
  const compound = (stint?.compound ?? stint?.label ?? '').toUpperCase();
  if (compound.includes('SOFT')) return 'soft';
  if (compound.includes('HARD')) return 'hard';
  return 'med';
}

function mapSocHistory(history) {
  return (history?.soc ?? []).map((item) => ({
    t: item.t,
    value: item.v ?? item.soc ?? item.value,
  }));
}

function mapThrottleHistory(history) {
  return (history?.throttle ?? []).map((item) => ({
    t: item.t,
    value: item.v ?? item.throttle ?? item.value,
  }));
}

function mapBrakeHistory(history) {
  return (history?.brake ?? []).map((item) => ({
    t: item.t,
    value: item.v ?? item.brake ?? item.value,
  }));
}

function mapVelocityHistory(history) {
  return (history?.velocidad ?? []).map((item) => ({
    t: item.t,
    v: item.v,
  }));
}

function formatClock(date) {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  const ms = String(date.getMilliseconds()).padStart(3, '0');
  return `${h}:${m}:${s}.${ms}`;
}

function formatGapAhead(value) {
  if (value == null) return '—';
  return `+${Number(value).toFixed(3)}s`;
}

function formatGapBehind(value) {
  if (value == null) return '—';
  return `-${Math.abs(Number(value)).toFixed(3)}s`;
}

export default function Dashboard() {
  const [clock, setClock] = useState(() => formatClock(new Date()));
  const [telemetry, setTelemetry] = useState(null);
  const [superclipping, setSuperclipping] = useState(null);
  const [race, setRace] = useState(null);
  const [tires, setTires] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [strategy, setStrategy] = useState(null);
  const [apiOffline, setApiOffline] = useState(false);
  const [renderImage, setRenderImage] = useState(null);
  const [renderLoading, setRenderLoading] = useState(false);
  const [simRunning, setSimRunning] = useState(false);
  const [simLap, setSimLap] = useState(null);
  const failCountRef = useRef(0);

  useEffect(() => {
    setClock(formatClock(new Date()));
    const id = setInterval(() => {
      setClock(formatClock(new Date()));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [
          telemetryData,
          superclippingData,
          raceData,
          tiresData,
          recommendationsData,
          strategyData,
        ] = await Promise.all([
          fetchTelemetry(),
          fetchSuperclipping(),
          fetchRace(),
          fetchTires(),
          fetchRecommendations(),
          fetchStrategy(),
        ]);

        failCountRef.current = 0;
        setApiOffline(false);
        setTelemetry(telemetryData);
        setSuperclipping(superclippingData);
        setRace(raceData);
        setTires(tiresData);
        setRecommendations(recommendationsData);
        setStrategy(strategyData);
      } catch (e) {
        console.error('API error:', e);
        failCountRef.current += 1;
        if (failCountRef.current >= 3) {
          setApiOffline(true);
        }
      }
    };

    fetchAll();
    const interval = setInterval(fetchAll, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchRender = async () => {
      setRenderLoading(true);
      try {
        const ersStatus = superclipping?.status || 'NORMAL';
        const res = await fetch(`http://localhost:8000/api/render?ers_status=${ersStatus}`);
        const data = await res.json();
        if (data.image) setRenderImage(data.image);
      } catch (e) {
        console.error('Render error:', e);
      } finally {
        setRenderLoading(false);
      }
    };
    fetchRender();
    const interval = setInterval(fetchRender, 5000);
    return () => clearInterval(interval);
  }, [superclipping?.status]);

  const handleStartSimulation = async () => {
    const res = await fetch('http://localhost:8000/api/simulation/start', { method: 'POST' });
    const data = await res.json();
    if (data.status === 'started' || data.status === 'already running') {
      setSimRunning(true);
    }
  };

  const handleStopSimulation = async () => {
    await fetch('http://localhost:8000/api/simulation/stop', { method: 'POST' });
    setSimRunning(false);
    setSimLap(null);
  };

  useEffect(() => {
    if (!simRunning) return undefined;
    const interval = setInterval(async () => {
      try {
        const res = await fetch('http://localhost:8000/api/simulation/lap');
        const data = await res.json();
        if (!data.running) {
          setSimRunning(false);
          return;
        }
        setSimLap(data);
        setSuperclipping((prev) => ({
          predicted_duration_s: data.superclipping_duration,
          status: data.ers_status,
          color: data.ers_status === 'NORMAL' ? '#00ff88' : data.ers_status === 'ALERTA' ? '#ffcc00' : '#cc0000',
          log: prev?.log || [],
        }));
      } catch (e) {
        console.error(e);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [simRunning]);

  if (apiOffline) {
    return (
      <div className="api-overlay api-overlay--error">
        API OFFLINE — CHECK BACKEND
      </div>
    );
  }

  if (!telemetry) {
    return (
      <div className="api-overlay api-overlay--loading">
        CONNECTING TO QUANTUM-TWIN API...
      </div>
    );
  }

  const superclipClass = getSuperclipClass(superclipping);
  const predictedFinish = (strategy?.predicted_finish ?? [])
    .map((p) => (typeof p === 'string' ? p : `P${p}`))
    .join(' → ');
  const pitStart = strategy?.pit_window?.lap_start;
  const pitEnd = strategy?.pit_window?.lap_end;
  const pitWindow =
    pitStart != null && pitEnd != null ? `LAP ${pitStart}–${pitEnd}` : '—';

  return (
    <div className="dashboard">
      <header className="top-bar">
        <div className="top-bar__left">
          <span className="rb-badge">RB</span>
          <span className="top-bar__title">QUANTUM-TWIN MISSION CONTROL</span>
          <span className="top-bar__version">RB26-V1 ALPHA</span>
        </div>
        <div className="top-bar__center">
          <span className="top-bar__race">MONACO GRAND PRIX 2026</span>
          <span className="top-bar__lap">
            LAP {race?.lap ?? '—'}/{race?.total_laps ?? '—'}
          </span>
          <span className="live-indicator">
            <span className="live-dot" />
            LIVE
          </span>
        </div>
        <div className="top-bar__right">
          <span className="weather">
            <span>AMB 24°C</span>
            <span className="weather__sep">·</span>
            <span>TRK 38°C</span>
            <span className="weather__sep">·</span>
            <span>WND 12km/h</span>
          </span>
          <span className="clock">{clock}</span>
          <SystemStatusBadge />
        </div>
        {/* SIMULATION CONTROLS */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginLeft: '16px',
          borderLeft: '1px solid #1e2a3a',
          paddingLeft: '16px',
        }}
        >
          {simRunning && simLap && (
            <span style={{
              color: '#ffcc00',
              fontFamily: 'monospace',
              fontSize: '11px',
              letterSpacing: '1px',
            }}
            >
              SIM · LAP {simLap.lap_number}/{simLap.total_laps} · P{simLap.position} · {simLap.compound}
            </span>
          )}
          {!simRunning ? (
            <button
              type="button"
              onClick={handleStartSimulation}
              style={{
                background: '#cc0000',
                color: 'white',
                border: 'none',
                padding: '6px 16px',
                fontFamily: 'monospace',
                fontSize: '11px',
                cursor: 'pointer',
                letterSpacing: '2px',
                fontWeight: 'bold',
                borderRadius: '2px',
              }}
            >
              ▶ SIMULAR CARRERA
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStopSimulation}
              style={{
                background: 'transparent',
                color: '#ffcc00',
                border: '1px solid #ffcc00',
                padding: '6px 16px',
                fontFamily: 'monospace',
                fontSize: '11px',
                cursor: 'pointer',
                letterSpacing: '2px',
                fontWeight: 'bold',
                borderRadius: '2px',
              }}
            >
              ■ DETENER
            </button>
          )}
        </div>
      </header>

      <div className="dashboard-grid">
        <div className="col col-left">
          <div className="panel panel-3d">
            <div className="panel-3d__scanline" aria-hidden="true" />
            <div className="panel__header-row">
              <span className="panel-header">GEMELO DIGITAL 3D</span>
              <span className="badge badge-red">
                {telemetry?.current?.aero_mode ?? '—'}
              </span>
            </div>
            <div className="panel-3d__meta">
              MGU-K: {telemetry?.current?.mguk_kw ?? '—'}kW
            </div>
            <div className="panel-3d__viewport">
              {renderLoading && !renderImage && (
                <div style={{ color: '#00d4ff', fontFamily: 'monospace', textAlign: 'center', padding: '20px' }}>
                  RENDERING...
                </div>
              )}
              {renderImage && (
                <img
                  src={renderImage}
                  alt="F1 Digital Twin"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              )}
            </div>
            <div className="panel-3d__footer">
              <span className="mono green">X: 142.42  Y: -12.90  Z: 0.05</span>
              <span className="panel-3d__stream">ACTIVE TELEMETRY STREAM_01</span>
            </div>
          </div>

          <div className="panel panel-superclip">
            <span className="panel-header">SUPERCLIPPING STATUS</span>
            <div className="superclip__body">
              <div className="superclip__gauge">
                <div className={`superclip__circle superclip__circle--${superclipClass}`}>
                  <span className="superclip__value">
                    {superclipping?.predicted_duration_s != null
                      ? `${Number(superclipping.predicted_duration_s).toFixed(2)}s`
                      : '—'}
                  </span>
                </div>
                <span className="superclip__label">
                  {superclipping?.status ?? 'SYNC'}
                </span>
              </div>
              <ul className="superclip__log">
                {(superclipping?.log ?? []).map((evt, index) => (
                  <li
                    key={`${evt?.label ?? evt?.message ?? index}-${index}`}
                    className={`superclip__event superclip__event--${getLogColorClass(evt?.color)}`}
                  >
                    {evt?.time ?? evt?.time_ago ?? '—'} · {evt?.label ?? evt?.message ?? '—'}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="col col-center">
          <div className="panel panel-charts">
            <div className="charts-grid">
              <TelemetryChart
                title="Velocidad"
                value={telemetry?.current?.velocidad_kmh}
                unit=" km/h"
                data={mapVelocityHistory(telemetry?.history)}
                color="#cc0000"
                dataKey="v"
              />
              <TelemetryChart
                title="SOC Batería"
                value={telemetry?.current?.soc_bateria}
                unit="%"
                data={mapSocHistory(telemetry?.history)}
                color="#ffcc00"
              />
              <TelemetryChart
                title="Throttle"
                value={telemetry?.current?.throttle_pct}
                unit="%"
                data={mapThrottleHistory(telemetry?.history)}
                color="#00ff88"
              />
              <TelemetryChart
                title="Brake Pressure"
                value={telemetry?.current?.brake_pressure}
                data={mapBrakeHistory(telemetry?.history)}
                color="#00d4ff"
              />
            </div>
          </div>

          <div className="panel panel-recommendations">
            <div className="recommendations__header">
              <span className="recommendations__title">
                <span className="pulse-dot pulse-dot--yellow" />
                IA · RECOMENDACIONES EN TIEMPO REAL
              </span>
            </div>
            <div className="recommendations__list">
              {(recommendations?.recommendations ?? []).map((rec, index) => (
                <div
                  key={`${rec?.title ?? index}-${index}`}
                  className="recommendation-card"
                >
                  <div className="recommendation-card__top">
                    <span className={`badge badge-${getSeverityClass(rec?.severity)}`}>
                      {rec?.severity ?? 'INFO'}
                    </span>
                    <span className="recommendation-card__time">
                      {rec?.time_ago ?? rec?.time ?? '—'}
                    </span>
                  </div>
                  <div className="recommendation-card__title">{rec?.title ?? '—'}</div>
                  <div className="recommendation-card__desc">
                    {rec?.description ?? '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col col-right">
          <div className="panel panel-position">
            <div className="panel__header-row">
              <span className="panel-header">RACE POSITION</span>
              <span className="badge badge-cyan">
                {race?.sector ?? 'SECTOR 2'}
              </span>
            </div>
            <div className="position__rank">
              P{race?.position ?? '—'}
            </div>
            <div className="position__gaps">
              <span className="gap gap--ahead">
                {formatGapAhead(race?.gap_ahead)} (P{Math.max(1, (race?.position ?? 2) - 1)})
              </span>
              <span className="gap gap--behind">
                {formatGapBehind(race?.gap_behind)} (P{(race?.position ?? 2) + 1})
              </span>
            </div>
            <div className="leaderboard">
              {(race?.leaderboard ?? []).map((row, index) => (
                <div
                  key={`${row?.driver ?? row?.name ?? index}-${index}`}
                  className={`leaderboard__row${row?.highlight || row?.is_us ? ' leaderboard__row--highlight' : ''}`}
                >
                  <span>{row?.position ?? row?.pos ?? index + 1}</span>
                  <span>{row?.driver ?? row?.name ?? '—'}</span>
                  <span>{row?.gap ?? row?.gap_s ?? '—'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel panel-tires">
            <div className="panel__header-row">
              <span className="panel-header">TIRE STATUS</span>
              <span className="badge badge-yellow">
                {tires?.compound ?? '—'} · LAP {tires?.lap_on ?? '—'}
              </span>
            </div>
            <div className="tires-grid">
              {TIRE_KEYS.map((key) => {
                const tire = tires?.tires?.[key];
                return (
                  <div
                    key={key}
                    className={`tire-circle tire-circle--${getWearColor(tire?.wear)}`}
                  >
                    <span className="tire-circle__temp">
                      {tire?.temp != null ? `${tire.temp}°` : '—'}
                    </span>
                    <span className="tire-circle__wear">
                      {tire?.wear != null ? `${tire.wear}%` : '—'}
                    </span>
                    <span className="tire-circle__label">{key}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel panel-strategy">
            <span className="panel-header">ESTRATEGIA &amp; PREDICTOR</span>
            <div className="strategy__metrics">
              <div className="strategy__metric">
                <span className="strategy__metric-label">PIT WINDOW</span>
                <span className="strategy__metric-value">{pitWindow}</span>
              </div>
              <div className="strategy__metric">
                <span className="strategy__metric-label">PRED. FINISH</span>
                <span className="strategy__metric-value">
                  {predictedFinish || '—'}
                </span>
              </div>
            </div>
            <span className="strategy__model">
              {strategy?.model ?? 'UNDERCUT_MODEL_V4'}
            </span>
            <div className="stint-bar">
              {(strategy?.stints ?? []).map((stint, index) => (
                <div
                  key={`${stint?.label ?? index}-${index}`}
                  className={`stint-bar__segment stint-bar__segment--${getStintSegmentClass(stint)}`}
                  style={stint?.flex ? { flex: stint.flex } : undefined}
                >
                  {stint?.label ?? stint?.name ?? '—'}
                </div>
              ))}
            </div>
            <div className="strategy__actions">
              <button type="button" className="btn btn-pit">CONFIRMAR PIT</button>
              <button type="button" className="btn btn-extend">EXTENDER STINT</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
