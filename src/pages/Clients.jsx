import React, { useState } from "react";
import clientService from "@/api/clientService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, Search, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

import ClientTable from "../components/clients/ClientTable";
import ClientDialog from "../components/clients/ClientDialog";
import ClientStatusDialog from "../components/clients/ClientStatusDialog";

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: () => clientService.list(),
    initialData: [],
  });

  const deleteMutation = useMutation({
    mutationFn: (clientName) => clientService.deleteSecret(clientName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({
        title: "Cliente eliminado",
        description: "El secreto del cliente se eliminó exitosamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar",
        description:
          error.response?.data?.msg ||
          "Ocurrió un error al eliminar el secreto",
        variant: "destructive",
      });
    },
  });

  const filteredClients = clients.filter(
    (client) =>
      client.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.secret_key?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (client) => {
    setEditingClient(client);
    setShowDialog(true);
  };

  const handleViewStatus = (client) => {
    setSelectedClient(client.client_name);
    setShowStatusDialog(true);
  };

  const handleDelete = async (clientName) => {
    if (
      window.confirm(
        `¿Estás seguro de eliminar el secreto del cliente "${clientName}"?`
      )
    ) {
      await deleteMutation.mutateAsync(clientName);
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingClient(null);
  };

  const handleCloseStatusDialog = () => {
    setShowStatusDialog(false);
    setSelectedClient(null);
  };

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-full">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Gestión de Clientes
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
              Administra los clientes y sus claves de acceso
            </p>
          </div>
          <Button
            onClick={() => setShowDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Cliente
          </Button>
        </div>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center gap-3">
              <Search className="w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por nombre o clave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-none focus-visible:ring-0 bg-transparent dark:text-slate-100 text-sm"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ClientTable
              clients={filteredClients}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewStatus={handleViewStatus}
            />
          </CardContent>
        </Card>

        <ClientDialog
          open={showDialog}
          onOpenChange={handleCloseDialog}
          client={editingClient}
        />

        <ClientStatusDialog
          open={showStatusDialog}
          onOpenChange={handleCloseStatusDialog}
          clientName={selectedClient}
        />
      </div>
    </div>
  );
}
