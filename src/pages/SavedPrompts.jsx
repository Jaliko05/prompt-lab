import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Save, Search } from "lucide-react";

import PromptCard from "../components/prompts/PromptCard";
import PromptDetailDialog from "../components/prompts/PromptDetailDialog";

export default function SavedPromptsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: prompts = [], isLoading } = useQuery({
    queryKey: ['savedPrompts'],
    queryFn: () => base44.entities.SavedPrompt.list('-last_updated'),
    initialData: [],
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SavedPrompt.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedPrompts'] });
    },
  });

  const filteredPrompts = prompts.filter(prompt =>
    prompt.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prompt.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prompt.prompt?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleView = (prompt) => {
    setSelectedPrompt(prompt);
    setShowDetailDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este prompt?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-full">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <Save className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Prompts Guardados
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
            Biblioteca de prompts para reutilizar
          </p>
        </div>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 mb-6 p-4">
          <div className="flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-none focus-visible:ring-0 bg-transparent dark:text-slate-100 text-sm"
            />
          </div>
        </Card>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400 text-sm">Cargando prompts...</p>
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Save className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">
              {searchTerm ? "No se encontraron prompts" : "No hay prompts guardados"}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {searchTerm 
                ? "Intenta con otros términos de búsqueda" 
                : "Guarda prompts desde el chat para verlos aquí"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onView={handleView}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        <PromptDetailDialog
          open={showDetailDialog}
          onOpenChange={setShowDetailDialog}
          prompt={selectedPrompt}
        />
      </div>
    </div>
  );
}