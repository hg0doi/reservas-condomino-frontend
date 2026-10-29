import { h } from '../utils/dom.js';

const dialog = document.getElementById('modal');
const form = document.getElementById('modal-form');
const titleEl = document.getElementById('modal-title');
const bodyEl = document.getElementById('modal-body');
const footEl = document.getElementById('modal-foot');

let submitHandler = null;

document.getElementById('modal-close').addEventListener('click', () => closeModal());

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!submitHandler) return closeModal();
  const btn = footEl.querySelector('[type="submit"]');
  if (btn) btn.disabled = true;
  try {
    // El handler devuelve false para mantener el modal abierto (p.ej. error de validación)
    const ok = await submitHandler();
    if (ok !== false) closeModal();
  } finally {
    if (btn) btn.disabled = false;
  }
});

/**
 * Abre el modal.
 * @param {Object} o
 * @param {string} o.title
 * @param {Node} o.body          Contenido del cuerpo.
 * @param {string} [o.submitText]
 * @param {string} [o.submitClass]
 * @param {Function} [o.onSubmit] async; devolver false mantiene el modal abierto.
 * @param {'sm'} [o.size]
 */
export function openModal({ title, body, submitText = 'Guardar', submitClass = 'btn-primary', onSubmit, size }) {
  titleEl.textContent = title;
  bodyEl.replaceChildren(body);
  footEl.replaceChildren(
    h('button', { type: 'button', class: 'btn btn-ghost', onclick: () => closeModal() }, 'Cancelar'),
    h('button', { type: 'submit', class: `btn ${submitClass}` }, submitText),
  );
  submitHandler = onSubmit;
  dialog.classList.toggle('sm', size === 'sm');
  dialog.showModal();
  bodyEl.querySelector('input, select, textarea')?.focus();
}

export function closeModal() {
  submitHandler = null;
  if (dialog.open) dialog.close();
}

// Confirmación con promesa: if (await confirmar('¿Eliminar?')) ...
export function confirmar(mensaje, { title = 'Confirmar acción', okText = 'Eliminar', danger = true } = {}) {
  return new Promise((resolve) => {
    let respondido = false;
    const responder = (v) => { if (!respondido) { respondido = true; resolve(v); } };
    dialog.addEventListener('close', () => responder(false), { once: true });
    openModal({
      title,
      size: 'sm',
      body: h('p', { class: 'muted' }, mensaje),
      submitText: okText,
      submitClass: danger ? 'btn-danger' : 'btn-primary',
      onSubmit: () => responder(true),
    });
  });
}

// Muestra errores dentro del modal (antes del pie)
export function modalError(mensajes) {
  bodyEl.querySelector('.form-error')?.remove();
  if (!mensajes?.length) return;
  bodyEl.append(h('p', { class: 'form-error', role: 'alert' }, mensajes.join('. ')));
}
