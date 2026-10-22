import * as reservasApi from './api/reservas.api.js';
import { getEspacios } from './api/espacios.api.js';
import { getResidentes } from './api/residentes.api.js';
import { initForm, fillSelect, setFormData, resetForm } from './components/reservaForm.js';
import { renderReservas } from './components/reservaTable.js';
import { showAlert } from './components/alert.js';

async function cargarReservas() {
  try {
    const { data } = await reservasApi.getReservas();
    renderReservas(data, { onEdit: setFormData, onDelete: eliminar });
  } catch (err) {
    showAlert(err.message);
  }
}

async function guardar(id, body) {
  try {
    if (id) await reservasApi.updateReserva(id, body);
    else await reservasApi.createReserva(body);
    showAlert(id ? 'Reserva actualizada' : 'Reserva creada', 'success');
    resetForm();
    await cargarReservas();
  } catch (err) {
    showAlert(err.message);   // aquí aparece el 409 de traslape
  }
}

async function eliminar(id) {
  if (!confirm('¿Eliminar esta reserva?')) return;
  try {
    await reservasApi.deleteReserva(id);
    showAlert('Reserva eliminada', 'success');
    await cargarReservas();
  } catch (err) {
    showAlert(err.message);
  }
}

async function init() {
  try {
    const [esp, res] = await Promise.all([getEspacios(), getResidentes()]);
    fillSelect(document.getElementById('espacio_id'), esp.data, (e) => `${e.nombre} (${e.tipo})`);
    fillSelect(document.getElementById('residente_id'), res.data, (r) => `${r.nombre} - ${r.apartamento}`);
  } catch (err) {
    showAlert(err.message);
  }
  initForm({ onSubmit: guardar });
  await cargarReservas();
}

init();
