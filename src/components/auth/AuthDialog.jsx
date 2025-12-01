import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Lock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Diálogo que muestra mensaje cuando no hay JWT válido en la URL
 */
export const AuthDialog = ({ error }) => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Dialog open={true}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full">
              <Lock className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            Autenticación Requerida
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {error || "No se ha detectado un token de autenticación válido."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Token no encontrado o expirado</strong>
              <br />
              Debes acceder a esta aplicación con un JWT válido en la URL.
            </AlertDescription>
          </Alert>

          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              <strong>Formato esperado:</strong>
            </p>
            <code className="block bg-white dark:bg-gray-800 p-2 rounded text-xs font-mono break-all text-gray-800 dark:text-gray-200">
              https://tuapp.com?jwt=tu_token_aqui
            </code>
          </div>

          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>
              💡 <strong>¿Cómo obtener acceso?</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Solicita un enlace con token JWT válido</li>
              <li>Asegúrate de que el token no haya expirado</li>
              <li>Verifica que tengas permisos de acceso</li>
            </ul>
          </div>

          <Button onClick={handleRefresh} className="w-full" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Recargar Página
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
