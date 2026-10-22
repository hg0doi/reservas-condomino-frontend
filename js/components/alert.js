export function showAlert(mensaje, tipo = 'error') {
  const el = document.getElementById('alert');
  el.textContent = mensaje;          // textContent, no innerHTML (evita XSS)
  el.className = `alert alert-${tipo}`;
  el.hidden = false;
  setTimeout(() => (el.hidden = true), 4000);
}
