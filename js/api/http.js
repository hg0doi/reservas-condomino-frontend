// api/http.js
import { API_URL } from '../config.js';

export async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    // Servidor caído, sin red, etc.
    throw new Error('No se pudo conectar con el servidor');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Error ${response.status}`);
  }
  return data;
}

// Arma un query string ignorando valores vacíos: { a: 1, b: '' } -> "?a=1"
export function qs(params = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') sp.append(k, v);
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
}
