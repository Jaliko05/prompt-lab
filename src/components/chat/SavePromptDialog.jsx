import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, Calendar } from "lucide-react";

export default function SavePromptDialog({
  open,
  onOpenChange,
  prompt,
  modelParams,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cacheValidityDays, setCacheValidityDays] = useState(30);
  const [showSuccess, setShowSuccess] = useState(false);
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.SavedPrompt.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedPrompts"] });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onOpenChange(false);
        setName("");
        setDescription("");
        setCacheValidityDays(30);
      }, 1500);
    },
  });

  const handleSave = async () => {
    if (!name.trim()) return;

    await saveMutation.mutateAsync({
      name: name,
      description: description,
      prompt: prompt,
      cache_validity_days: cacheValidityDays,
      generation_params: {
        top_p: modelParams.top_p,
        temperature: modelParams.temperature,
        max_length_tokens: modelParams.max_length_tokens,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">
            Guardar Prompt
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Guarda este prompt con su configuración para reutilizarlo más tarde
          </DialogDescription>
        </DialogHeader>

        {showSuccess ? (
          <div className="py-8 flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-slate-900 dark:text-slate-100 font-medium">
              ¡Prompt guardado exitosamente!
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-6 py-4">
              {/* Información del Prompt (Solo Lectura) */}
              <div className="space-y-4 bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <div>
                  <Label className="text-xs text-slate-600 dark:text-slate-400 mb-2 block">
                    Prompt a Guardar
                  </Label>
                  <div className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 p-3 max-h-32 overflow-y-auto">
                    <pre className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-mono">
                      {prompt}
                    </pre>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-slate-600 dark:text-slate-400 mb-2 block">
                    Parámetros de Generación
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      Temperature: {modelParams?.temperature || 1}
                    </Badge>
                    <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      Top-P: {modelParams?.top_p || 0.9}
                    </Badge>
                    <Badge className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      Max Tokens: {modelParams?.max_length_tokens || 2048}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Campos Editables */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-slate-700 dark:text-slate-300"
                  >
                    Nombre <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Ej: Extractor Cédula IBM"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-slate-700 dark:text-slate-300"
                  >
                    Descripción
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe para qué sirve este prompt..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="h-20 border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="cache_validity"
                    className="text-slate-700 dark:text-slate-300 flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Validez del Cache (días){" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cache_validity"
                    type="number"
                    min="1"
                    max="365"
                    value={cacheValidityDays}
                    onChange={(e) =>
                      setCacheValidityDays(parseInt(e.target.value) || 30)
                    }
                    className="border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Tiempo durante el cual las respuestas de este prompt se
                    mantendrán en caché
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-slate-300 dark:border-slate-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={!name.trim() || saveMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Guardar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
