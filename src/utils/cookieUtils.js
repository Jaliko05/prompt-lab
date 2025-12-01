/**
 * Utilidades para manejar cookies y JWT
 */

const JWT_COOKIE_NAME = 'jwt_token';

/**
 * Decodifica un JWT sin verificar la firma (solo para leer el payload)
 * @param {string} token - Token JWT
 * @returns {object|null} - Payload decodificado o null si es inválido
 */
export const decodeJWT = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch (error) {
    console.error('Error al decodificar JWT:', error);
    return null;
  }
};

/**
 * Verifica si un JWT ha expirado
 * @param {string} token - Token JWT
 * @returns {boolean} - true si ha expirado, false si aún es válido
 */
export const isJWTExpired = (token) => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true; // Si no se puede decodificar o no tiene exp, considerarlo expirado
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
};

/**
 * Obtiene el JWT desde los parámetros de la URL
 * @returns {string|null} - JWT de la URL o null
 */
export const getJWTFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('jwt') || params.get('token');
};

/**
 * Obtiene el valor de una cookie por nombre
 * @param {string} name - Nombre de la cookie
 * @returns {string|null} - Valor de la cookie o null si no existe
 */
export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
};

/**
 * Establece una cookie
 * @param {string} name - Nombre de la cookie
 * @param {string} value - Valor de la cookie
 * @param {number} days - Días hasta que expire (por defecto 30)
 */
export const setCookie = (name, value, days = 30) => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Strict`;
};

/**
 * Elimina una cookie
 * @param {string} name - Nombre de la cookie
 */
export const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

/**
 * Obtiene el JWT de la cookie
 * @returns {string|null}
 */
export const getJWT = () => {
  return getCookie(JWT_COOKIE_NAME);
};

/**
 * Guarda el JWT en la cookie
 * @param {string} token - Token JWT
 */
export const setJWT = (token) => {
  setCookie(JWT_COOKIE_NAME, token, 30);
};

/**
 * Elimina el JWT de la cookie
 */
export const removeJWT = () => {
  deleteCookie(JWT_COOKIE_NAME);
};
