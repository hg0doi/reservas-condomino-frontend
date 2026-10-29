import * as reservasApi from '../api/reservas.api.js';
import { getEspacios } from '../api/espacios.api.js';
import { getUsuarios } from '../api/usuarios.api.js';
import { getEstados } from '../api/estados.api.js';
import { h, ic, fillSelect } from '../utils/dom.js';
import { soloFecha, soloHora, hoyISO } from '../utils/format.js';
import { validarReserva } from '../utils/validators.js';
import { openModal, modalError } from './modal.js';
import { showAlert } from './alert.js';
import { getUsuario } from '../auth.js';

const field = (label, control, extra = {}) => h('label', { class: `field ${extra.class ?? ''}` }, label, control, extra.hint && h('span', { class: 'hint' }, extra.hint));

/**
 * Abre el modal para crear o editar una reserva.
 * @param {Object|null} reserva  Reserva a editar o null para crear.
 * @param {Function} onSaved     Se llama tras guardar con éxito.
 * @param {Object} [prefill]     Valores iniciales al crear (espacio_id, fecha_reserva...).
 */
export async function abrirReservaForm(reserva, onSaved, prefill = {}) {
  let catalogos;
  try {
    const [esp, usu, est] = await Promise.all([getEspacios(), getUsuarios(), getEstados()]);
    catalogos = { espacios: esp.data, usuarios: usu.data, estados: est.data };
  } catch (err) {
    return showAlert(err.message);
  }

  const esNueva = !reserva;
  const inputs = {
    usuario_id: h('select', { required: true }),
    nombre_cliente: h('input', { type: 'text', maxlength: 150, required: true, placeholder: 'Ej. María López' }),
    espacio_id: h('select', { required: true }),
    estado_id: h('select', { required: true }),
    fecha_reserva: h('input', { type: 'date', required: true, min: esNueva ? hoyISO() : undefined }),
    hora_inicio: h('input', { type: 'time', required: true }),
    hora_fin: h('input', { type: 'time', required: true }),
    motivo: h('input', { type: 'text', maxlength: 255, required: true, placeholder: 'Ej. Reunión de la junta directiva' }),
    observaciones: h('textarea', { maxlength: 255, placeholder: 'Opcional' }),
  };

  // Al crear solo se ofrecen espacios activos; al editar se mantiene el actual aunque esté inactivo
  const espacios = catalogos.espacios.filter((e) => e.activo || e.id === reserva?.espacio_id);
  fillSelect(inputs.espacio_id, espacios, (e) => `${e.nombre} · ${e.tipo_nombre} (cap. ${e.capacidad})`);
  fillSelect(inputs.usuario_id, catalogos.usuarios, (u) => `${u.nombre} ${u.apellido}`);
  fillSelect(inputs.estado_id, catalogos.estados, (e) => e.nombre);

  if (reserva) {
    inputs.usuario_id.value = reserva.usuario_id;
    inputs.nombre_cliente.value = reserva.nombre_cliente;
    inputs.espacio_id.value = reserva.espacio_id;
    inputs.estado_id.value = reserva.estado_id;
    inputs.fecha_reserva.value = soloFecha(reserva.fecha_reserva);
    inputs.hora_inicio.value = soloHora(reserva.hora_inicio);
    inputs.hora_fin.value = soloHora(reserva.hora_fin);
    inputs.motivo.value = reserva.motivo;
    inputs.observaciones.value = reserva.observaciones ?? '';
  } else {
    const yo = getUsuario();
    if (yo && catalogos.usuarios.some((u) => u.id === yo.id)) inputs.usuario_id.value = yo.id;
    const pendiente = catalogos.estados.find((e) => e.nombre.toLowerCase() === 'pendiente');
    if (pendiente) inputs.estado_id.value = pendiente.id;
    inputs.fecha_reserva.value = prefill.fecha_reserva ?? hoyISO();
    if (prefill.espacio_id) inputs.espacio_id.value = prefill.espacio_id;
    if (prefill.hora_inicio) inputs.hora_inicio.value = prefill.hora_inicio;
    if (prefill.hora_fin) inputs.hora_fin.value = prefill.hora_fin;
  }

  // ----- Disponibilidad en vivo -----
  const disponibilidad = h('div', { hidden: true });
  let timer;
  let consulta = 0;

  async function revisarDisponibilidad() {
    const params = {
      espacio_id: inputs.espacio_id.value,
      fecha: inputs.fecha_reserva.value,
      hora_inicio: inputs.hora_inicio.value,
      hora_fin: inputs.hora_fin.value,
    };
    if (!params.espacio_id || !params.fecha || !params.hora_inicio || !params.hora_fin || params.hora_fin <= params.hora_inicio) {
      disponibilidad.hidden = true;
      return;
    }
    const id = ++consulta;
    try {
      const { data } = await reservasApi.verificarDisponibilidad(params);
      if (id !== consulta) return; // llegó una respuesta más nueva
      // Al editar, la propia reserva no cuenta como conflicto
      const conflictos = data.conflictos.filter((c) => c.id !== reserva?.id);
      disponibilidad.hidden = false;
      if (conflictos.length === 0) {
        disponibilidad.className = 'availability tone-success span-2';
        disponibilidad.replaceChildren(ic('checkCircle'), h('span', {}, 'Espacio disponible en ese horario'));
      } else {
        disponibilidad.className = 'availability tone-danger span-2';
        disponibilidad.replaceChildren(ic('alert'), h('div', {},
          h('span', {}, 'Choca con otra reserva:'),
          h('ul', {}, conflictos.map((c) => h('li', {}, `${soloHora(c.hora_inicio)} - ${soloHora(c.hora_fin)} · ${c.nombre_cliente} (${c.estado_nombre})`)))));
      }
    } catch {
      disponibilidad.hidden = true;
    }
  }
  ['espacio_id', 'fecha_reserva', 'hora_inicio', 'hora_fin'].forEach((k) =>
    inputs[k].addEventListener('change', () => {
      clearTimeout(timer);
      timer = setTimeout(revisarDisponibilidad, 250);
    }));

  const body = h('div', { class: 'form-grid' },
    field('Espacio', inputs.espacio_id, { class: 'span-2' }),
    field('Fecha', inputs.fecha_reserva),
    h('div', { class: 'form-grid', style: 'gap:.75rem;grid-template-columns:1fr 1fr' },
      field('Inicio', inputs.hora_inicio),
      field('Fin', inputs.hora_fin)),
    disponibilidad,
    field('Nombre del cliente', inputs.nombre_cliente),
    field('Registrado por', inputs.usuario_id),
    field('Motivo', inputs.motivo, { class: 'span-2' }),
    field('Estado', inputs.estado_id),
    h('div'),
    field('Observaciones', inputs.observaciones, { class: 'span-2' }),
  );

  openModal({
    title: esNueva ? 'Nueva reserva' : 'Editar reserva',
    body,
    submitText: esNueva ? 'Crear reserva' : 'Guardar cambios',
    onSubmit: async () => {
      const data = {
        usuario_id: Number(inputs.usuario_id.value),
        espacio_id: Number(inputs.espacio_id.value),
        estado_id: Number(inputs.estado_id.value),
        fecha_reserva: inputs.fecha_reserva.value,
        hora_inicio: inputs.hora_inicio.value,
        hora_fin: inputs.hora_fin.value,
        nombre_cliente: inputs.nombre_cliente.value.trim(),
        motivo: inputs.motivo.value.trim(),
        observaciones: inputs.observaciones.value.trim() || null,
      };
      const errores = validarReserva(data, { esNueva });
      if (errores.length) {
        modalError(errores);
        return false;
      }
      try {
        if (esNueva) await reservasApi.createReserva(data);
        else await reservasApi.updateReserva(reserva.id, data);
      } catch (err) {
        modalError([err.message]); // aquí aparece el 409 de traslape
        return false;
      }
      showAlert(esNueva ? 'Reserva creada' : 'Reserva actualizada', 'success');
      onSaved?.();
    },
  });

  if (!esNueva || prefill.espacio_id) revisarDisponibilidad();
}
