import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ClientDialog({ open, onOpenChange, client }) {
  const [clientName, setClientName] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (client) {
      setClientName(client.client_name || "");
      setSecretKey(client.secret_key || "");
    } else {
      setClientName("");
      setSecretKey("");
    }
  }, [client]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Client.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      onOpenChange(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Client.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      onOpenChange(false);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientName.trim() || !secretKey.trim()) return;

    const data = {
      client_name: clientName,
      secret_key: secretKey,
    };

    if (client) {
      await updateMutation.mutateAsync({ id: client.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{client ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
          <DialogDescription>
            {client ? "Actualiza la información del cliente" : "Registra un nuevo cliente en el sistema"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="client_name">Nombre del Cliente *</Label>
              <Input
                id="client_name"
                placeholder="Ej: Empresa ABC"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secret_key">Clave Secreta *</Label>
              <Input
                id="secret_key"
                type="text"
                placeholder="Ingresa la clave secreta"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-gradient-to-r from-purple-500 to-blue-600"
            >
              {client ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}