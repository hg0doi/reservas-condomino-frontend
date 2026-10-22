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
    throw new Error(data.mensaje || `Error ${response.status}`);
  }
  return data;
}
