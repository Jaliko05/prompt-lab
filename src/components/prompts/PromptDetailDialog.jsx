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
import { Copy, Save, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PromptDetailDialog({ open, onOpenChange, prompt }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [promptText, setPromptText] = useState("");
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
      queryClient.invalidateQueries({ queryKey: ['savedPrompts'] });
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
        last_updated: new Date().toISOString()
      }
    });
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(promptText);
  };

  const handleLoadInChat = () => {
    localStorage.setItem('loadedPrompt', promptText);
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
            {isEditing ? "Modifica la información del prompt" : "Información completa del prompt guardado"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
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
              <p className="text-gray-700">{description || "Sin descripción"}</p>
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
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                  {promptText}
                </pre>
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
              <Button variant="outline" onClick={handleCopyPrompt}>
                <Copy className="w-4 h-4 mr-2" />
                Copiar
              </Button>
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