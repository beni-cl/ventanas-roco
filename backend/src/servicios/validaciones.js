// Reglas de validación compartidas (registro y script del administrador).
// Siempre se revisan en el servidor, aunque la pantalla ya las revise.

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Devuelve el texto sin espacios sobrantes, o "" si no es texto
export function limpiarTexto(valor) {
  return typeof valor === "string" ? valor.trim() : "";
}

export function emailValido(email) {
  return typeof email === "string" && email.length <= 100 && REGEX_EMAIL.test(email);
}

// Mínimo 8 caracteres, con al menos una letra y un número
export function passwordValida(password) {
  return (
    typeof password === "string" &&
    password.length >= 8 &&
    password.length <= 72 && // límite real de BCrypt
    /[A-Za-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

export const MENSAJE_PASSWORD =
  "La contraseña debe tener entre 8 y 72 caracteres, con letras y números";
