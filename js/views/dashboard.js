import { getReservas } from '../api/reservas.api.js';
import { getEspacios } from '../api/espacios.api.js';
import { h, ic, emptyState, skeletonRows } from '../utils/dom.js';
import { soloFecha, soloHora, hoyISO, partesFecha, tonoEstado, fechaHoyTexto } from '../utils/format.js';
import { abrirReservaForm } from '../components/reservaForm.js';
import { showAlert } from '../components/alert.js';

export const meta = { title: 'Dashboard', subtitle: fechaHoyTexto };

const stat = (iconName, tone, valor, label) =>
  h('div', { class: 'card stat' },
    ic(iconName, `stat-icon tone-${tone}`),
    h('div', {}, h('div', { class: 'stat-value' }, String(valor)), h('div', { class: 'stat-label' }, label)));

export async function render(view) {
  const stats = h('div', { class: 'stats' }, Array.from({ length: 4 }, () => h('div', { class: 'card skeleton', style: 'height:94px' })));
  const proximas = h('section', { class: 'card' },
    h('header', { class: 'card-head' }, h('h2', {}, 'Próximas reservas'),
      h('a', { href: '#/reservas', class: 'btn btn-ghost btn-sm' }, 'Ver todas')),
    skeletonRows(4));
  const uso = h('section', { class: 'card' },
    h('header', { class: 'card-head' }, h('h2', {}, 'Uso por espacio')),
    skeletonRows(4, 26));

  const nueva = h('button', { class: 'btn btn-primary', onclick: () => abrirReservaForm(null, () => render(view)) }, ic('plus'), 'Nueva reserva');
  view.replaceChildren(
    h('div', { class: 'toolbar' }, h('p', { class: 'muted grow' }, 'Resumen general de la actividad del condominio.'), nueva),
    stats,
    h('div', { class: 'grid-2' }, proximas, uso),
  );

  let reservas, espacios;
  try {
    [{ data: reservas }, { data: espacios }] = await Promise.all([getReservas(), getEspacios()]);
  } catch (err) {
    showAlert(err.message);
    stats.replaceChildren(h('div', { class: 'card' }, emptyState('alert', 'No se pudo cargar el resumen', err.message)));
    proximas.lastChild.replaceWith(h('div'));
    uso.lastChild.replaceWith(h('div'));
    return;
  }

  const hoy = hoyISO();
  const esActiva = (r) => !['cancelada'].includes(r.estado_nombre.toLowerCase());
  const deHoy = reservas.filter((r) => soloFecha(r.fecha_reserva) === hoy && esActiva(r));
  const pendientes = reservas.filter((r) => r.estado_nombre.toLowerCase() === 'pendiente');
  const futuras = reservas
    .filter((r) => soloFecha(r.fecha_reserva) >= hoy && esActiva(r))
    .sort((a, b) => (soloFecha(a.fecha_reserva) + a.hora_inicio).localeCompare(soloFecha(b.fecha_reserva) + b.hora_inicio));

  stats.replaceChildren(
    stat('calendar', 'primary', deHoy.length, 'Reservas para hoy'),
    stat('clock', 'info', futuras.length, 'Próximas reservas'),
    stat('hourglass', 'warning', pendientes.length, 'Pendientes de confirmar'),
    stat('building', 'success', espacios.filter((e) => e.activo).length, 'Espacios activos'),
  );

  // Próximas reservas
  const lista = futuras.slice(0, 6);
  proximas.lastChild.replaceWith(lista.length
    ? h('div', { class: 'agenda' }, lista.map((r) => {
        const { dia, mes } = partesFecha(r.fecha_reserva);
        return h('div', { class: 'agenda-item' },
          h('div', { class: 'agenda-date' }, h('b', {}, String(dia)), h('small', {}, mes)),
          h('div', { class: 'agenda-main' },
            h('strong', {}, `${r.espacio_nombre} · ${r.motivo}`),
            h('span', { class: 'muted small' }, `${soloHora(r.hora_inicio)} - ${soloHora(r.hora_fin)} · ${r.nombre_cliente}`)),
          h('span', { class: `badge tone-${tonoEstado(r.estado_nombre)}` }, r.estado_nombre));
      }))
    : emptyState('calendar', 'Sin reservas próximas', 'Crea una reserva para verla aquí.'));

  // Uso por espacio (todas las reservas no canceladas)
  const conteo = espacios.map((e) => ({ nombre: e.nombre, total: reservas.filter((r) => r.espacio_id === e.id && esActiva(r)).length }))
    .sort((a, b) => b.total - a.total);
  const max = Math.max(1, ...conteo.map((c) => c.total));
  uso.lastChild.replaceWith(conteo.length
    ? h('div', { class: 'card-body bars' }, conteo.map((c) => {
        const fill = h('div', { class: 'bar-fill', style: 'width:0' });
        requestAnimationFrame(() => (fill.style.width = `${(c.total / max) * 100}%`));
        return h('div', { class: 'bar-row' },
          h('div', { class: 'bar-label' }, h('span', {}, c.nombre), h('span', { class: 'muted' }, `${c.total} ${c.total === 1 ? 'reserva' : 'reservas'}`)),
          h('div', { class: 'bar-track' }, fill));
      }))
    : emptyState('building', 'Sin espacios', 'Registra espacios para ver su uso.'));
}
