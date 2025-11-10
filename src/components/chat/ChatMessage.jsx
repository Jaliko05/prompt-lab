import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import SavePromptDialog from "./SavePromptDialog";

export default function ChatMessage({ conversation }) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  return (
    <>
      <div className="flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex-1 flex justify-end">
          <div className="max-w-[85%]">
            <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {conversation.prompt}
              </p>
            </div>
            {conversation.image_url && (
              <div className="mt-2">
                <img 
                  src={conversation.image_url} 
                  alt="Imagen adjunta" 
                  className="max-w-[200px] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
                />
              </div>
            )}
            <div className="flex items-center justify-end gap-2 mt-1 px-1">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {format(new Date(conversation.created_date), "HH:mm", { locale: es })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="flex-1">
          <div className="max-w-[85%]">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap break-words">
                {conversation.response}
              </p>
              {conversation.model_params && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-xs">
                    Temp: {conversation.model_params.temperature}
                  </span>
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-xs">
                    Top-P: {conversation.model_params.top_p}
                  </span>
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-xs">
                    Tokens: {conversation.model_params.max_length_tokens}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 px-1">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                IA
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSaveDialog(true)}
                className="h-6 px-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Bookmark className="w-3 h-3 mr-1" />
                Guardar prompt
              </Button>
            </div>
          </div>
        </div>
      </div>

      <SavePromptDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        prompt={conversation.prompt}
        modelParams={conversation.model_params}
      />
    </>
  );
}