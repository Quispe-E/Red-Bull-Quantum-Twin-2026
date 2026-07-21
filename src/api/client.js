const BASE_URL = 'http://localhost:8000';

export const fetchTelemetry = () => fetch(`${BASE_URL}/api/telemetry`).then((r) => r.json());
export const fetchSuperclipping = () => fetch(`${BASE_URL}/api/superclipping`).then((r) => r.json());
export const fetchRace = () => fetch(`${BASE_URL}/api/race`).then((r) => r.json());
export const fetchTires = () => fetch(`${BASE_URL}/api/tires`).then((r) => r.json());
export const fetchRecommendations = () => fetch(`${BASE_URL}/api/recommendations`).then((r) => r.json());
export const fetchStrategy = () => fetch(`${BASE_URL}/api/strategy`).then((r) => r.json());
export const fetchMetrics = () => fetch(`${BASE_URL}/api/metrics`).then((r) => r.json());

export const fetchRender = (ersStatus = 'NORMAL') =>
  fetch(`${BASE_URL}/api/render?ers_status=${encodeURIComponent(ersStatus)}`).then((r) =>
    r.json(),
  );
