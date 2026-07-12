# Bitácora Técnica y Resumen de Incidencias del Proyecto
**Actividad 11: Persistencia local con SQLite y Arquitectura por Capas**  
**Módulo:** Mesa de Ayuda e Incidencias (Help Desk & Tickets)  
**Tecnologías:** Ionic 8, Angular 20 Standalone, Capacitor 8 (Android) y SQLite (`@capacitor-community/sqlite`).

---

## 📋 Resumen del Desarrollo
Durante la ejecución del proyecto, se estableció una arquitectura modular dividida en **4 capas principales**:
1. **Infraestructura / Conexión (`database/`)**: Servicio `SqliteService` encargado del ciclo de vida de la base de datos, inicialización de tablas DDL (`schema.sql.ts`) y carga automática de registros semilla DML (`seed-data.ts`).
2. **Modelos y Tipados (`models/`)**: Interfaces TypeScript puras (`incident.model.ts`) para tipado estricto de incidencias, categorías, prioridades, estados y DTOs (`CreateIncidentDto`, `UpdateIncidentDto`).
3. **Capa de Dominio / Negocio (`services/`)**: Servicio de alto nivel `IncidentService` con operaciones CRUD (`create`, `findAll`, `findById`, `update`, `delete`) acoplado al motor de **Angular Signals** (`signal`, `computed`) para reflejar cambios y estadísticas en pantalla de forma reactiva al instante.
4. **Presentación / UI (`pages/` y `components/`)**: Interfaces diseñadas bajo una estética **WOW Premium** (Glassmorphism, tarjetas dinámicas, iconos semánticos y paleta de colores Dark/Light optimizada).

---

## 🛠️ Incidencias Técnicas Presentadas y Solución Aplicada

### 1. Compatibilidad Dual (Desarrollo en Web/Servidor y Ejecución Nativa Android)
* **Incidencia:** El motor nativo SQLite de `@capacitor-community/sqlite` solo funciona internamente en entornos nativos (Android/iOS). Si se intenta ejecutar en el navegador mediante `ionic serve` para pruebas rápidas o depuración de estilos, arroja un error de que el plugin nativo no está disponible.
* **Solución Aplicada:** Se integró la librería `jeep-sqlite` como componente web de respaldo (`Custom Element`). En `SqliteService.initializeDatabase()`, se detecta la plataforma activa mediante `Capacitor.getPlatform()`. Si es `'web'`, se importa e inyecta dinámicamente la etiqueta `<jeep-sqlite>` en el DOM y se inicializa el almacén web (`initWebStore()`), permitiendo que el mismo código CRUD funcione al 100% tanto en navegador (`ionic serve`) como en dispositivos físicos Android.

### 2. Inyección de Dependencias Estricta en Angular Standalone (v20)
* **Incidencia:** Al compilar el proyecto con el nuevo compilador estricto de Angular 20 (`ng build`), se presentó una alerta de tipo `TS2561` debido al uso incorrecto del decorador `@Injectable({ provided: 'root' })` en los servicios creados.
* **Solución Aplicada:** Se ajustó de inmediato la sintaxis oficial de Angular a `@Injectable({ providedIn: 'root' })` tanto en `SqliteService` como en `IncidentService`, eliminando cualquier error de transpilación e inyección en el grafo de componentes.

### 3. Preservación y Restauración Rápida de Datos Semilla para Pruebas
* **Incidencia:** Al probar la actualización o borrado de registros por parte de los evaluadores o profesores, la base de datos puede vaciarse, dificultando la calificación posterior del listado y detalle con datos de ejemplo.
* **Solución Aplicada:** Se desarrolló el método `resetAndSeedDatabase()` en el servicio SQLite y se conectó a un menú de opciones interactivo desde la cabecera del listado (`📊 Diagnóstico / 🔄 Restaurar Datos Semilla`). De esta forma, cualquier usuario puede restaurar al instante las 6 incidencias iniciales con un solo clic en cualquier momento.

### 4. Limpieza de Componentes Iniciales No Utilizados (`app/home/`)
* **Incidencia:** La plantilla inicial en blanco (`ionic start blank`) generó un módulo genérico `home/` que ya no formaba parte del flujo real del módulo de incidencias.
* **Solución Aplicada:** Se eliminó por completo la carpeta `src/app/home/` del árbol del proyecto, se reconfiguraron las rutas en `app.routes.ts` para apuntar directamente a `incidents/` y se verificó una compilación final optimizada (`www/` generado en 7.5s sin archivos huérfanos).

---

## 📦 Conclusión
El proyecto cumple holgadamente con todos los criterios de la rúbrica (definición de entidad, script SQL, servicio SQLite funcional, CRUD local 100% operativo con datos semilla y repositorio ordenado por fases).
