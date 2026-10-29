// Sesión simple en sessionStorage (la API usa autenticación didáctica, sin token).
const KEY = 'reservaspace.usuario';

export function getUsuario() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY));
  } catch {
    return null;
  }
}

export function setUsuario(usuario) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(usuario));
  } catch { /* almacenamiento no disponible: la sesión dura solo esta pestaña */ }
}

export function cerrarSesion() {
  try {
    sessionStorage.removeItem(KEY);
  } catch { /* nada que limpiar */ }
}
