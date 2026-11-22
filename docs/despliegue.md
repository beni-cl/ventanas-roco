# Subir el sistema a internet

El sistema se publica como **un solo servicio**: Express responde la API (`/api/...`) y también entrega las pantallas de React ya compiladas.

## Antes de elegir dónde publicar

Decidir entre los tres, y preguntar a Gerardo:

- ¿Quién paga y a nombre de quién queda la cuenta? (Gerardo va a usar el sistema de verdad.)
- ¿Se acepta que el servicio "duerma" cuando nadie lo usa?

**Ojo con los planes gratis** (revisar siempre las condiciones actuales del proveedor). En Render, por ejemplo, un servicio web gratis se duerme a los 15 minutos sin visitas, y una base de datos PostgreSQL gratis **vence a los 30 días** y después se borra. Para un cliente real conviene pagar la base de datos, o usar una base de datos gratis que no venza y copiar los datos de respaldo con frecuencia.

## Pasos (sirven en Render, Railway u otra PaaS)

1. **Crear la base de datos PostgreSQL** en el servicio y copiar su dirección de conexión (`DATABASE_URL`).
2. **Crear el servicio web** conectado al repositorio de GitHub, rama `main`. Cada cambio en `main` se publica solo.
   - Carpeta raíz: la del repositorio.
   - Comando de instalación (build): `cd backend && npm install`
     (cuando exista el React: `cd frontend && npm install && npm run build && cd ../backend && npm install`)
   - Comando de inicio: `cd backend && npm run start:produccion`
     (primero aplica las migraciones pendientes y luego enciende el servidor).
3. **Variables de entorno** (en la configuración del servicio, nunca en el código):

   | Variable | Valor |
   | --- | --- |
   | `DATABASE_URL` | la dirección que dio el servicio de base de datos |
   | `DATABASE_SSL` | `true` (si el servicio exige SSL) |
   | `JWT_SECRET` | texto largo al azar, distinto al de tu computador |
   | `NODE_ENV` | `production` |

   Para generar el `JWT_SECRET`: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
   `PORT` casi siempre lo pone la plataforma sola.
4. **Primer administrador:** una sola vez, desde la consola/shell del servicio:

   ```
   cd backend && npm run admin:crear
   ```

   Pide nombre, correo y contraseña (la contraseña no queda escrita en ningún archivo).

## Está listo cuando

Abres `https://TU-DIRECCION/api/salud` y responde:

```json
{"estado":"ok","baseDatos":"conectada"}
```

## Si algo falla

- **"Falta JWT_SECRET"** → falta esa variable en el servicio.
- **Error de SSL / "no pg_hba.conf entry"** → poner `DATABASE_SSL=true`.
- **`/api/salud` dice "sin conexión"** → revisar `DATABASE_URL` (sin espacios, con la clave correcta).
- **Las pantallas no aparecen y `/` muestra solo `API de Ventanas Roco`** → el React no se compiló. Express lo busca en `frontend/dist` (o en la carpeta de la variable `FRONTEND_DIST`). Coordinar con Benjamín Benavides.
