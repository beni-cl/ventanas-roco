# Registro de pruebas – Ventanas Roco

Responsable de este registro: Benjamín Ruiz (motor de despiece, costos, cotizaciones, inventario, auditoría).
Última ejecución completa: 21-11-2026. Evidencia: `docs/pruebas/evidencias/jest_detalle.txt`.

**Resultado de la última ejecución: 10 suites, 241 pruebas, 241 aprobadas, 0 fallidas.**

## 1. Entornos de prueba

| Característica | Local (pruebas automáticas) | Desplegado (pruebas sobre la versión publicada) |
| --- | --- | --- |
| Servidor | Equipo de desarrollo, Windows | Render, plan gratuito (0,1 CPU, 512 MB) |
| Node.js | 24.17.0 | 22.23.5 |
| Base de datos | PostgreSQL local | PostgreSQL en Neon (São Paulo), plan gratuito |
| Conexión a la base | Sin SSL | Con SSL |
| Acceso | `http://localhost:8080` | `https://ventanas-roco.onrender.com` |
| Límite de peticiones | Desactivado en pruebas (`NODE_ENV=test`) | Activo: 100 por minuto |
| Disco | Persistente | Efímero (la auditoría en archivos se pierde al reiniciar) |
| Servicio | Siempre encendido | Se duerme a los 15 minutos sin uso (primer acceso tarda hasta 1 minuto) |

Las pruebas automáticas (Jest y Supertest) se ejecutan siempre contra la base local. Nunca se ejecutan contra la base desplegada, porque crean y borran usuarios y modifican precios.

## 2. Pruebas automáticas ejecutadas

