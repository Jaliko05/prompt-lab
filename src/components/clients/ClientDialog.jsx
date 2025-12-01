import React, { useState, useEffect } from "react";
import clientService from "@/api/clientService";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Building2, Key } from "lucide-react";

export default function ClientDialog({ open, onOpenChange, client }) {
  const [clientName, setClientName] = useState("");
  const [clientDbPrefix, setClientDbPrefix] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [activeTab, setActiveTab] = useState("client");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (client) {
      setClientName(client.client_name || "");
      setSecretKey(client.secret_key || "");
      setActiveTab("secret");
    } else {
      setClientName("");
      setClientDbPrefix("");
      setSecretKey("");
      setActiveTab("client");
    }
  }, [client, open]);

  const createClientMutation = useMutation({
    mutationFn: ({ clientName, clientDbPrefix }) =>
      clientService.createClient(clientName, clientDbPrefix),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({
        title: "Cliente creado",
        description: data.msg || "El cliente se creó exitosamente",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error al crear cliente",
        description:
          error.response?.data?.msg || "Ocurrió un error al crear el cliente",
        variant: "destructive",
      });
    },
  });

  const createSecretMutation = useMutation({
    mutationFn: ({ clientName, secretKey }) =>
      clientService.createSecret(clientName, secretKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({
        title: "Secreto creado",
        description: "El secreto JWT se creó exitosamente",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error al crear secreto",
        description:
          error.response?.data?.msg || "Ocurrió un error al crear el secreto",
        variant: "destructive",
      });
    },
  });

  const updateSecretMutation = useMutation({
    mutationFn: ({ clientName, secretKey }) =>
      clientService.updateSecret(clientName, secretKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({
        title: "Secreto actualizado",
        description: "El secreto JWT se actualizó exitosamente",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar secreto",
        description:
          error.response?.data?.msg ||
          "Ocurrió un error al actualizar el secreto",
        variant: "destructive",
      });
    },
  });

  const handleSubmitClient = async (e) => {
    e.preventDefault();
    if (!clientName.trim() || !clientDbPrefix.trim()) return;

    await createClientMutation.mutateAsync({
      clientName: clientName.trim(),
      clientDbPrefix: clientDbPrefix.trim(),
    });
  };

  const handleSubmitSecret = async (e) => {
    e.preventDefault();
    if (!clientName.trim() || !secretKey.trim()) return;

    if (client) {
      await updateSecretMutation.mutateAsync({
        clientName: clientName.trim(),
        secretKey: secretKey.trim(),
      });
    } else {
      await createSecretMutation.mutateAsync({
        clientName: clientName.trim(),
        secretKey: secretKey.trim(),
      });
    }
  };

  const isPending =
    createClientMutation.isPending ||
    createSecretMutation.isPending ||
    updateSecretMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {client ? "Editar Secreto del Cliente" : "Nuevo Cliente"}
          </DialogTitle>
          <DialogDescription>
            {client
              ? "Actualiza el secreto JWT del cliente"
              : "Crea un nuevo cliente y/o configura su secreto JWT"}
          </DialogDescription>
        </DialogHeader>

        {client ? (
          <form onSubmit={handleSubmitSecret}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="client_name_secret">Nombre del Cliente *</Label>
                <Input
                  id="client_name_secret"
                  placeholder="Ej: Cliente Demo"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secret_key_edit">Clave Secreta JWT *</Label>
                <Input
                  id="secret_key_edit"
                  type="text"
                  placeholder="Ingresa el nuevo secreto JWT"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  required
                  className="font-mono text-sm"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isPending ? "Actualizando..." : "Actualizar Secreto"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="client" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Crear Cliente
              </TabsTrigger>
              <TabsTrigger value="secret" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Agregar Secreto
              </TabsTrigger>
            </TabsList>

            <TabsContent value="client" className="space-y-4 pt-4">
              <form onSubmit={handleSubmitClient}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client_name">Nombre del Cliente *</Label>
                    <Input
                      id="client_name"
                      placeholder="Ej: Cliente Demo"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Nombre identificador del cliente
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client_db_prefix">
                      Prefijo de Base de Datos *
                    </Label>
                    <Input
                      id="client_db_prefix"
                      placeholder="Ej: demo"
                      value={clientDbPrefix}
                      onChange={(e) =>
                        setClientDbPrefix(
                          e.target.value.toLowerCase().replace(/\s/g, "_")
                        )
                      }
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Se creará la base de datos:{" "}
                      {clientDbPrefix ? `${clientDbPrefix}_db` : "prefijo_db"}
                    </p>
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-gradient-to-r from-purple-500 to-blue-600"
                  >
                    {isPending ? "Creando..." : "Crear Cliente"}
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>

            <TabsContent value="secret" className="space-y-4 pt-4">
              <form onSubmit={handleSubmitSecret}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client_name_secret">
                      Nombre del Cliente *
                    </Label>
                    <Input
                      id="client_name_secret"
                      placeholder="Ej: Cliente Demo"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Debe coincidir con un cliente existente
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secret_key">Clave Secreta JWT *</Label>
                    <Input
                      id="secret_key"
                      type="text"
                      placeholder="Ingresa el secreto JWT"
                      value={secretKey}
                      onChange={(e) => setSecretKey(e.target.value)}
                      required
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Secreto para validar tokens JWT del cliente
                    </p>
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-gradient-to-r from-blue-500 to-cyan-600"
                  >
                    {isPending ? "Guardando..." : "Agregar Secreto"}
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
