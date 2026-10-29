import { hoyISO } from './format.js';

// esNueva: solo al crear se impide una fecha pasada (editar reservas antiguas sí se permite)
export function validarReserva({ usuario_id, espacio_id, estado_id, fecha_reserva, hora_inicio, hora_fin, nombre_cliente, motivo }, { esNueva = true } = {}) {
  const errores = [];
  if (!usuario_id) errores.push('Seleccione un usuario');
  if (!espacio_id) errores.push('Seleccione un espacio');
  if (!estado_id) errores.push('Seleccione un estado');
  if (!nombre_cliente) errores.push('El nombre del cliente es obligatorio');
  if (!motivo) errores.push('El motivo es obligatorio');
  if (!fecha_reserva) errores.push('La fecha es obligatoria');
  if (!hora_inicio || !hora_fin) errores.push('Indique hora de inicio y fin');
  if (hora_inicio && hora_fin && hora_fin <= hora_inicio)
    errores.push('La hora de fin debe ser mayor a la de inicio');
  if (esNueva && fecha_reserva && fecha_reserva < hoyISO()) errores.push('La fecha no puede ser pasada');
  return errores;
}

export function validarEspacio({ nombre, ubicacion, capacidad, tipo_espacio_id }) {
  const errores = [];
  if (!nombre) errores.push('El nombre es obligatorio');
  if (!ubicacion) errores.push('La ubicación es obligatoria');
  if (!Number.isInteger(capacidad) || capacidad <= 0) errores.push('La capacidad debe ser un número entero mayor a 0');
  if (!tipo_espacio_id) errores.push('Seleccione un tipo de espacio');
  return errores;
}
