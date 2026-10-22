import { validarReserva } from '../utils/validators.js';
import { showAlert } from './alert.js';

const form = document.getElementById('reserva-form');
const $ = (id) => document.getElementById(id);

export function fillSelect(select, items, labelFn) {
  select.replaceChildren(new Option('-- Seleccione --', ''));
  items.forEach((i) => select.append(new Option(labelFn(i), i.id)));
}

export function setFormData(r) {
  $('reserva-id').value = r.id;
  $('residente_id').value = r.residente_id;
  $('espacio_id').value = r.espacio_id;
  $('fecha').value = r.fecha.slice(0, 10);
  $('hora_inicio').value = r.hora_inicio.slice(0, 5);
  $('hora_fin').value = r.hora_fin.slice(0, 5);
  $('notas').value = r.notas ?? '';
  $('btn-guardar').textContent = 'Actualizar';
  $('btn-cancelar').hidden = false;
}

export function resetForm() {
  form.reset();
  $('reserva-id').value = '';
  $('btn-guardar').textContent = 'Reservar';
  $('btn-cancelar').hidden = true;
}

export function initForm({ onSubmit }) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      residente_id: Number($('residente_id').value),
      espacio_id: Number($('espacio_id').value),
      fecha: $('fecha').value,
      hora_inicio: $('hora_inicio').value,
      hora_fin: $('hora_fin').value,
      notas: $('notas').value.trim(),
    };
    const errores = validarReserva(data);
    if (errores.length) return showAlert(errores.join('. '));
    await onSubmit($('reserva-id').value || null, data);
  });
  $('btn-cancelar').addEventListener('click', resetForm);
}
