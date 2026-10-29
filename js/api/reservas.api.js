import { request, qs } from './http.js';

export const getReservas   = ()          => request('/reservas/obtener-reservas');
export const createReserva = (body)      => request('/reservas/crear-reserva', { method: 'POST', body: JSON.stringify(body) });
export const updateReserva = (id, body)  => request(`/reservas/actualizar-reserva/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const cambiarEstado = (id, estado_id) => request(`/reservas/cambiar-estado/${id}`, { method: 'PATCH', body: JSON.stringify({ estado_id }) });
export const deleteReserva = (id)        => request(`/reservas/eliminar-reserva/${id}`, { method: 'DELETE' });

// params: { espacio_id, fecha, hora_inicio, hora_fin } -> { disponible, conflictos }
export const verificarDisponibilidad = (params) => request(`/reservas/verificar-disponibilidad${qs(params)}`);
