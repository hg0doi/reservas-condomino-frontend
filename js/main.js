import { login, health } from './api/auth.api.js';
import { getUsuario, setUsuario, cerrarSesion } from './auth.js';
import { hydrateIcons, icon } from './utils/icons.js';
import { iniciales } from './utils/dom.js';
import { closeModal } from './components/modal.js';
import * as dashboard from './views/dashboard.js';
import * as reservas from './views/reservas.js';
import * as espacios from './views/espacios.js';
import * as tipos from './views/tipos.js';
import * as estados from './views/estados.js';
import * as usuarios from './views/usuarios.js';

const routes = { dashboard, reservas, espacios, tipos, estados, usuarios };

const $ = (id) => document.getElementById(id);
const app = $('app');
const loginScreen = $('login-screen');
const view = $('view');

// ===== Tema claro / oscuro =====
const THEME_KEY = 'reservaspace.tema';
function aplicarTema(tema) {
  document.documentElement.dataset.theme = tema;
  $('theme-btn').innerHTML = icon(tema === 'dark' ? 'sun' : 'moon');
}
let temaGuardado = null;
try { temaGuardado = localStorage.getItem(THEME_KEY); } catch { /* sin almacenamiento */ }
aplicarTema(temaGuardado ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
$('theme-btn').addEventListener('click', () => {
  const nuevo = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  aplicarTema(nuevo);
  try { localStorage.setItem(THEME_KEY, nuevo); } catch { /* sin almacenamiento */ }
});

// ===== Router por hash (#/reservas) =====
async function navegar() {
  const nombre = location.hash.replace('#/', '') || 'dashboard';
  const ruta = routes[nombre];
  if (!ruta) { location.hash = '#/dashboard'; return; }

  closeModal();
  app.classList.remove('nav-open');
  document.querySelectorAll('.nav a').forEach((a) => a.classList.toggle('active', a.dataset.route === nombre));
  $('page-title').textContent = ruta.meta.title;
  const sub = ruta.meta.subtitle;
  $('page-subtitle').textContent = typeof sub === 'function' ? sub() : sub;
  document.title = `${ruta.meta.title} · ReservaSpace`;
  view.focus({ preventScroll: true });
  window.scrollTo(0, 0);
  await ruta.render(view);
}

// ===== Estado de la API =====
async function revisarApi() {
  const el = $('api-status');
  try {
    await health();
    el.className = 'api-status ok';
    el.querySelector('.label').textContent = 'API conectada';
  } catch {
    el.className = 'api-status down';
    el.querySelector('.label').textContent = 'API sin conexión';
  }
}

// ===== Sesión =====
function mostrarApp(usuario) {
  const nombre = `${usuario.nombre} ${usuario.apellido}`;
  $('user-name').textContent = nombre;
  $('user-mail').textContent = usuario.correo;
  $('user-avatar').textContent = iniciales(nombre);
  loginScreen.hidden = true;
  app.hidden = false;
  revisarApi();
  navegar();
}

function mostrarLogin() {
  app.hidden = true;
  loginScreen.hidden = false;
  $('login-correo').focus();
}

$('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const correo = $('login-correo').value.trim();
  const password = $('login-password').value;
  const error = $('login-error');
  const btn = $('login-btn');
  error.hidden = true;
  if (!correo || !password) {
    error.textContent = 'Ingresa tu correo y contraseña';
    error.hidden = false;
    return;
  }
  btn.disabled = true;
  btn.textContent = 'Entrando…';
  try {
    const { data } = await login(correo, password);
    setUsuario(data);
    $('login-password').value = '';
    if (!location.hash) location.hash = '#/dashboard';
    mostrarApp(data);
  } catch (err) {
    error.textContent = err.message;
    error.hidden = false;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Entrar';
  }
});

$('logout-btn').addEventListener('click', () => {
  cerrarSesion();
  mostrarLogin();
});

// ===== Menú móvil =====
$('menu-btn').addEventListener('click', () => app.classList.add('nav-open'));
$('sidebar-backdrop').addEventListener('click', () => app.classList.remove('nav-open'));

window.addEventListener('hashchange', () => { if (getUsuario()) navegar(); });

// ===== Inicio =====
hydrateIcons();
const usuario = getUsuario();
if (usuario) mostrarApp(usuario);
else mostrarLogin();
