# ReservaSpace — Frontend

Interfaz web del sistema de reserva de espacios del condominio (salas, canchas, aulas, auditorios).

## Tecnologías
HTML5, CSS3 (variables, grid, tema claro/oscuro) y JavaScript (ES Modules), sin frameworks ni build.

## Funcionalidades
- **Login** contra `POST /api/auth/login`.
- **Dashboard**: reservas de hoy, próximas, pendientes, espacios activos y uso por espacio.
- **Reservas**: crear, editar, eliminar, cambiar estado desde la tabla, filtros por estado/fecha y búsqueda.
  El formulario verifica la **disponibilidad en vivo** (`/reservas/verificar-disponibilidad`) y muestra los choques de horario.
- **Espacios**: tarjetas con CRUD, desactivar y buscador de espacios libres por fecha y horario (`/espacios/obtener-disponibles`).
- **Tipos de espacio** y **Estados de reserva**: CRUD.
- **Usuarios**: listado (solo lectura).

## Estructura
```
index.html
css/        base.css (tokens y tema) · layout.css (login, sidebar) · components.css
js/
  config.js         URL de la API
  main.js           login, router por hash, tema
  auth.js           sesión en sessionStorage
  api/              un módulo por recurso del backend
  components/       modal, notificaciones, formulario de reserva
  views/            dashboard, reservas, espacios, tipos, estados, usuarios
  utils/            helpers DOM, iconos, formato de fechas, validaciones
```

## Ejecutar
1. Levanta el backend (`npm run dev` en `backend/`). Por defecto corre en `http://localhost:4000`.
   Si usas otro puerto, cambia `API_URL` en `js/config.js`.
2. Sirve esta carpeta con un servidor estático, por ejemplo:
   ```
   python -m http.server 5500
   ```
   o con la extensión **Live Server** de VS Code. Abre `http://localhost:5500`.

> No abras `index.html` con doble clic: los ES Modules no cargan desde `file://`.
