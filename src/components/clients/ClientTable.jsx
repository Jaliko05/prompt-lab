import React from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Eye, EyeOff, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function ClientTable({
  clients,
  isLoading,
  onEdit,
  onDelete,
  onViewStatus,
}) {
  const [visibleKeys, setVisibleKeys] = React.useState({});

  const toggleKeyVisibility = (id) => {
    setVisibleKeys((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-12 flex-1" />
            </div>
          ))}
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          No hay clientes registrados
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
          Crea tu primer cliente para comenzar
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-blue-50/50 dark:bg-slate-700/50">
            <TableHead className="font-semibold dark:text-gray-300">
              Nombre del Cliente
            </TableHead>
            <TableHead className="font-semibold dark:text-gray-300">
              Clave Secreta
            </TableHead>
            <TableHead className="font-semibold dark:text-gray-300">
              Fecha de Creación
            </TableHead>
            <TableHead className="text-right font-semibold dark:text-gray-300">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow
              key={client.client_name}
              className="hover:bg-blue-50/30 dark:hover:bg-slate-700/30 transition-colors"
            >
              <TableCell className="font-medium dark:text-white">
                {client.client_name}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <code className="px-3 py-1 bg-gray-100 dark:bg-slate-700 rounded-lg text-sm font-mono dark:text-gray-300">
                    {visibleKeys[client.client_name]
                      ? client.secret_key || "••••••••••••••••"
                      : "••••••••••••••••"}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleKeyVisibility(client.client_name)}
                    className="h-8 w-8 dark:hover:bg-slate-600"
                    title="El secreto no se puede visualizar por seguridad"
                  >
                    {visibleKeys[client.client_name] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </TableCell>
              <TableCell className="text-gray-600 dark:text-gray-400">
                {client.created_date
                  ? format(new Date(client.created_date), "PPp", { locale: es })
                  : "N/A"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onViewStatus(client)}
                    className="hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:border-slate-600"
                    title="Ver estado del cliente"
                  >
                    <Activity className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(client)}
                    className="hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-300 dark:border-slate-600"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onDelete(client.client_name)}
                    className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 hover:text-red-600 dark:border-slate-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
