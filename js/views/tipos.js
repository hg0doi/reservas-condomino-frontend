import * as tiposApi from '../api/tipos.api.js';
import { h, ic, emptyState, skeletonRows } from '../utils/dom.js';
import { iconoTipo, tonoTipo } from '../utils/format.js';
import { openModal, modalError, confirmar } from '../components/modal.js';
import { showAlert } from '../components/alert.js';

export const meta = { title: 'Tipos de espacio', subtitle: 'Categorías para clasificar los espacios' };

export async function render(view) {
  const card = h('section', { class: 'card' }, skeletonRows(4));
  view.replaceChildren(
    h('div', { class: 'toolbar' },
      h('p', { class: 'muted grow' }, 'Un tipo inactivo no se ofrece al crear espacios nuevos.'),
      h('button', { class: 'btn btn-primary', onclick: () => abrirForm(null) }, ic('plus'), 'Nuevo tipo')),
    card,
  );

  function pintar(tipos) {
    if (!tipos.length) return card.replaceChildren(emptyState('tag', 'Sin tipos de espacio', 'Crea el primero.'));
    card.replaceChildren(h('div', { class: 'table-wrap' }, h('table', {},
      h('thead', {}, h('tr', {}, ['Tipo', 'Descripción', 'Estado', ''].map((t) => h('th', {}, t)))),
      h('tbody', {}, tipos.map((t) => h('tr', {},
        h('td', {}, h('div', { class: 'person' }, ic(iconoTipo(t.nombre), `stat-icon tone-${tonoTipo(t.id)}`), h('span', { class: 'cell-strong' }, t.nombre))),
        h('td', { class: 'muted' }, t.descripcion ?? '—'),
        h('td', {}, h('span', { class: `badge ${t.activo ? 'tone-success' : 'tone-neutral'}` }, t.activo ? 'Activo' : 'Inactivo')),
        h('td', {}, h('div', { class: 'row-actions' },
          h('button', { class: 'icon-btn sm', title: 'Editar', 'aria-label': 'Editar', icon: 'edit', onclick: () => abrirForm(t) }),
          t.activo && h('button', { class: 'icon-btn sm', title: 'Desactivar', 'aria-label': 'Desactivar', icon: 'ban', onclick: () => desactivar(t) }),
          h('button', { class: 'icon-btn sm danger', title: 'Eliminar', 'aria-label': 'Eliminar', icon: 'trash', onclick: () => eliminar(t) }))),
      ))))));
    card.querySelectorAll('.stat-icon').forEach((el) => { el.style.cssText = 'width:36px;height:36px;border-radius:10px;font-size:1rem'; });
  }

  function abrirForm(tipo) {
    const nombre = h('input', { type: 'text', maxlength: 100, value: tipo?.nombre ?? '', placeholder: 'Ej. Piscina' });
    const descripcion = h('textarea', { maxlength: 255, placeholder: 'Opcional' });
    descripcion.value = tipo?.descripcion ?? '';
    openModal({
      title: tipo ? 'Editar tipo' : 'Nuevo tipo de espacio',
      size: 'sm',
      body: h('div', { class: 'form-grid', style: 'grid-template-columns:1fr' },
        h('label', { class: 'field' }, 'Nombre', nombre),
        h('label', { class: 'field' }, 'Descripción', descripcion)),
      submitText: tipo ? 'Guardar cambios' : 'Crear tipo',
      onSubmit: async () => {
        const data = { nombre: nombre.value.trim(), descripcion: descripcion.value.trim() || null };
        if (!data.nombre) { modalError(['El nombre es obligatorio']); return false; }
        try {
          if (tipo) await tiposApi.updateTipo(tipo.id, data);
          else await tiposApi.createTipo(data);
        } catch (err) {
          modalError([err.message]);
          return false;
        }
        showAlert(tipo ? 'Tipo actualizado' : 'Tipo creado', 'success');
        cargar();
      },
    });
  }

  async function desactivar(t) {
    if (!(await confirmar(`"${t.nombre}" ya no se ofrecerá para espacios nuevos.`, { title: 'Desactivar tipo', okText: 'Desactivar' }))) return;
    try {
      await tiposApi.desactivarTipo(t.id);
      showAlert('Tipo desactivado', 'success');
      cargar();
    } catch (err) { showAlert(err.message); }
  }

  async function eliminar(t) {
    if (!(await confirmar(`Se eliminará "${t.nombre}". Si hay espacios de este tipo, la base de datos no lo permitirá.`, { title: 'Eliminar tipo' }))) return;
    try {
      await tiposApi.deleteTipo(t.id);
      showAlert('Tipo eliminado', 'success');
      cargar();
    } catch (err) { showAlert(err.message); }
  }

  async function cargar() {
    try {
      const { data } = await tiposApi.getTipos();
      pintar(data.sort((a, b) => b.activo - a.activo || a.nombre.localeCompare(b.nombre)));
    } catch (err) {
      showAlert(err.message);
      card.replaceChildren(emptyState('alert', 'No se pudieron cargar los tipos', err.message));
    }
  }

  await cargar();
}
