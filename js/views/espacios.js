import * as espaciosApi from '../api/espacios.api.js';
import { getTipos } from '../api/tipos.api.js';
import { h, ic, fillSelect, emptyState } from '../utils/dom.js';
import { hoyISO, iconoTipo, tonoTipo } from '../utils/format.js';
import { validarEspacio } from '../utils/validators.js';
import { openModal, modalError, confirmar } from '../components/modal.js';
import { abrirReservaForm } from '../components/reservaForm.js';
import { showAlert } from '../components/alert.js';

export const meta = { title: 'Espacios', subtitle: 'Áreas comunes disponibles para reservar' };

export async function render(view) {
  const state = { espacios: [], tipos: [], tipo: 'todos', verInactivos: false, disponibles: null, consulta: null };

  // ---- Buscador de disponibilidad ----
  const fDisp = {
    fecha: h('input', { class: 'input', type: 'date', value: hoyISO(), min: hoyISO() }),
    hora_inicio: h('input', { class: 'input', type: 'time', value: '09:00' }),
    hora_fin: h('input', { class: 'input', type: 'time', value: '10:00' }),
  };
  const btnLimpiar = h('button', { class: 'btn btn-ghost', hidden: true, onclick: () => { state.disponibles = null; btnLimpiar.hidden = true; pintar(); } }, ic('x'), 'Quitar filtro');
  const disponibilidad = h('section', { class: 'card' },
    h('header', { class: 'card-head' },
      h('div', {}, h('h2', {}, '¿Qué espacio está libre?'), h('p', { class: 'muted small' }, 'Consulta los espacios disponibles para una fecha y horario.'))),
    h('div', { class: 'card-body toolbar' },
      h('label', { class: 'field' }, 'Fecha', fDisp.fecha),
      h('label', { class: 'field' }, 'Desde', fDisp.hora_inicio),
      h('label', { class: 'field' }, 'Hasta', fDisp.hora_fin),
      h('div', { style: 'display:flex;gap:.5rem;align-self:end' },
        h('button', { class: 'btn btn-primary', onclick: buscarDisponibles }, ic('search'), 'Buscar'),
        btnLimpiar)));

  const tipoSel = h('select', { class: 'input', style: 'width:auto' });
  const inactivos = h('input', { type: 'checkbox' });
  const grid = h('div', { class: 'space-grid' }, Array.from({ length: 4 }, () => h('div', { class: 'card skeleton', style: 'height:250px' })));
  const resumen = h('p', { class: 'muted small grow' });

  view.replaceChildren(
    disponibilidad,
    h('div', { class: 'toolbar' },
      resumen,
      tipoSel,
      h('label', { class: 'check' }, inactivos, 'Mostrar inactivos'),
      h('button', { class: 'btn btn-primary', onclick: () => abrirForm(null) }, ic('plus'), 'Nuevo espacio')),
    grid,
  );

  tipoSel.addEventListener('change', () => { state.tipo = tipoSel.value; pintar(); });
  inactivos.addEventListener('change', () => { state.verInactivos = inactivos.checked; pintar(); });

  async function buscarDisponibles() {
    const params = { fecha: fDisp.fecha.value, hora_inicio: fDisp.hora_inicio.value, hora_fin: fDisp.hora_fin.value };
    if (!params.fecha || !params.hora_inicio || !params.hora_fin) return showAlert('Completa fecha y horario');
    if (params.hora_fin <= params.hora_inicio) return showAlert('La hora de fin debe ser mayor a la de inicio');
    try {
      const { data } = await espaciosApi.getDisponibles(params);
      state.disponibles = new Set(data.map((e) => e.id));
      state.consulta = params;
      btnLimpiar.hidden = false;
      pintar();
    } catch (err) {
      showAlert(err.message);
    }
  }

  function card(e) {
    const tone = tonoTipo(e.tipo_espacio_id);
    const libre = state.disponibles?.has(e.id);
    return h('article', { class: `card space-card ${e.activo ? '' : 'inactive'}` },
      h('div', { class: `space-cover tone-${tone}` },
        ic(iconoTipo(e.tipo_nombre)),
        state.disponibles
          ? h('span', { class: 'badge tone-success' }, 'Libre')
          : h('span', { class: `badge ${e.activo ? 'tone-success' : 'tone-neutral'}` }, e.activo ? 'Activo' : 'Inactivo')),
      h('div', { class: 'space-info' },
        h('span', { class: 'muted small' }, e.tipo_nombre),
        h('h3', {}, e.nombre),
        e.descripcion && h('p', { class: 'muted small' }, e.descripcion),
        h('div', { class: 'space-meta' },
          h('span', {}, ic('pin'), e.ubicacion),
          h('span', {}, ic('people'), `${e.capacidad} personas`))),
      h('footer', { class: 'space-foot' },
        e.activo
          ? h('button', {
              class: `btn btn-sm ${libre ? 'btn-primary' : 'btn-ghost'}`,
              onclick: () => abrirReservaForm(null, null, { espacio_id: e.id, ...(libre && { fecha_reserva: state.consulta.fecha, hora_inicio: state.consulta.hora_inicio, hora_fin: state.consulta.hora_fin }) }),
            }, ic('calendar'), 'Reservar')
          : h('span', { class: 'muted small', style: 'margin-right:auto;align-self:center' }, 'No disponible para reservas'),
        h('button', { class: 'icon-btn sm', title: 'Editar', 'aria-label': 'Editar', icon: 'edit', onclick: () => abrirForm(e) }),
        e.activo && h('button', { class: 'icon-btn sm', title: 'Desactivar', 'aria-label': 'Desactivar', icon: 'ban', onclick: () => desactivar(e) }),
        h('button', { class: 'icon-btn sm danger', title: 'Eliminar', 'aria-label': 'Eliminar', icon: 'trash', onclick: () => eliminar(e) })));
  }

  function pintar() {
    let lista = state.espacios;
    if (!state.verInactivos) lista = lista.filter((e) => e.activo);
    if (state.tipo !== 'todos') lista = lista.filter((e) => String(e.tipo_espacio_id) === state.tipo);
    if (state.disponibles) lista = lista.filter((e) => state.disponibles.has(e.id));

    resumen.textContent = state.disponibles
      ? `${lista.length} espacio(s) libre(s) el ${state.consulta.fecha} de ${state.consulta.hora_inicio} a ${state.consulta.hora_fin}`
      : `${lista.length} espacio(s)`;

    grid.replaceChildren(...(lista.length
      ? lista.map(card)
      : [h('div', { class: 'card', style: 'grid-column:1/-1' },
          emptyState('building', 'No hay espacios que mostrar', state.disponibles ? 'Ningún espacio está libre en ese horario.' : 'Ajusta los filtros o crea un espacio nuevo.'))]));
  }

  function abrirForm(espacio) {
    const inputs = {
      nombre: h('input', { type: 'text', maxlength: 100, placeholder: 'Ej. Salón social' }),
      tipo_espacio_id: h('select'),
      ubicacion: h('input', { type: 'text', maxlength: 150, placeholder: 'Ej. Torre A, nivel 1' }),
      capacidad: h('input', { type: 'number', min: 1, step: 1, placeholder: '20' }),
      descripcion: h('textarea', { maxlength: 255, placeholder: 'Opcional' }),
    };
    const tipos = state.tipos.filter((t) => t.activo || t.id === espacio?.tipo_espacio_id);
    fillSelect(inputs.tipo_espacio_id, tipos, (t) => t.nombre);
    if (espacio) {
      inputs.nombre.value = espacio.nombre;
      inputs.tipo_espacio_id.value = espacio.tipo_espacio_id;
      inputs.ubicacion.value = espacio.ubicacion;
      inputs.capacidad.value = espacio.capacidad;
      inputs.descripcion.value = espacio.descripcion ?? '';
    }

    openModal({
      title: espacio ? 'Editar espacio' : 'Nuevo espacio',
      body: h('div', { class: 'form-grid' },
        h('label', { class: 'field span-2' }, 'Nombre', inputs.nombre),
        h('label', { class: 'field' }, 'Tipo de espacio', inputs.tipo_espacio_id),
        h('label', { class: 'field' }, 'Capacidad (personas)', inputs.capacidad),
        h('label', { class: 'field span-2' }, 'Ubicación', inputs.ubicacion),
        h('label', { class: 'field span-2' }, 'Descripción', inputs.descripcion)),
      submitText: espacio ? 'Guardar cambios' : 'Crear espacio',
      onSubmit: async () => {
        const data = {
          nombre: inputs.nombre.value.trim(),
          tipo_espacio_id: Number(inputs.tipo_espacio_id.value),
          ubicacion: inputs.ubicacion.value.trim(),
          capacidad: Number(inputs.capacidad.value),
          descripcion: inputs.descripcion.value.trim() || null,
        };
        const errores = validarEspacio(data);
        if (errores.length) { modalError(errores); return false; }
        try {
          if (espacio) await espaciosApi.updateEspacio(espacio.id, data);
          else await espaciosApi.createEspacio(data);
        } catch (err) {
          modalError([err.message]);
          return false;
        }
        showAlert(espacio ? 'Espacio actualizado' : 'Espacio creado', 'success');
        cargar();
      },
    });
  }

  async function desactivar(e) {
    const ok = await confirmar(`"${e.nombre}" dejará de aparecer para nuevas reservas. Las reservas existentes se conservan.`, { title: 'Desactivar espacio', okText: 'Desactivar' });
    if (!ok) return;
    try {
      await espaciosApi.desactivarEspacio(e.id);
      showAlert('Espacio desactivado', 'success');
      cargar();
    } catch (err) {
      showAlert(err.message);
    }
  }

  async function eliminar(e) {
    const ok = await confirmar(`Se eliminará "${e.nombre}" de forma permanente. Si tiene reservas asociadas, la base de datos no lo permitirá; en ese caso desactívalo.`, { title: 'Eliminar espacio' });
    if (!ok) return;
    try {
      await espaciosApi.deleteEspacio(e.id);
      showAlert('Espacio eliminado', 'success');
      cargar();
    } catch (err) {
      showAlert(err.message);
    }
  }

  async function cargar() {
    try {
      const [esp, tip] = await Promise.all([espaciosApi.getEspacios(), getTipos()]);
      state.espacios = esp.data;
      state.tipos = tip.data;
      fillSelect(tipoSel, state.tipos, (t) => t.nombre, 'Todos los tipos');
      tipoSel.options[0].value = 'todos';
      tipoSel.value = state.tipo;
      pintar();
    } catch (err) {
      showAlert(err.message);
      grid.replaceChildren(h('div', { class: 'card', style: 'grid-column:1/-1' }, emptyState('alert', 'No se pudieron cargar los espacios', err.message)));
    }
  }

  await cargar();
}
