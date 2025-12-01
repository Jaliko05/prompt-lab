import { useState, useEffect } from "react";
import {
  getJWT,
  setJWT,
  removeJWT,
  getJWTFromURL,
  isJWTExpired,
} from "@/utils/cookieUtils";

/**
 * Hook personalizado para manejar la autenticación JWT desde URL
 */
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    checkAuth();

    // Verificar expiración cada minuto
    const interval = setInterval(() => {
      checkTokenExpiration();
    }, 60000); // 60 segundos

    return () => clearInterval(interval);
  }, []);

  const checkAuth = () => {
    // Primero intentar obtener el JWT de la URL
    const urlToken = getJWTFromURL();

    if (urlToken) {
      // Si hay token en la URL, verificar si es válido y no ha expirado
      if (isJWTExpired(urlToken)) {
        setAuthError("El token de la URL ha expirado");
        removeJWT();
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Guardar el token en cookie y autenticar
      setJWT(urlToken);
      setIsAuthenticated(true);
      setAuthError(null);
      setIsLoading(false);

      // Limpiar la URL removiendo el parámetro JWT
      const url = new URL(window.location.href);
      url.searchParams.delete("jwt");
      url.searchParams.delete("token");
      window.history.replaceState({}, document.title, url.toString());
      return;
    }

    // Si no hay token en URL, verificar cookie
    const cookieToken = getJWT();

    if (cookieToken) {
      // Verificar si el token de la cookie ha expirado
      if (isJWTExpired(cookieToken)) {
        setAuthError("Tu sesión ha expirado. Por favor, obtén un nuevo token.");
        removeJWT();
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      setIsAuthenticated(false);
      setAuthError("No se ha proporcionado un token de autenticación");
    }

    setIsLoading(false);
  };

  const checkTokenExpiration = () => {
    const token = getJWT();

    if (token && isJWTExpired(token)) {
      setAuthError("Tu sesión ha expirado. Por favor, obtén un nuevo token.");
      removeJWT();
      setIsAuthenticated(false);
    }
  };

  const logout = () => {
    removeJWT();
    setIsAuthenticated(false);
    setAuthError("Has cerrado sesión");
  };

  return {
    isAuthenticated,
    isLoading,
    authError,
    logout,
    checkAuth,
  };
};
