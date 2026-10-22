import { request } from './http.js';

export const getReservas   = ()          => request('/reservas');
export const createReserva = (body)      => request('/reservas', { method: 'POST', body: JSON.stringify(body) });
export const updateReserva = (id, body)  => request(`/reservas/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteReserva = (id)        => request(`/reservas/${id}`, { method: 'DELETE' });
