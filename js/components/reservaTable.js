export function renderReservas(reservas, { onEdit, onDelete }) {
  const tbody = document.getElementById('reservas-body');
  tbody.replaceChildren();

  if (reservas.length === 0) {
    const tr = tbody.insertRow();
    const td = tr.insertCell();
    td.colSpan = 5;
    td.textContent = 'No hay reservas registradas';
    return;
  }

  for (const r of reservas) {
    const tr = tbody.insertRow();
    tr.insertCell().textContent = r.espacio;
    tr.insertCell().textContent = `${r.residente} (${r.apartamento})`;
    tr.insertCell().textContent = r.fecha.slice(0, 10);
    tr.insertCell().textContent = `${r.hora_inicio.slice(0, 5)} - ${r.hora_fin.slice(0, 5)}`;

    const acciones = tr.insertCell();
    const btnEdit = document.createElement('button');
    btnEdit.textContent = 'Editar';
    btnEdit.addEventListener('click', () => onEdit(r));
    const btnDel = document.createElement('button');
    btnDel.textContent = 'Eliminar';
    btnDel.addEventListener('click', () => onDelete(r.id));
    acciones.append(btnEdit, btnDel);
  }
}
