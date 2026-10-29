import { request } from './http.js';

export const login  = (correo, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ correo, password }) });
export const health = ()                 => request('/health');
