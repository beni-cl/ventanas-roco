# API de Ventanas Roco

Contrato acordado entre los tres. **Si hay que cambiar algo, avisar y actualizar este archivo entre todos.**

- Los errores siempre responden `{ "error": "mensaje" }`.
- El token va en el encabezado `Authorization: Bearer <token>`.
- Códigos: `400` datos malos · `401` sin sesión o datos de login malos · `403` sin permiso · `404` no existe · `429` demasiadas peticiones · `500` error del servidor.
- Los nombres de los campos son los mismos que en la base de datos (`id_usuario`, `precio_costo`...).
- Ojo: los `DECIMAL` (precios, medidas) llegan como **texto** (`"4200.00"`). Usar `Number()` para calcular.

## Rutas hechas (seguridad y catálogo)

| Ruta | Quién | Se envía | Se recibe |
| --- | --- | --- | --- |
| `POST /api/auth/registro` | Cualquiera | `nombre`, `email`, `password` (`telefono` y `direccion` opcionales) | el usuario creado (`201`), con `rol: "Cliente"` |
| `POST /api/auth/login` | Cualquiera | `email`, `password` | `{ token, usuario: { id_usuario, nombre, email, rol } }` |
| `GET /api/auth/yo` | Con sesión | — | `{ id_usuario, nombre, email, rol, telefono, direccion, fecha_registro }` |
| `GET /api/catalogo/series` | Cualquiera | — | lista de `{ id_serie, nombre, tipo_material }` |
| `GET /api/catalogo/materiales` | Cualquiera | — | lista de `{ id_material, id_serie, nombre_insumo, categoria, unidad_medida }` (**sin precio**) |

Reglas:

- El registro **siempre** crea un Cliente. Si llega `"rol": "Administrador"` se ignora.
- Contraseña: mínimo 8 caracteres, con letras y números.
- Si el login falla, el mensaje siempre es `"Correo o contraseña incorrectos"` (`401`).
- El token dura **8 horas** y lleva solo `id`, `email` y `rol`.
- Límites: 100 peticiones por minuto por persona; en el login, 10 intentos fallidos cada 15 minutos (`429`).

## Rutas por hacer (Benjamín Ruiz) — usan los guardias

| Ruta | Quién | Se envía | Se recibe |
| --- | --- | --- | --- |
| `POST /api/cotizaciones` | Cliente | medidas y opciones de las ventanas | número de orden y estado "Pendiente" |
| `GET /api/cotizaciones/mias` | Cliente | — | sus cotizaciones |
| `GET /api/cotizaciones/:id` | Cliente (solo las suyas) o Fabricante | — | la cotización (solo el Fabricante ve despiece y costos) |
| `GET /api/fabricante/solicitudes` | Fabricante | filtro por estado (opcional) | lista de solicitudes |
| `PUT /api/cotizaciones/:id/revisar` | Fabricante | — | la cotización en "En Revisión" |
| `PUT /api/cotizaciones/:id/enviar` | Fabricante | margen (%) | la cotización "Respondida" y bloqueada, con precio final |
| `GET /api/inventario` | Fabricante | — | materiales con precio |
| `PUT /api/inventario/:id` | Fabricante | nuevo precio | el material actualizado |

## Cómo usar los dos guardias en una ruta

Están en `backend/src/middleware/`. Se ponen **en este orden**:

```js
import { Router } from "express";
import { verificarToken } from "../middleware/verificarToken.js";
import { verificarPermiso } from "../middleware/verificarPermiso.js";

const router = Router();

// Guardia 1: ¿trae token válido?  →  Guardia 2: ¿su rol tiene este permiso?
router.get("/inventario", verificarToken, verificarPermiso("COSTOS_VER"), async (req, res) => {
  // Aquí ya se sabe quién es: req.usuario = { id, email, rol }
  console.log(req.usuario.id, req.usuario.rol);
  res.json([]);
});

export default router;
```

Y se conecta en `backend/src/crearApp.js`, junto a las otras rutas:

```js
import inventario from "./controladores/inventario.js";
app.use("/api/inventario", inventario);
```

- Sin token (o vencido o falso) → `401`.
- Con token pero el rol no tiene el permiso → `403`.
- Una ruta que solo pide sesión (sin permiso especial) usa solo `verificarToken`.
- Para una ruta donde el Cliente solo ve **lo suyo**, comparar `req.usuario.id` con `id_cliente` de la cotización dentro del manejador (si no coincide, responder `404` o `403`).

### Permisos disponibles (tabla `permisos`)

| Código | Roles que lo tienen |
| --- | --- |
| `COTIZACION_SOLICITAR` | Cliente |
| `COTIZACION_VER_PROPIAS` | Cliente |
| `DESPIECE_VER` | Fabricante |
| `COSTOS_VER` | Fabricante |
| `COTIZACION_AJUSTAR_CONGELAR` | Fabricante |
| `INVENTARIO_EDITAR` | Fabricante |
| `CATALOGO_GESTIONAR` | Administrador |
| `USUARIOS_GESTIONAR` | Administrador |

### Modelos Sequelize

Todos los modelos están en `backend/src/modelos/index.js`:

```js
import { Cotizacion, Material, Usuario } from "../modelos/index.js";
```
