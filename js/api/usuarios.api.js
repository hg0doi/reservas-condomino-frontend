import { request } from './http.js';

export const getUsuarios     = (soloActivos = true) => request(`/usuarios/obtener-usuarios${soloActivos ? '?activo=1' : ''}`);
