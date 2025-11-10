import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle } from "lucide-react";

export default function SavePromptDialog({ open, onOpenChange, prompt, modelParams }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.SavedPrompt.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedPrompts'] });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onOpenChange(false);
        setName("");
        setDescription("");
      }, 1500);
    },
  });

  const handleSave = async () => {
    if (!name.trim()) return;
    
    await saveMutation.mutateAsync({
      name: name,
      description: description,
      prompt: prompt,
      generation_params: modelParams,
      last_updated: new Date().toISOString()
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-100">Guardar Prompt</DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Guarda este prompt para reutilizarlo más tarde
          </DialogDescription>
        </DialogHeader>
        
        {showSuccess ? (
          <div className="py-8 flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-slate-900 dark:text-slate-100 font-medium">¡Prompt guardado exitosamente!</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">Nombre</Label>
                <Input
                  id="name"
                  placeholder="Ej: Análisis de Datos"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-700 dark:text-slate-300">Descripción (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe para qué sirve este prompt..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-20 border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 resize-none"
                />
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