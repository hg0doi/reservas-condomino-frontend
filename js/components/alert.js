import { h, ic } from '../utils/dom.js';

// Notificación flotante (toast). Usa textContent vía h(), no innerHTML (evita XSS).
export function showAlert(mensaje, tipo = 'error') {
  const cont = document.getElementById('toasts');
  const toast = h('div', { class: `toast ${tipo}`, role: tipo === 'error' ? 'alert' : 'status' },
    ic(tipo === 'error' ? 'alert' : 'checkCircle'),
    h('span', {}, mensaje));
  cont.append(toast);
  setTimeout(() => {
    toast.classList.add('leaving');
    setTimeout(() => toast.remove(), 200);
  }, 4000);
}
