import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, Search, Users } from "lucide-react";

import ClientTable from "../components/clients/ClientTable";
import ClientDialog from "../components/clients/ClientDialog";

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list('-created_date'),
    initialData: [],
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Client.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const filteredClients = clients.filter(client =>
    client.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.secret_key?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (client) => {
    setEditingClient(client);
    setShowDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este cliente?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingClient(null);
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
            />
          </CardContent>
        </Card>

        <ClientDialog
          open={showDialog}
          onOpenChange={handleCloseDialog}
          client={editingClient}
        />
      </div>
    </div>
  );
}