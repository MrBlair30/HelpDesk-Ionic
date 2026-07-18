# Informe Técnico: Integración API REST, Manejo de Errores y Sincronización Básica (Actividad 11 - Parte 2)

## 1. Introducción y Objetivos
El presente informe documenta el desarrollo y la implementación técnica de la **Parte 2 de la Actividad 11**, cuyo objetivo principal es establecer una arquitectura de sincronización **Offline-First**. En este enfoque, la aplicación móvil de Mesa de Ayuda prioriza siempre el almacenamiento local nativo en el dispositivo (SQLite) y posteriormente, mediante un proceso de sincronización, consolida la información hacia un servidor remoto REST implementado en Node.js con una base de datos MySQL.

**Objetivos alcanzados:**
- Implementación de un repositorio remoto unificado.
- Manejo proactivo de fallos de red y excepciones HTTP.
- Superación de políticas de seguridad nativas de Android (CORS y Cleartext).
- Sincronización manual básica de registros pendientes.

---

## 2. Arquitectura de Repositorios (Patrón Unificado)
Para garantizar la separación de preocupaciones y una escalabilidad adecuada, se estructuró la capa de acceso a datos utilizando el patrón de diseño *Repository*. Se definieron tres componentes clave:

### 2.1. Capa Local (`LocalRepository`)
Encargada de gestionar la interacción exclusiva con `Capacitor SQLite`. Su responsabilidad principal es mantener la persistencia nativa, asegurando que la aplicación no dependa de una conexión a internet para mostrar, guardar o actualizar información. 
* Se adaptó el esquema (`schema.sql.ts`) para incluir el campo `syncStatus` con valores `Pendiente` o `Sincronizado`.

### 2.2. Capa Remota (`RemoteRepository`)
Desarrollada utilizando el `HttpClient` de Angular (`@angular/common/http`). Su función es establecer la comunicación con el Backend RESTful.
* Centraliza las peticiones `GET`, `POST`, `PUT` y `DELETE`.
* En esta actividad se configuró apuntando al host local del servidor de desarrollo (`http://192.168.1.70:3000/api/incidents`).

### 2.3. Capa de Orquestación (`IncidentService`)
El servicio actúa como el puente unificador entre el `LocalRepository` y el `RemoteRepository`. Implementa la lógica de negocios del flujo Offline-First:
1. **Lectura INICIAL**: Al abrir la vista, el servicio lee **exclusivamente de SQLite**, logrando un tiempo de carga (TTI) instantáneo.
2. **Escritura**: Al crear una incidencia, el servicio la inyecta primero en la base de datos local y refresca la UI.
3. **Delegación de Sincronización**: Posteriormente, despacha el registro al repositorio remoto de forma asíncrona, encapsulada en rutinas de control de errores.

---

## 3. Endpoints Consumidos (Backend Node.js)
El servicio Backend (Node.js/Express) expone los endpoints que asimilan y distribuyen las incidencias.

| Método | Endpoint | Descripción y Comportamiento |
| :--- | :--- | :--- |
| **GET** | `/api/incidents` | Recupera el listado maestro de incidencias desde MySQL. Utilizado en rutinas donde se requiere restaurar o poblar la base local desde cero. |
| **POST** | `/api/incidents` | Endpoint principal de Sincronización. Acepta un *Array* de objetos JSON. Recorre cada objeto ejecutando la instrucción MySQL `INSERT ... ON DUPLICATE KEY UPDATE`. Esto garantiza que si la app móvil re-envía una incidencia que ya existía, el backend la actualice sin arrojar errores de clave duplicada (`codigo`). |
| **PUT** | `/api/incidents/:id` | Modifica de forma individual una incidencia basada en su código (ej. `INC-1007`). |
| **DELETE**| `/api/incidents/:id` | Elimina lógicamente o físicamente un registro del sistema remoto. |

---

## 4. Manejo de Errores y Excepciones de Red

Durante la integración entre el WebView de Android y el servidor local en red, surgieron políticas de seguridad que bloqueaban la comunicación. Estas se resolvieron bajo rigurosos controles de errores:

### 4.1. Bypass de Seguridad de Red (CORS y Cleartext en Android 9+)
* **Problema Identificado**: Al intentar hacer el `POST` hacia la red local local, Angular `HttpClient` arrojaba el error `0 Unknown Error`. Esto ocurre porque el componente WebView de Android bloquea las peticiones de origen cruzado (CORS) y el tráfico HTTP en texto plano hacia direcciones de red local no seguras (`http://`).
* **Solución Implementada**:
  1. Se habilitó el plugin nativo `CapacitorHttp` en el archivo `capacitor.config.ts`. Este plugin intercepta los llamados de Angular a nivel profundo y los delega directamente al cliente HTTP en código nativo Java/Kotlin, saltándose la censura del WebView.
  2. Se modificó el archivo `AndroidManifest.xml` agregando la directiva `android:usesCleartextTraffic="true"` en la etiqueta `<application>`, lo que otorga permiso formal del sistema operativo Android para consumir la API sin protocolo HTTPS.
  3. Se liberó el puerto 3000 de Windows Defender a nivel del OS host.

### 4.2. Algoritmo Anti-Colisión de IDs (Generación dinámica)
* **Problema Identificado**: Las nuevas incidencias creadas sin conexión siempre adquirían el código secuencial `INC-1007` y al llegar al servidor se sobreescribían mutuamente por su restricción `UNIQUE`.
* **Solución Implementada**: En `IncidentService`, se implementó una función de extracción y mapeo que itera la base de datos local SQLite, hace un *parseo* (`parseInt`) sobre los últimos dígitos de todas las incidencias (ej. "1007") y dinámicamente calcula el `maxId`. Con esto, la app móvil puede generar seriales perfectos e incrementales (`INC-1008`, `INC-1009`) aunque permanezca meses sin internet.

### 4.3. Resiliencia de Bloques (`try/catch`)
* La comunicación externa remota se aisló con sentencias `try/catch`. 
* Si el servidor se apaga repentinamente o la red Wi-Fi falla, la aplicación **no colapsa ni pierde la información**. Simplemente advierte en un Log/Alert del suceso, captura la excepción y conserva la variable de estado `syncStatus` en `'Pendiente'`.

---

## 5. Validación Funcional: Bitácora de Sincronización

La prueba definitiva valida que el enfoque Offline-First cumpla su propósito de mantener operativo al usuario bajo cualquier circunstancia de conectividad.

### 5.1. Caso 1: Trabajo Offline (Falla de red / Ausencia de Conexión)
1. **Contexto**: El usuario se encuentra fuera de la cobertura de la red LAN (o Wi-Fi desactivado).
2. **Acción**: Diligencia el formulario en la app móvil y toca "Guardar Incidencia".
3. **Flujo Interno**: 
   - `local.repository.ts` inserta con éxito el registro con estado `Pendiente`.
   - `syncIncident()` intenta enviar el Payload.
   - El subsistema `HttpClient` arroja un error de desconexión.
   - El bloque `catch` atrapa el error; la app aborta silenciosamente el envío pero mantiene el registro a salvo.
4. **Comportamiento Visual**: La incidencia aparece listada instantáneamente en pantalla, con un indicador/botón amarillo (o de advertencia) que notifica: **"Pendiente"**.

### 5.2. Caso 2: Restablecimiento de Red y Sincronización Manual Exitoso
1. **Contexto**: El usuario retorna a la oficina o activa el Wi-Fi.
2. **Acción**: Presiona el botón "Sincronizar" en la barra de herramientas.
3. **Flujo Interno**: 
   - Se ejecuta el método `syncAllPending()`.
   - El `LocalRepository` filtra la base de datos mediante `SELECT * WHERE syncStatus = 'Pendiente'`.
   - El `RemoteRepository` emite un `POST` empaquetando el Array de resultados hacia `192.168.1.70:3000`.
   - El servidor Node.js/MySQL responde HTTP `201 Created` o `200 OK`.
   - `LocalRepository` actualiza la bandera de cada registro afectado a `Sincronizado`.
4. **Comportamiento Visual**: El listado de incidencias se refresca y los indicadores pasan a un estado de consolidación (color verde) indicando: **"Sincronizado"**.

---
## Conclusión
La Actividad 11 - Parte 2 culmina con un sistema maduro, enrutado bajo estándares modernos de desarrollo de aplicaciones móviles híbridas. La sincronización diferida provee robustez total ante cortes de red y la arquitectura desacoplada por repositorios permite una futura escalabilidad sin alterar la capa de interfaces del usuario.
