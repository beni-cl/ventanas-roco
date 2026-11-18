import { calcularDespiece } from "../servicios/motorDespieceAlgoritmo.js";


// Aqui cuando el usuario ingresa le material, alto y ancho y es valido da codigo 200 (aprobado) y se genera la funcion
// si da error (400) envia mensaje de error del motor 
// Benavides cuando envies la peticion a backend me debes enviar los datos del ancho, alto y material con estos nombres:
// anchoMm , altoMm, material  (asi como estan escritos)
// ademas ancho y alto deben ser numeros(float) y en milimetros
// el material debe ser Aluminio o PVC  (asi como estan escritos)

export function calcularDespieceController(req, res) {
  try {
    const { anchoMm, altoMm, material } = req.body;
    const resultado = calcularDespiece(anchoMm, altoMm, material);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
