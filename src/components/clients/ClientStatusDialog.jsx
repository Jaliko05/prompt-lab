import React, { useState } from "react";
import clientService from "@/api/clientService";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import {
  Activity,
  Database,
  Coins,
  FileBarChart,
  Calendar,
  User,
  TrendingUp,
  Clock,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function ClientStatusDialog({ open, onOpenChange, clientName }) {
  const { toast } = useToast();
  const [reportFilters, setReportFilters] = useState({
    user_identity: "",
    start_date: "",
    end_date: "",
    min_tokens_used: 0,
  });

  const { data: clientStatus, isLoading: isLoadingStatus } = useQuery({
    queryKey: ["clientStatus", clientName],
    queryFn: () => clientService.getClientStatus(clientName),
    enabled: open && !!clientName,
    retry: 1,
  });

  const usageReportMutation = useMutation({
    mutationFn: (filters) =>
      clientService.getUsageReport({
        client_name: clientName,
        ...filters,
      }),
    onSuccess: (data) => {
      toast({
        title: "Reporte generado",
        description: `${
          data.summary?.total_requests || 0
        } solicitudes encontradas`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error al generar reporte",
        description:
          error.response?.data?.error ||
          "Ocurrió un error al generar el reporte",
        variant: "destructive",
      });
    },
  });

  const handleGenerateReport = () => {
    const filters = {};
    if (reportFilters.user_identity)
      filters.user_identity = reportFilters.user_identity;
    if (reportFilters.start_date) filters.start_date = reportFilters.start_date;
    if (reportFilters.end_date) filters.end_date = reportFilters.end_date;
    if (reportFilters.min_tokens_used > 0)
      filters.min_tokens_used = reportFilters.min_tokens_used;

    usageReportMutation.mutate(filters);
  };

  const handleDownloadReport = () => {
    if (!usageReportMutation.data) return;

    const reportData = {
      cliente: clientName,
      fecha_generacion: new Date().toISOString(),
      resumen: usageReportMutation.data.summary,
      registros: usageReportMutation.data.records,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte-${clientName}-${format(
      new Date(),
      "yyyy-MM-dd"
    )}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Reporte descargado",
      description: "El archivo JSON se descargó exitosamente",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Estado del Cliente
          </DialogTitle>
          <DialogDescription>
            Información detallada y reportes de uso de {clientName}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="status">Estado General</TabsTrigger>
            <TabsTrigger value="reports">Reportes de Uso</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-4 mt-4">
            {isLoadingStatus ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : clientStatus ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Database className="w-4 h-4 text-purple-600" />
                      Base de Datos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {clientStatus.db_name}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Base de datos asignada
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Activity className="w-4 h-4 text-green-600" />
                      Estado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge
                      variant={
                        clientStatus.status === "active"
                          ? "default"
                          : "secondary"
                      }
                      className="text-base py-1 px-3"
                    >
                      {clientStatus.status === "active" ? "Activo" : "Inactivo"}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-3">
                      Estado actual del cliente
                    </p>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Coins className="w-4 h-4 text-yellow-600" />
                      Tokens Disponibles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-yellow-600">
                      {clientStatus.tokens_available?.toLocaleString() || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tokens disponibles para consumo
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive">Error</CardTitle>
                  <CardDescription>
                    No se pudo cargar la información del cliente
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileBarChart className="w-4 h-4" />
                  Generar Reporte de Uso
                </CardTitle>
                <CardDescription>
                  Filtra y genera reportes detallados de consumo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="user_identity"
                      className="flex items-center gap-2"
                    >
                      <User className="w-3 h-3" />
                      Usuario
                    </Label>
                    <Input
                      id="user_identity"
                      placeholder="Ej: GYG1"
                      value={reportFilters.user_identity}
                      onChange={(e) =>
                        setReportFilters({
                          ...reportFilters,
                          user_identity: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="min_tokens"
                      className="flex items-center gap-2"
                    >
                      <Coins className="w-3 h-3" />
                      Tokens Mínimos
                    </Label>
                    <Input
                      id="min_tokens"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={reportFilters.min_tokens_used}
                      onChange={(e) =>
                        setReportFilters({
                          ...reportFilters,
                          min_tokens_used: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="start_date"
                      className="flex items-center gap-2"
                    >
                      <Calendar className="w-3 h-3" />
                      Fecha Inicio
                    </Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={reportFilters.start_date}
                      onChange={(e) =>
                        setReportFilters({
                          ...reportFilters,
                          start_date: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="end_date"
                      className="flex items-center gap-2"
                    >
                      <Calendar className="w-3 h-3" />
                      Fecha Fin
                    </Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={reportFilters.end_date}
                      onChange={(e) =>
                        setReportFilters({
                          ...reportFilters,
                          end_date: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <Button
                  onClick={handleGenerateReport}
                  disabled={usageReportMutation.isPending}
                  className="w-full"
                >
                  {usageReportMutation.isPending
                    ? "Generando..."
                    : "Generar Reporte"}
                </Button>
              </CardContent>
            </Card>

            {usageReportMutation.data && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Resultados</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadReport}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar JSON
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {usageReportMutation.data.summary && (
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                      <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 mb-1">
                          <FileBarChart className="w-3 h-3" />
                          Total Solicitudes
                        </div>
                        <div className="text-xl font-bold">
                          {usageReportMutation.data.summary.total_requests || 0}
                        </div>
                      </div>

                      <div className="bg-yellow-50 dark:bg-yellow-950/30 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400 mb-1">
                          <Coins className="w-3 h-3" />
                          Tokens Consumidos
                        </div>
                        <div className="text-xl font-bold">
                          {usageReportMutation.data.summary.total_tokens_consumed?.toLocaleString() ||
                            0}
                        </div>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-950/30 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 mb-1">
                          <TrendingUp className="w-3 h-3" />
                          Promedio Tokens
                        </div>
                        <div className="text-xl font-bold">
                          {Math.round(
                            usageReportMutation.data.summary
                              .average_tokens_per_request || 0
                          )}
                        </div>
                      </div>

                      <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 mb-1">
                          <Clock className="w-3 h-3" />
                          Duración Promedio
                        </div>
                        <div className="text-xl font-bold">
                          {usageReportMutation.data.summary.average_duration_seconds?.toFixed(
                            2
                          ) || 0}
                          s
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground">
                    Mostrando {usageReportMutation.data.records?.length || 0}{" "}
                    registros
                    {usageReportMutation.data.records?.length >= 200 &&
                      " (limitado a 200)"}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
