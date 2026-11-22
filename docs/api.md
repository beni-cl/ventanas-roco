# API de Ventanas Roco

Contrato acordado entre los tres. **Si hay que cambiar algo, avisar y actualizar este archivo entre todos.**

- Los errores siempre responden `{ "error": "mensaje" }`.
- El token va en el encabezado `Authorization: Bearer <token>`.
- Códigos: `400` datos malos · `401` sin sesión o datos de login malos · `403` sin permiso · `404` no existe · `409` conflicto de estado (por ejemplo, cotización ya enviada) · `422` faltan datos en el catálogo para calcular · `429` demasiadas peticiones · `500` error del servidor.
- Los nombres de los campos son los mismos que en la base de datos (`id_usuario`, `precio_costo`...).
- Ojo: los `DECIMAL` (precios, medidas) llegan como **texto** (`"4200.00"`) en las rutas de seguridad y catálogo. Las rutas de cotizaciones e inventario ya los entregan como **número**.

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

## Rutas hechas (motor de despiece, cotizaciones e inventario – Benjamín Ruiz)

| Ruta | Quién (permiso) | Se envía | Se recibe |
| --- | --- | --- | --- |
| `POST /api/despiece/calcular` | Cualquiera | `anchoMm`, `altoMm`, `material` (`"Aluminio"` o `"PVC"`) | el despiece: perfiles, metros lineales y superficie de vidrio |
| `POST /api/cotizaciones` | Cliente (`COTIZACION_SOLICITAR`) | `{ ventanas: [ { anchoMm, altoMm, material, tipoPerfil, colorPerfil, tipoVidrio, cantidad } ] }` | `201` `{ id_cotizacion, numero_orden, estado: "Pendiente" }` |
| `GET /api/cotizaciones/mias` | Cliente (`COTIZACION_VER_PROPIAS`) | — | sus cotizaciones con sus ventanas; `precio_final` solo si están Respondidas; nunca costos |
| `GET /api/cotizaciones/:id` | Cliente (solo las suyas, las ajenas dan `404`) o Fabricante | — | la cotización con sus ventanas; solo el Fabricante recibe despiece y el bloque `costeo` |
| `GET /api/fabricante/solicitudes` | Fabricante (`DESPIECE_VER`) | `?estado=Pendiente`, `En Revisión` o `Respondida` (opcional; otro valor da `400`) | lista de cotizaciones con el nombre del cliente y sus ventanas |
| `PUT /api/cotizaciones/:id/revisar` | Fabricante (`DESPIECE_VER`) | — | la cotización pasa de `Pendiente` a `En Revisión` y queda asignada al fabricante |
| `PUT /api/cotizaciones/:id/enviar` | Fabricante (`COTIZACION_AJUSTAR_CONGELAR`) | `{ margen_aplicado, mano_obra?, instalacion? }` | `{ id_cotizacion, numero_orden, estado: "Respondida", costo_neto, margen_aplicado, precio_final, mano_obra, instalacion, congelado: true }` |
| `GET /api/inventario` | Fabricante (`COSTOS_VER`) | — | lista de `{ id_material, id_serie, nombre_insumo, categoria, unidad_medida, precio_costo }` |
| `PUT /api/inventario/:id` | Fabricante (`INVENTARIO_EDITAR`) | `{ precio_costo }` | el material actualizado |

Reglas de las cotizaciones:

- `tipoPerfil` debe ser el nombre exacto de una serie del catálogo, y `tipoVidrio` debe coincidir (sin distinguir mayúsculas) con un vidrio del inventario.
- Medidas entre 500 y 3000 mm. Hasta 50 ventanas por cotización y cantidad de 1 a 1000 por ventana. Los errores indican el número de ventana (`"Ventana 2: ..."`).
- El estado, el precio, el costo y el cliente que envíe el cliente se **ignoran**: el servidor los fija. El cliente se toma del token.
- El precio se calcula **solo en el servidor**: costo neto = materiales + 5 % de merma + mano de obra + instalación; precio final = costo neto × (1 + margen / 100), redondeado a 2 decimales.
- `margen_aplicado` es obligatorio, de 0 a 999,99. `mano_obra` e `instalacion` son opcionales (por defecto 0) y no pueden superar 99.999.999,99.
- Al enviar, la cotización pasa a `Respondida` y queda **congelada**: no se puede enviar de nuevo (`409`). Solo se envía una cotización que esté `En Revisión`.
- Si falta la serie o el vidrio en el catálogo, enviar responde `422` y no cambia nada.
- Enviar y editar precios del inventario escriben un registro de auditoría. Si el registro falla, el envío se revierte.
- Los accesorios todavía no se costean (valen 0).

Bloque `costeo` (lo ve solo el Fabricante en el detalle): `{ perfiles, vidrio, accesorios, merma_porcentaje, merma_monto, mano_obra, instalacion, costo_neto, error }`.

Reglas del inventario:

- `precio_costo` debe ser un número de 0 a 99.999.999,99 (se redondea a 2 decimales). Texto numérico como `"2500"` se acepta; texto, vacío, nulo, ausente y booleano dan `400`.
- Solo se editan materiales activos; si no existe o está inactivo responde `404`.

Cambio respecto al contrato original: el campo del margen se llama `margen_aplicado` (antes se pensó `margenPorcentaje`).

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