| ID | Prueba | Tipo | Archivo | Casos | Resultado esperado | Resultado obtenido | Estado | Fecha | Evidencia |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| U01 | Validación de medidas de entrada | Unitaria | `motorDespiece.test.js` | 27 | Rechaza texto, nulo, vacío, 0, negativos, 499 y 3001 mm; acepta 500, 3000, decimales y 1780 x 1120 | Todos los casos con el resultado esperado | Aprobada | 21-11-2026 | jest_detalle.txt |
| U02 | Cálculo de despiece técnico | Unitaria | `motorDespiece.test.js` | 19 | Aluminio 1780 x 1120: 1,99 m² de vidrio, 5,79 m de perfil, 2 horizontales de 1778 mm y 2 verticales de 1118 mm. PVC: 1,98 m², 5,78 m, 1775 mm y 1115 mm. Rechaza material inválido y medidas fuera de rango | Todos los casos con el resultado esperado | Aprobada | 21-11-2026 | jest_detalle.txt |
| U03 | Cálculo de mermas y costos base | Unitaria | `calculadorCostos.test.js` | 21 | Costo neto del prototipo: 85.000 con merma 5 %, más 35.000 de mano de obra y 30.000 de instalación, igual a 154.250. Suma de materiales sin errores de coma flotante. Rechaza negativos, texto, nulos, cantidad 0 y listas vacías | Todos los casos con el resultado esperado | Aprobada | 21-11-2026 | jest_detalle.txt |
| U04 | Precisión monetaria exacta | Unitaria | `calculadorCostos.test.js` | 11 | 154.250 con 20 % de margen da 185.100. Margen 0 y costo 0 se aceptan. Redondeo a 2 decimales. Rechaza texto, indefinidos y negativos | Todos los casos con el resultado esperado | Aprobada | 21-11-2026 | jest_detalle.txt |
| U05 | Seguridad en el cálculo de precios (solo en el servidor) | Unitaria | `precioSeguro.test.js` | 11 | Se eliminan precio, costo, margen, estado y congelado que envíe el cliente. Un `precio_final` manipulado se ignora al enviar. Margen negativo o en texto se rechaza | Todos los casos con el resultado esperado | Aprobada | 21-11-2026 | jest_detalle.txt |
| U06 | Reglas de cotización congelada y transiciones de estado | Unitaria | `cotizacionEstado.test.js` | 12 | Una cotización congelada no se modifica. Pendiente pasa a En Revisión y esta a Respondida. No se puede saltar ni retroceder de estado | Todos los casos con el resultado esperado | Aprobada | 21-11-2026 | jest_detalle.txt |
| U07 | Validación de la lista de ventanas de una cotización | Unitaria | `cotizacionVentanas.test.js` | 23 | Rechaza lista vacía, más de 50 ventanas, textos vacíos o demasiado largos, cantidad 0, decimal, texto o mayor a 1000. El error indica el número de ventana | Todos los casos con el resultado esperado | Aprobada | 21-11-2026 | jest_detalle.txt |
| U08 | Costeo con precios del catálogo y desglose | Unitaria | `costeoCalculo.test.js` | 17 | Promedio de precios de perfiles, suma de perfil y vidrio por cantidad, desglose separado por perfiles y vidrio. Rechaza precios nulos, negativos o faltantes | Todos los casos con el resultado esperado | Aprobada | 21-11-2026 | jest_detalle.txt |
| I04 | Aislamiento y propiedad de cotizaciones (grupos: mis cotizaciones, detalle y solicitudes del fabricante) | Integración | `cotizacionRutas.test.js` | 14 | Un cliente solo ve las suyas; las ajenas responden 404. El cliente no ve despiece ni costos. Fabricante sin acceso a la lista del cliente (403) | Todos los casos con el resultado esperado | Aprobada | 21-11-2026 | jest_detalle.txt |
| I05 | Flujo completo de cotización (grupos: crear, revisar, enviar y datos para el front) | Integración | `cotizacionRutas.test.js` | 34 | Cliente solicita (Pendiente), fabricante revisa (En Revisión) y envía con margen (Respondida y congelada). El servidor calcula costo y precio. Reenviar responde 409; datos inválidos responden 400; serie o vidrio sin catálogo responden 422 | Todos los casos con el resultado esperado | Aprobada | 21-11-2026 | jest_detalle.txt |
| I06 | Auditoría y trazabilidad | Unitaria e integración | `auditoria.test.js` y rutas | 18 | Cada envío de precio y cada cambio de inventario queda en un archivo JSON diario con usuario, acción, IP y estados anterior y posterior. Horario de Chile. Archivo dañado no se sobrescribe | Todos los casos con el resultado esperado | Aprobada | 21-11-2026 | jest_detalle.txt |
| I07 | Inventario: permisos, validación y auditoría | Integración | `inventarioRutas.test.js` | 20 | Sin token 401; cliente 403; fabricante lista con precio numérico y edita; precio negativo, texto, vacío, nulo, ausente, booleano o mayor al máximo responde 400 sin cambiar el valor; id inexistente 404; el catálogo público no expone el costo | Todos los casos con el resultado esperado | Aprobada | 21-11-2026 | jest_detalle.txt |
| I08 | Seguridad: registro, login, guardias y límites (Cristóbal Roco) | Integración | `seguridad.test.js` | 15 | El registro siempre crea Cliente. Contraseña débil rechazada. Login con mensaje genérico. Token de 8 horas. Guardias por permiso (401 y 403). Sin `password_hash` en respuestas. Límite devuelve 429 | Todos los casos con el resultado esperado | Aprobada | 21-11-2026 | jest_detalle.txt |

Total: 27 + 19 + 21 + 11 + 11 + 12 + 23 + 17 + 14 + 34 + 18 + 20 + 15 = 242 asignaciones. La diferencia de una prueba con las 241 ejecutadas se debe a que la prueba "registra la auditoría con usuario, acción y estados" de las rutas de cotizaciones se cuenta una vez en I05 y otra en I06. Cada prueba se ejecutó una sola vez.

Casos de borde cubiertos de forma explícita: medidas 499, 500, 3000 y 3001 mm; texto, vacío, nulo, indefinido, negativo, 0 y decimales; margen 0, negativo, en texto y mayor al máximo; costo neto 0; cantidad 0, decimal y mayor a 1000; más de 50 ventanas; cliente ajeno; cotización congelada; reenvío de una cotización ya enviada; transiciones de estado inválidas; token ausente, falso o vencido; JSON mal formado; exceso de peticiones.

