import { request, qs } from './http.js';

export const getEspacios        = ()         => request('/espacios/obtener-espacios');
export const getEspacio         = (id)       => request(`/espacios/obtener-espacio/${id}`);
export const getDisponibles     = (params)   => request(`/espacios/obtener-disponibles${qs(params)}`);
export const createEspacio      = (body)     => request('/espacios/crear-espacio', { method: 'POST', body: JSON.stringify(body) });
export const updateEspacio      = (id, body) => request(`/espacios/actualizar-espacio/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const desactivarEspacio  = (id)       => request(`/espacios/desactivar-espacio/${id}`, { method: 'POST' });
export const deleteEspacio      = (id)       => request(`/espacios/eliminar-espacio/${id}`, { method: 'DELETE' });
