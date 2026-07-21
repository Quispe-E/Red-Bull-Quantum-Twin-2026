import { useState, useEffect } from 'react';
import { fetchDbStatus, fetchModelSource } from './api/client';

const MODEL_LABELS = {
  regression: 'Regresión',
  decision_tree: 'Árbol de Decisión',
  kmeans: 'K-Means',
  svm: 'SVM',
};

function getDbInfo(dbStatus) {
  if (dbStatus?.engine === 'oracle') {
    return { dotClass: 'system-status__dot--green', label: 'Oracle Cloud' };
  }
  if (dbStatus?.engine === 'sqlite_fallback') {
    return { dotClass: 'system-status__dot--yellow', label: 'Modo local (SQLite)' };
  }
  return { dotClass: 'system-status__dot--unknown', label: 'Desconocido' };
}

export default function SystemStatusBadge() {
  const [dbStatus, setDbStatus] = useState(null);
  const [modelSource, setModelSource] = useState(null);
  const [dbUnknown, setDbUnknown] = useState(false);
  const [modelsUnknown, setModelsUnknown] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const data = await fetchDbStatus();
        setDbStatus(data);
        setDbUnknown(false);
      } catch (e) {
        console.error('DB status error:', e);
        setDbUnknown(true);
      }

      try {
        const data = await fetchModelSource();
        setModelSource(data);
        setModelsUnknown(false);
      } catch (e) {
        console.error('Model source error:', e);
        setModelsUnknown(true);
      }
    };

    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, []);

  const dbInfo = dbUnknown ? { dotClass: 'system-status__dot--unknown', label: 'Desconocido' } : getDbInfo(dbStatus);
  const models = modelSource?.models ?? {};
  const modelKeys = Object.keys(MODEL_LABELS);

  return (
    <div className="system-status">
      <div className="system-status__item">
        <span className={`system-status__dot ${dbInfo.dotClass}`} />
        <span className="system-status__label">{dbInfo.label}</span>
      </div>

      <div className="system-status__item system-status__item--tooltip">
        <span
          className={`system-status__dot ${
            modelsUnknown ? 'system-status__dot--unknown' : 'system-status__dot--cyan'
          }`}
        />
        <span className="system-status__label">Modelos IA</span>
        <div className="system-status__tooltip">
          {modelsUnknown && <div className="system-status__tooltip-row">Desconocido</div>}
          {!modelsUnknown &&
            modelKeys.map((key) => {
              const model = models[key];
              const source = model?.source;
              const isAzure = source === 'azure_ml';
              const label = isAzure ? 'Azure ML' : source === 'local' ? 'Local' : 'Desconocido';
              const dotClass = isAzure
                ? 'system-status__dot--green'
                : source === 'local'
                  ? 'system-status__dot--gray'
                  : 'system-status__dot--unknown';
              return (
                <div className="system-status__tooltip-row" key={key}>
                  <span className={`system-status__dot ${dotClass}`} />
                  <span>{MODEL_LABELS[key]}</span>
                  <span className="system-status__tooltip-source">{label}</span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
