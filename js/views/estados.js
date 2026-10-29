import * as estadosApi from '../api/estados.api.js';
import { h, ic, emptyState, skeletonRows } from '../utils/dom.js';
import { tonoEstado } from '../utils/format.js';
import { openModal, modalError, confirmar } from '../components/modal.js';
import { showAlert } from '../components/alert.js';

export const meta = { title: 'Estados de reserva', subtitle: 'Etapas por las que pasa una reserva' };

export async function render(view) {
  const card = h('section', { class: 'card' }, skeletonRows(4));
  view.replaceChildren(
    h('div', { class: 'toolbar' },
      h('p', { class: 'muted grow' }, 'Las reservas en estado "Cancelada" no bloquean el horario del espacio.'),
      h('button', { class: 'btn btn-primary', onclick: () => abrirForm(null) }, ic('plus'), 'Nuevo estado')),
    card,
  );

  function pintar(estados) {
    if (!estados.length) return card.replaceChildren(emptyState('flag', 'Sin estados', 'Crea el primero.'));
    card.replaceChildren(h('div', { class: 'table-wrap' }, h('table', {},
      h('thead', {}, h('tr', {}, ['#', 'Estado', ''].map((t) => h('th', {}, t)))),
      h('tbody', {}, estados.map((e) => h('tr', {},
        h('td', { class: 'muted', style: 'width:60px' }, String(e.id)),
        h('td', {}, h('span', { class: `badge tone-${tonoEstado(e.nombre)}` }, e.nombre)),
        h('td', {}, h('div', { class: 'row-actions' },
          h('button', { class: 'icon-btn sm', title: 'Editar', 'aria-label': 'Editar', icon: 'edit', onclick: () => abrirForm(e) }),
          h('button', { class: 'icon-btn sm danger', title: 'Eliminar', 'aria-label': 'Eliminar', icon: 'trash', onclick: () => eliminar(e) }))),
      ))))));
  }

  function abrirForm(estado) {
    const nombre = h('input', { type: 'text', maxlength: 50, value: estado?.nombre ?? '', placeholder: 'Ej. En revisión' });
    openModal({
      title: estado ? 'Editar estado' : 'Nuevo estado',
      size: 'sm',
      body: h('label', { class: 'field' }, 'Nombre', nombre),
      submitText: estado ? 'Guardar cambios' : 'Crear estado',
      onSubmit: async () => {
        const data = { nombre: nombre.value.trim() };
        if (!data.nombre) { modalError(['El nombre es obligatorio']); return false; }
        try {
          if (estado) await estadosApi.updateEstado(estado.id, data);
          else await estadosApi.createEstado(data);
        } catch (err) {
          modalError([err.message]);
          return false;
        }
        showAlert(estado ? 'Estado actualizado' : 'Estado creado', 'success');
        cargar();
      },
    });
  }

  async function eliminar(e) {
    if (!(await confirmar(`Se eliminará el estado "${e.nombre}". Si hay reservas con este estado, la base de datos no lo permitirá.`, { title: 'Eliminar estado' }))) return;
    try {
      await estadosApi.deleteEstado(e.id);
      showAlert('Estado eliminado', 'success');
      cargar();
    } catch (err) { showAlert(err.message); }
  }

  async function cargar() {
    try {
      const { data } = await estadosApi.getEstados();
      pintar(data.sort((a, b) => a.id - b.id));
    } catch (err) {
      showAlert(err.message);
      card.replaceChildren(emptyState('alert', 'No se pudieron cargar los estados', err.message));
    }
  }

  await cargar();
}
