import { icon } from './icons.js';

/**
 * Crea elementos sin usar innerHTML con datos del servidor (evita XSS).
 * h('button', { class: 'btn', onclick: fn }, 'Texto', otroNodo)
 * Atributos especiales: on* (eventos), icon (nombre de icono), dataset (objeto).
 */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs ?? {})) {
    if (v === undefined || v === null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'icon') el.innerHTML = icon(v);
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (k === 'value') el.value = v;
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, v);
  }
  el.append(...children.flat().filter((c) => c !== null && c !== undefined && c !== false));
  return el;
}

// <span data-icon> listo para usar dentro de h()
export const ic = (name, cls = '') => h('span', { class: cls, icon: name, dataset: { icon: name } });

export function fillSelect(select, items, labelFn, placeholder = '-- Seleccione --') {
  select.replaceChildren(new Option(placeholder, ''));
  items.forEach((i) => select.append(new Option(labelFn(i), i.id)));
}

export function iniciales(nombre = '') {
  return nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?';
}

export function emptyState(iconName, titulo, texto) {
  return h('div', { class: 'empty' }, ic(iconName), h('strong', {}, titulo), h('p', { class: 'small' }, texto));
}

export function skeletonRows(n = 4, height = 44) {
  return h('div', { class: 'card-body', style: 'display:grid;gap:.75rem' },
    Array.from({ length: n }, () => h('div', { class: 'skeleton', style: `height:${height}px` })));
}
