import { useAuth } from "@/hooks/useAuth";
import { AuthDialog } from "./AuthDialog";

/**
 * Proveedor de autenticación que envuelve la aplicación
 * Muestra mensaje de error si no hay JWT válido en la URL
 */
export const AuthProvider = ({ children }) => {
  const { isAuthenticated, isLoading, authError } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
            Verificando autenticación...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthDialog error={authError} />;
  }

  return <>{children}</>;
};