## 3. Pruebas pendientes sobre la versión desplegada

| ID | Prueba | Tipo | Resultado esperado | Resultado obtenido | Estado | Fecha | Evidencia |
| --- | --- | --- | --- | --- | --- | --- | --- |
| E01 | Flujo de los tres roles en la versión publicada | Punta a punta, manual | El cliente solicita, el fabricante revisa y envía con margen, el cliente ve Respondida con precio | Pendiente | Pendiente | – | – |
| E02 | Edición de un precio de inventario en la versión publicada | Funcional, manual | El fabricante cambia un precio y queda guardado | Pendiente | Pendiente | – | – |
| E03 | Seguridad básica en la versión publicada | Seguridad, manual | Ruta protegida sin sesión responde 401; Cliente en ruta del fabricante responde 403 | Pendiente | Pendiente | – | – |
| R02 | Carga con varios usuarios simultáneos (k6) | Rendimiento | Respuestas correctas y tiempos aceptables; al superar 100 peticiones por minuto el límite responde 429 | Pendiente | Pendiente | – | – |

## 4. Hallazgos y medidas de corrección

| N.º | Hallazgo | Causa | Corrección | Cómo se verificó |
| --- | --- | --- | --- | --- |
| 1 | Las fechas de las cotizaciones creadas de noche aparecían con un día de más | Las columnas de fecha eran `TIMESTAMP` sin zona horaria: la base guardaba la hora UTC y Node la leía como hora local de Chile | Migración `005_fecha_con_zona_horaria.sql`: `fecha_creacion` pasa a `TIMESTAMPTZ` | Las cotizaciones del 20-11 pasaron a mostrar `2026-11-20` en la pantalla Mis Cotizaciones |
| 2 | Podía abrirse el presupuesto imprimible de una cotización sin precio | La vista no comprobaba el estado | La vista muestra un aviso si la cotización no está Respondida | Prueba manual con una cotización Pendiente y una Respondida |
| 3 | La pantalla de ingreso mostraba una pista del modo de prueba con datos simulados | Quedó del prototipo | Se eliminó el mensaje al conectar el login real | Revisión de la pantalla |
| 4 | El front usaba datos simulados y nombres de campo distintos a los del backend | El prototipo se hizo antes de la API | Adaptador en `api.js` que traduce los nombres y conecta cotizaciones, catálogo e inventario reales | Flujo de los tres roles en local |
| 5 | La migración falló en la base de Neon con "connection is insecure" | El script de migración abría una conexión sin SSL | La dirección de la base incluye `?sslmode=require` | Se aplicaron las migraciones 001 a 005 en Neon |
| 6 | Los números de orden presentan saltos (por ejemplo, 00001, 00046, 00065) | La secuencia de PostgreSQL no retrocede cuando una transacción se revierte o las pruebas borran datos | Se acepta como comportamiento normal; opcionalmente se reinicia la secuencia antes de la demostración | Observado en Mis Cotizaciones |

## 5. Limitaciones y decisiones provisorias

- Los accesorios no se costean (costo 0) hasta que el cliente indique cuáles lleva cada ventana y cómo se cobran.
- El costo del perfil usa el promedio de precios de los perfiles de la serie (marco y hoja).
- Si varios vidrios coinciden con el nombre pedido, se usa el primero cargado.
- Merma de 5 %, rango de medidas de 500 a 3000 mm y descuentos por perfil (Aluminio 2 mm, PVC 5 mm) son las reglas actuales, configuradas en un solo lugar; cambian cuando el cliente responda.
- La mano de obra y la instalación no tienen campo en el front: valen 0 salvo que se envíen por la API.
- El margen máximo (999,99) solo protege el tamaño de la columna.
- Todos los fabricantes ven todas las solicitudes; no hay paginación.
- La auditoría se guarda en archivos JSON; en el servicio publicado el disco es efímero y el historial se pierde al reiniciar.

## 6. Comparación esperado y obtenido (se completa tras las pruebas publicadas)

Pendiente de completar con los resultados de E01, E02, E03 y R02 y con la comparación entre el entorno local y el desplegado.
