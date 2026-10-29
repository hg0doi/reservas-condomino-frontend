import * as reservasApi from '../api/reservas.api.js';
import { getEstados } from '../api/estados.api.js';
import { h, ic, emptyState, skeletonRows } from '../utils/dom.js';
import { soloFecha, soloHora, hoyISO, fechaLarga, tonoEstado } from '../utils/format.js';
import { abrirReservaForm } from '../components/reservaForm.js';
import { confirmar } from '../components/modal.js';
import { showAlert } from '../components/alert.js';

export const meta = { title: 'Reservas', subtitle: 'Crea, edita y da seguimiento a cada reserva' };

export async function render(view) {
  const state = { reservas: [], estados: [], estado: 'todas', cuando: 'proximas', texto: '' };

  const buscar = h('input', { class: 'input', type: 'search', placeholder: 'Buscar por cliente, espacio o motivo…' });
  const cuando = h('select', { class: 'input', style: 'width:auto' },
    new Option('Próximas', 'proximas'), new Option('Pasadas', 'pasadas'), new Option('Todas las fechas', 'todas'));
  const chips = h('div', { class: 'chips' });
  const tablaCard = h('section', { class: 'card' }, skeletonRows(5));

  view.replaceChildren(
    h('div', { class: 'toolbar' },
      h('div', { class: 'search grow' }, ic('search'), buscar),
      cuando,
      h('button', { class: 'btn btn-primary', onclick: () => abrirReservaForm(null, cargar) }, ic('plus'), 'Nueva reserva')),
    chips,
    tablaCard,
  );

  buscar.addEventListener('input', () => { state.texto = buscar.value.trim().toLowerCase(); pintar(); });
  cuando.addEventListener('change', () => { state.cuando = cuando.value; pintar(); });

  function pintarChips() {
    const opciones = [{ id: 'todas', nombre: 'Todos los estados' }, ...state.estados];
    chips.replaceChildren(...opciones.map((e) => {
      const n = e.id === 'todas' ? state.reservas.length : state.reservas.filter((r) => r.estado_id === e.id).length;
      return h('button', {
        class: `chip ${String(state.estado) === String(e.id) ? 'active' : ''}`,
        onclick: () => { state.estado = e.id; pintarChips(); pintar(); },
      }, `${e.nombre} (${n})`);
    }));
  }

  function filtradas() {
    const hoy = hoyISO();
    return state.reservas.filter((r) => {
      const f = soloFecha(r.fecha_reserva);
      if (state.cuando === 'proximas' && f < hoy) return false;
      if (state.cuando === 'pasadas' && f >= hoy) return false;
      if (state.estado !== 'todas' && r.estado_id !== state.estado) return false;
      if (state.texto) {
        const t = `${r.nombre_cliente} ${r.espacio_nombre} ${r.motivo} ${r.usuario_nombre}`.toLowerCase();
        if (!t.includes(state.texto)) return false;
      }
      return true;
    }).sort((a, b) => {
      const ka = soloFecha(a.fecha_reserva) + a.hora_inicio;
      const kb = soloFecha(b.fecha_reserva) + b.hora_inicio;
      return state.cuando === 'pasadas' ? kb.localeCompare(ka) : ka.localeCompare(kb);
    });
  }

  function selectEstado(r) {
    const sel = h('select', { class: `estado-select tone-${tonoEstado(r.estado_nombre)}`, 'aria-label': 'Cambiar estado' },
      state.estados.map((e) => new Option(e.nombre, e.id, false, e.id === r.estado_id)));
    sel.addEventListener('change', async () => {
      try {
        await reservasApi.cambiarEstado(r.id, Number(sel.value));
        showAlert('Estado actualizado', 'success');
        await cargar();
      } catch (err) {
        showAlert(err.message);
        sel.value = r.estado_id;
      }
    });
    return sel;
  }

  function pintar() {
    const lista = filtradas();
    if (!lista.length) {
      tablaCard.replaceChildren(emptyState('calendar', 'No hay reservas que mostrar',
        state.reservas.length ? 'Prueba con otros filtros.' : 'Crea la primera reserva con el botón "Nueva reserva".'));
      return;
    }
    tablaCard.replaceChildren(h('div', { class: 'table-wrap' }, h('table', {},
      h('thead', {}, h('tr', {}, ['Fecha', 'Horario', 'Espacio', 'Cliente', 'Motivo', 'Estado', ''].map((t) => h('th', {}, t)))),
      h('tbody', {}, lista.map((r) => h('tr', {},
        h('td', {}, h('span', { class: 'cell-strong' }, fechaLarga(r.fecha_reserva))),
        h('td', { style: 'white-space:nowrap' }, `${soloHora(r.hora_inicio)} - ${soloHora(r.hora_fin)}`),
        h('td', { class: 'cell-strong' }, r.espacio_nombre),
        h('td', {}, r.nombre_cliente, h('span', { class: 'sub' }, `Registró: ${r.usuario_nombre}`)),
        h('td', {}, r.motivo, r.observaciones && h('span', { class: 'sub' }, r.observaciones)),
        h('td', {}, selectEstado(r)),
        h('td', {}, h('div', { class: 'row-actions' },
          h('button', { class: 'icon-btn sm', title: 'Editar', 'aria-label': 'Editar', icon: 'edit', onclick: () => abrirReservaForm(r, cargar) }),
          h('button', { class: 'icon-btn sm danger', title: 'Eliminar', 'aria-label': 'Eliminar', icon: 'trash', onclick: () => eliminar(r) }))),
      ))),
    )));
  }

  async function eliminar(r) {
    const ok = await confirmar(`Se eliminará la reserva de "${r.nombre_cliente}" en ${r.espacio_nombre} el ${fechaLarga(r.fecha_reserva)}. Esta acción no se puede deshacer.`, { title: 'Eliminar reserva' });
    if (!ok) return;
    try {
      await reservasApi.deleteReserva(r.id);
      showAlert('Reserva eliminada', 'success');
      await cargar();
    } catch (err) {
      showAlert(err.message);
    }
  }

  async function cargar() {
    try {
      const [res, est] = await Promise.all([reservasApi.getReservas(), getEstados()]);
      state.reservas = res.data;
      state.estados = est.data.sort((a, b) => a.id - b.id);
      pintarChips();
      pintar();
    } catch (err) {
      showAlert(err.message);
      tablaCard.replaceChildren(emptyState('alert', 'No se pudieron cargar las reservas', err.message));
    }
  }

  await cargar();
}
