import { request } from './http.js';

export const getEstados    = ()          => request('/estados-reserva/obtener-estados');
export const createEstado  = (body)      => request('/estados-reserva/crear-estado', { method: 'POST', body: JSON.stringify(body) });
export const updateEstado  = (id, body)  => request(`/estados-reserva/actualizar-estado/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteEstado  = (id)        => request(`/estados-reserva/eliminar-estado/${id}`, { method: 'DELETE' });
