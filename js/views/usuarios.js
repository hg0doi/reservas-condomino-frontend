import { getUsuarios } from '../api/usuarios.api.js';
import { h, emptyState, skeletonRows, iniciales } from '../utils/dom.js';
import { showAlert } from '../components/alert.js';

export const meta = { title: 'Usuarios', subtitle: 'Personas con acceso al sistema' };

export async function render(view) {
  const soloActivos = h('input', { type: 'checkbox', checked: true });
  const card = h('section', { class: 'card' }, skeletonRows(3));
  view.replaceChildren(
    h('div', { class: 'toolbar' },
      h('p', { class: 'muted grow' }, 'Listado de solo lectura. Los usuarios se administran desde la base de datos.'),
      h('label', { class: 'check' }, soloActivos, 'Solo activos')),
    card,
  );
  soloActivos.addEventListener('change', cargar);

  async function cargar() {
    try {
      const { data } = await getUsuarios(soloActivos.checked);
      if (!data.length) return card.replaceChildren(emptyState('users', 'Sin usuarios', 'No hay usuarios que mostrar.'));
      card.replaceChildren(h('div', { class: 'table-wrap' }, h('table', {},
        h('thead', {}, h('tr', {}, ['Usuario', 'Correo', 'Teléfono', 'Estado'].map((t) => h('th', {}, t)))),
        h('tbody', {}, data.map((u) => h('tr', {},
          h('td', {}, h('div', { class: 'person' }, h('span', { class: 'avatar sm' }, iniciales(`${u.nombre} ${u.apellido}`)), h('span', { class: 'cell-strong' }, `${u.nombre} ${u.apellido}`))),
          h('td', {}, u.correo),
          h('td', { class: 'muted' }, u.telefono ?? '—'),
          h('td', {}, h('span', { class: `badge ${u.activo ? 'tone-success' : 'tone-neutral'}` }, u.activo ? 'Activo' : 'Inactivo')),
        ))))));
    } catch (err) {
      showAlert(err.message);
      card.replaceChildren(emptyState('alert', 'No se pudieron cargar los usuarios', err.message));
    }
  }

  await cargar();
}
