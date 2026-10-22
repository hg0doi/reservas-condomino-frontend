export function validarReserva({ residente_id, espacio_id, fecha, hora_inicio, hora_fin }) {
  const errores = [];
  if (!residente_id) errores.push('Seleccione un residente');
  if (!espacio_id) errores.push('Seleccione un espacio');
  if (!fecha) errores.push('La fecha es obligatoria');
  if (!hora_inicio || !hora_fin) errores.push('Indique hora de inicio y fin');
  if (hora_inicio && hora_fin && hora_fin <= hora_inicio)
    errores.push('La hora de fin debe ser mayor a la de inicio');
  const hoy = new Date().toISOString().split('T')[0];
  if (fecha && fecha < hoy) errores.push('La fecha no puede ser pasada');
  return errores;
}
