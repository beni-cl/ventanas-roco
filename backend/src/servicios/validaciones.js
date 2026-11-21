const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function limpiarTexto(valor) {
  return typeof valor === "string" ? valor.trim() : "";
}

export function emailValido(email) {
  return (
    typeof email === "string" && email.length <= 100 && REGEX_EMAIL.test(email)
  );
}

export function passwordValida(password) {
  return (
    typeof password === "string" &&
    password.length >= 8 &&
    password.length <= 72 &&
    /[A-Za-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

export const MENSAJE_PASSWORD =
  "La contraseña debe tener entre 8 y 72 caracteres, con letras y números";
