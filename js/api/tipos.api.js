import { request } from './http.js';

export const getTipos        = ()         => request('/tipos-espacio/obtener-tipos');
export const createTipo      = (body)     => request('/tipos-espacio/crear-tipo', { method: 'POST', body: JSON.stringify(body) });
export const updateTipo      = (id, body) => request(`/tipos-espacio/actualizar-tipo/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const desactivarTipo  = (id)       => request(`/tipos-espacio/desactivar-tipo/${id}`, { method: 'POST' });
export const deleteTipo      = (id)       => request(`/tipos-espacio/eliminar-tipo/${id}`, { method: 'DELETE' });
