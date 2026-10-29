// La API devuelve fecha_reserva como "YYYY-MM-DDT..."; trabajamos siempre con "YYYY-MM-DD".
export const soloFecha = (f) => (f ? String(f).slice(0, 10) : '');
export const soloHora = (h) => (h ? String(h).slice(0, 5) : '');

// Fecha local de hoy en formato YYYY-MM-DD (no UTC, para no saltar de día por la noche)
export const hoyISO = () => new Date().toLocaleDateString('en-CA');

// Crea un Date local a partir de "YYYY-MM-DD" (sin desfase por zona horaria)
const aDate = (iso) => {
  const [y, m, d] = soloFecha(iso).split('-').map(Number);
  return new Date(y, m - 1, d);
};

export function fechaLarga(iso) {
  if (!iso) return '';
  return aDate(iso).toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export function partesFecha(iso) {
  const d = aDate(iso);
  return { dia: d.getDate(), mes: d.toLocaleDateString('es', { month: 'short' }).replace('.', '') };
}

export function fechaHoyTexto() {
  const s = new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Colores de los estados de reserva según su nombre
const TONOS = { pendiente: 'warning', confirmada: 'success', cancelada: 'danger', completada: 'info' };
export const tonoEstado = (nombre = '') => TONOS[nombre.trim().toLowerCase()] ?? 'neutral';

// Icono según el tipo de espacio
export function iconoTipo(nombre = '') {
  const n = nombre.toLowerCase();
  if (n.includes('cancha') || n.includes('deport')) return 'ball';
  if (n.includes('aula') || n.includes('clase')) return 'book';
  if (n.includes('audit')) return 'mic';
  if (n.includes('sala') || n.includes('reuni')) return 'presentation';
  return 'building';
}

const TONOS_TIPO = ['primary', 'success', 'info', 'warning', 'danger'];
export const tonoTipo = (id = 0) => TONOS_TIPO[id % TONOS_TIPO.length];
