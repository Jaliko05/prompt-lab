import React, { useState, useEffect } from "react";
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
import { Copy, Save, MessageSquare, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PromptDetailDialog({ open, onOpenChange, prompt }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [promptText, setPromptText] = useState("");
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    if (prompt) {
      setName(prompt.name || "");
      setDescription(prompt.description || "");
      setPromptText(prompt.prompt || "");
      setIsEditing(false);
    }
  }, [prompt]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SavedPrompt.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedPrompts"] });
      setIsEditing(false);
    },
  });

  const handleSave = async () => {
    if (!prompt) return;

    await updateMutation.mutateAsync({
      id: prompt.id,
      data: {
        name,
        description,
        prompt: promptText,
        generation_params: prompt.generation_params,
        last_updated: new Date().toISOString(),
      },
    });
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch (err) {
      console.error("Error al copiar prompt:", err);
    }
  };

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(prompt.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch (err) {
      console.error("Error al copiar ID:", err);
    }
  };

  const handleLoadInChat = () => {
    localStorage.setItem("loadedPrompt", promptText);
    navigate(createPageUrl("Chat"));
    onOpenChange(false);
  };

  if (!prompt) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Prompt" : "Detalles del Prompt"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica la información del prompt"
              : "Información completa del prompt guardado"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* ID del Prompt */}
          {!isEditing && (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
              <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">
                ID del Prompt
              </Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-700 dark:text-slate-300 break-all">
                  {prompt.id}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyId}
                  className="h-8 w-8 shrink-0"
                  title="Copiar ID"
                >
                  {copiedId ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            {isEditing ? (
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            ) : (
              <p className="text-lg font-semibold">{name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            {isEditing ? (
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-20"
              />
            ) : (
              <p className="text-gray-700">
                {description || "Sin descripción"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            {isEditing ? (
              <Textarea
                id="prompt"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                className="h-40 font-mono text-sm"
              />
            ) : (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-2">
                  <div className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 max-h-60 overflow-y-auto">
                    <pre className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-mono">
                      {promptText}
                    </pre>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopyPrompt}
                    className="h-8 w-8 shrink-0 mt-1"
                    title="Copiar prompt"
                  >
                    {copiedPrompt ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {!isEditing && prompt.generation_params && (
            <div className="space-y-2">
              <Label>Parámetros de Generación</Label>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-purple-100 text-purple-700">
                  Temperature: {prompt.generation_params.temperature}
                </Badge>
                <Badge className="bg-blue-100 text-blue-700">
                  Top-P: {prompt.generation_params.top_p}
                </Badge>
                <Badge className="bg-indigo-100 text-indigo-700">
                  Max Tokens: {prompt.generation_params.max_length_tokens}
                </Badge>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="bg-gradient-to-r from-purple-500 to-blue-600"
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Editar
              </Button>
              <Button
                onClick={handleLoadInChat}
                className="bg-gradient-to-r from-purple-500 to-blue-600"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Cargar en Chat
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
