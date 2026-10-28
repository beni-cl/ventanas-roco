# Ventanas Roco – Sistema de Gestión y Cotización

Aplicación web para que los clientes de Fábrica Roco configuren ventanas a medida y soliciten cotizaciones, y para que el fabricante calcule el despiece, los costos y responda con un precio.

**Equipo:** Benjamín Benavides · Cristóbal Roco · Benjamín Ruiz

## Tecnologías

| Parte | Tecnología |
| --- | --- |
| Backend (API) | Node.js + Express |
| Base de datos | PostgreSQL (tablas + JSONB) |
| Acceso a datos | Sequelize |
| Seguridad | JWT, BCrypt y RBAC |
| Frontend | React (pendiente) |
| Pruebas | Jest, Supertest, Playwright, k6 (pendiente) |

## 1. Requisitos (instalar una sola vez)

- [Node.js](https://nodejs.org) versión **LTS**. Comprobar con `node -v` y `npm -v`.
- [PostgreSQL](https://www.postgresql.org/download/) con **pgAdmin**. Anotar la contraseña del usuario `postgres`.
- [Git](https://git-scm.com). Comprobar con `git --version`.
- VS Code con las extensiones **ESLint** y **Prettier**.

> En Windows, si npm muestra "la ejecución de scripts está deshabilitada", ejecutar una vez en PowerShell:
> `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`

## 2. Instalación

1. Clonar el repositorio en una carpeta **sin OneDrive** (por ejemplo `C:\proyectos`):

   ```
   git clone https://github.com/beni-cl/ventanas-roco.git
   cd ventanas-roco/backend
   npm install
   ```

2. Crear la base de datos: en pgAdmin, clic derecho en **Databases → Create → Database**, con el nombre `ventanas_roco`.

3. Crear el archivo de configuración: copiar `backend/.env.example`, renombrar la copia a `.env` y cambiar `TU_CLAVE` por **tu** contraseña de PostgreSQL. Usar solo letras y números en la contraseña.

   ```
   DATABASE_URL=postgres://postgres:TU_CLAVE@localhost:5432/ventanas_roco
   PORT=8080
   ```

   **El archivo `.env` nunca se sube a GitHub.** Cada integrante tiene el suyo.

4. Crear las tablas y los datos iniciales:

   ```
   npm run db:migrar
   ```

   En pgAdmin deben aparecer 12 tablas en `ventanas_roco → Schemas → public → Tables` (las 11 del modelo E-R más `migraciones_aplicadas`).

5. Encender el servidor:

   ```
   npm run dev
   ```

   Abrir <http://localhost:8080/api/salud>. Debe responder `{"estado":"ok","baseDatos":"conectada"}`.

## 3. Comandos

Se ejecutan dentro de la carpeta `backend`.

| Comando | Qué hace |
| --- | --- |
| `npm install` | Instala las bibliotecas del proyecto |
| `npm run dev` | Enciende el servidor y lo reinicia al guardar cambios |
| `npm start` | Enciende el servidor sin reinicio automático |
| `npm run db:migrar` | Aplica las migraciones pendientes a tu base de datos |

## 4. Estructura

```
backend/
├── database/migraciones/   Archivos SQL que crean y modifican las tablas
├── scripts/migrar.js       Aplica las migraciones en orden
├── src/
│   ├── app.js              Punto de entrada del servidor
│   ├── config/             Conexión a la base de datos
│   ├── controladores/      Rutas de la API (qué responde cada dirección)
│   ├── middleware/         Verificación de JWT y permisos RBAC
│   ├── modelos/            Acceso a las tablas con Sequelize
│   └── servicios/          Lógica del negocio (motor de despiece y costos)
├── tests/                  Pruebas con Jest y Supertest
├── .env.example            Plantilla del .env (sin contraseñas)
└── package.json            Lista de bibliotecas y comandos
```

## 5. Cómo trabajamos en equipo

### Antes de empezar cada día

```
git pull
cd backend
npm install
npm run db:migrar
```

`npm install` y `npm run db:migrar` solo hacen algo si alguien agregó bibliotecas o tablas; si no hay cambios, no pasa nada.

### Trabajar en una rama, no directo en `main`

1. Crear una rama para la tarea:

   ```
   git checkout -b nombre-de-la-tarea
   ```

   Ejemplos: `motor-despiece`, `login-jwt`, `panel-fabricante`.

2. Guardar avances con commits pequeños y mensajes claros:

   ```
   git add .
   git commit -m "Calcula superficie de vidrio del despiece"
   git push -u origin nombre-de-la-tarea
   ```

3. Al terminar, abrir un **Pull Request** en GitHub hacia `main` y pedir a otro integrante que lo revise antes de unirlo.

### Reglas

- **Nunca subir `.env`** ni contraseñas en el código. Usar `process.env`.
- **No editar una migración que ya se subió.** Para cambiar una tabla, crear un archivo nuevo con el número siguiente, por ejemplo `003_agrega_columna_x.sql`.
- **No subir `node_modules`.** El `.gitignore` ya lo excluye.
- Si `git status` muestra `backend/.env`, **no hacer commit** y avisar al equipo.
- Mensajes de commit en español, describiendo qué se hizo.

## 6. Tareas por hacer (según la carta Gantt)

- [ ] T05 Motor de despiece, mermas y costos, con pruebas en Jest
- [ ] T06 Base de datos híbrida (tablas y datos iniciales listos; faltan modelos Sequelize)
- [ ] T07 Configurador del cliente (React)
- [ ] T08 Panel del fabricante (React)
- [ ] T09 Seguridad: registro, login con BCrypt y JWT, middleware RBAC
- [ ] T10 Auditoría en archivos JSON
- [ ] T11 Pruebas unitarias, de integración y de rendimiento
