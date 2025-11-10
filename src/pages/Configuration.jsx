import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Settings, Save, RotateCcw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ConfigurationPage() {
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [showSuccess, setShowSuccess] = useState(false);
  const queryClient = useQueryClient();

  const { data: configs = [] } = useQuery({
    queryKey: ['modelConfigs'],
    queryFn: () => base44.entities.ModelConfig.list('-created_date', 1),
    initialData: [],
  });

  const currentConfig = configs[0];

  useEffect(() => {
    if (currentConfig) {
      setTemperature(currentConfig.temperature);
      setTopP(currentConfig.top_p);
      setMaxTokens(currentConfig.max_length_tokens);
    }
  }, [currentConfig]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ModelConfig.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modelConfigs'] });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ModelConfig.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modelConfigs'] });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
  });

  const handleSave = async () => {
    const data = {
      temperature: temperature,
      top_p: topP,
      max_length_tokens: maxTokens,
    };

    if (currentConfig) {
      await updateMutation.mutateAsync({ id: currentConfig.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleReset = () => {
    setTemperature(0.7);
    setTopP(0.9);
    setMaxTokens(2048);
  };

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-full">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Configuración del Modelo
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
            Ajusta los parámetros del modelo de IA para personalizar las respuestas
          </p>
        </div>

        {showSuccess && (
          <Alert className="mb-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <AlertDescription className="text-green-800 dark:text-green-300 text-sm">
              ✓ Configuración guardada exitosamente
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-5">
            <CardTitle className="dark:text-slate-100 text-base">Parámetros de Generación</CardTitle>
            <CardDescription className="dark:text-slate-400 text-sm">
              Estos valores afectan cómo el modelo genera las respuestas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-6 p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="temperature" className="text-sm font-medium dark:text-slate-100">
                  Temperature
                </Label>
                <span className="text-xl font-semibold text-blue-600 dark:text-blue-400 min-w-[70px] text-right">
                  {temperature.toFixed(2)}
                </span>
              </div>
              <Slider
                id="temperature"
                min={0}
                max={1}
                step={0.01}
                value={[temperature]}
                onValueChange={(value) => setTemperature(value[0])}
                className="py-2"
              />
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Controla la aleatoriedad. Valores bajos dan respuestas más deterministas, valores altos generan respuestas más creativas.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="top_p" className="text-sm font-medium dark:text-slate-100">
                  Top P (Nucleus Sampling)
                </Label>
                <span className="text-xl font-semibold text-blue-600 dark:text-blue-400 min-w-[70px] text-right">
                  {topP.toFixed(2)}
                </span>
              </div>
              <Slider
                id="top_p"
                min={0}
                max={1}
                step={0.01}
                value={[topP]}
                onValueChange={(value) => setTopP(value[0])}
                className="py-2"
              />
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Controla la diversidad del vocabulario. Valores altos permiten más variedad.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="max_tokens" className="text-sm font-medium dark:text-slate-100">
                  Máximo de Tokens
                </Label>
                <span className="text-xl font-semibold text-blue-600 dark:text-blue-400 min-w-[70px] text-right">
                  {maxTokens}
                </span>
              </div>
              <Slider
                id="max_tokens"
                min={256}
                max={4096}
                step={256}
                value={[maxTokens]}
                onValueChange={(value) => setMaxTokens(value[0])}
                className="py-2"
              />
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Límite de longitud de la respuesta. Aproximadamente 1 token = 0.75 palabras.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1 border-slate-300 dark:border-slate-700"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Restaurar
              </Button>
              <Button
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
          <CardContent className="p-5">
            <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2 text-sm">💡 Recomendaciones</h3>
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              <li>• <strong>Tareas creativas:</strong> Temperature 0.7-0.9, Top P 0.9-1.0</li>
              <li>• <strong>Análisis precisos:</strong> Temperature 0.1-0.3, Top P 0.5-0.7</li>
              <li>• <strong>Conversaciones balanceadas:</strong> Temperature 0.5-0.7, Top P 0.8-0.9</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}