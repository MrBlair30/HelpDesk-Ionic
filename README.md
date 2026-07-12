# Mesa de Ayuda e Incidencias • Ionic Angular & SQLite Local
**Actividad 11: Persistencia local y CRUD con SQLite en Arquitectura por Capas**

[![Ionic](https://img.shields.io/badge/Ionic-8.x-38bdf8?style=for-the-badge&logo=ionic)](https://ionicframework.com/)
[![Angular](https://img.shields.io/badge/Angular-20%20Standalone-dd0031?style=for-the-badge&logo=angular)](https://angular.io/)
[![Capacitor](https://img.shields.io/badge/Capacitor-8.x-119eff?style=for-the-badge&logo=capacitor)](https://capacitorjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-Local%20Persistence-003b57?style=for-the-badge&logo=sqlite)](https://www.sqlite.org/)

Aplicación móvil moderna diseñada con una **estética WOW Premium** (Dark/Light mode con glassmorphism) y construida en **Ionic Angular Standalone con Capacitor Android y SQLite local** (`@capacitor-community/sqlite` + `jeep-sqlite`).

---

## Características Principales y Arquitectura
El proyecto sigue rigurosamente los principios de **Arquitectura por Capas**:

1. **Capa de Base de Datos / Infraestructura (`src/app/database/`)**
   - `sqlite.service.ts`: Servicio de gestión y ciclo de vida de la conexión a SQLite con compatibilidad dual (Motor nativo para Android/iOS e IndexedDB vía `jeep-sqlite` para desarrollo Web).
   - `schema.sql.ts`: Script DDL para inicialización y creación de la tabla principal `incidencias` con índices optimizados.
   - `seed-data.ts`: Script DML con **6 registros semilla de prueba** realistas y variados insertados automáticamente en el primer arranque.

2. **Capa de Modelos y Tipado (`src/app/models/`)**
   - `incident.model.ts`: Entidad `Incident`, DTOs de creación (`CreateIncidentDto`) y modificación (`UpdateIncidentDto`), además de constantes de categorización y paleta de colores/iconos.

3. **Capa de Dominio y Servicios (`src/app/services/`)**
   - `incident.service.ts`: Servicio CRUD completo (`create`, `findAll`, `findById`, `update`, `delete`) impulsado por **Angular Signals** y `computed()` para actualización instantánea y reactiva de la UI sin necesidad de suscripciones complejas.

4. **Capa de Presentación UI (`src/app/pages/` & `src/app/components/`)**
   - **Dashboard & Listado (`/incidents`)**: Panel de métricas en vivo, búsqueda interactiva por código/usuario/título, filtros por categoría/prioridad y tarjetas estilo *Glassmorphism*.
   - **Formulario Modal (`IncidentFormModalComponent`)**: Alta y edición de incidencias con validaciones reactivas en tiempo real.
   - **Detalle e Interacción (`/incidents/:id`)**: Consulta por ID en SQLite, visualización técnica y botones de transición rápida de estado (`Abierta` ➔ `En Proceso` ➔ `Resuelta` ➔ `Cerrada`).

---

## Archivos Entregables Destacados (Rúbrica)
- [`SCRIPT_SQL_Y_SEMILLA.sql`](./SCRIPT_SQL_Y_SEMILLA.sql): Script DDL + DML independiente con la creación exacta de la tabla e inserción de las 6 incidencias iniciales.
- [`BITACORA_TECNICA.md`](./BITACORA_TECNICA.md): Bitácora técnica corta con las incidencias resueltas durante el desarrollo (compatibilidad Web/Android, inyectores estables Angular y reinicio de semilla).

---

## Instrucciones de Instalación y Ejecución

### 1. Requisitos Previos
- **Node.js** v20 o superior (Verificado con v22.17.0).
- **npm** v10 o superior.
- **Ionic CLI** instalado globalmente:
  ```bash
  npm install -g @ionic/cli
  ```

### 2. Instalación de Dependencias
Abre la terminal en la carpeta raíz del proyecto y ejecuta:
```bash
npm install
```

### 3. Ejecución en Navegador (Desarrollo / Revisión Web con `jeep-sqlite`)
Para probar el 100% de la funcionalidad (tablas, datos semilla, búsqueda y CRUD en tiempo real) desde tu navegador:
```bash
ionic serve
```
> El servicio detectará la plataforma `web` y montará automáticamente el almacén virtual con `jeep-sqlite`. Puedes pulsar el botón de cabecera **"SQLite OK"** y elegir **"Restaurar Datos Semilla"** para devolver la BD a su estado de fábrica en cualquier momento.

### 4. Compilación y Despliegue Nativo en Android (Capacitor)
Para ejecutar o generar el APK nativo con SQLite nativo de Android:
```bash
# 1. Compilar el bundle web
npm run build

# 2. Sincronizar activos con la plataforma Android
npx cap sync android

# 3. Abrir en Android Studio (o ejecutar directamente si tienes emulador/dispositivo USB conectado)
npx cap open android
# ó
ionic capacitor run android
```

---
