import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Trash2, Calendar, Copy, Check } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";

export default function PromptCard({ prompt, onView, onDelete }) {
  const [copied, setCopied] = useState(false);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(prompt.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow duration-200 bg-white dark:bg-slate-900">
      <CardHeader className="p-4 pb-3">
        <CardTitle className="line-clamp-1 dark:text-slate-100 text-base">
          {prompt.name}
        </CardTitle>
        <CardDescription className="line-clamp-2 dark:text-slate-400 text-xs">
          {prompt.description || "Sin descripción"}
        </CardDescription>

        {/* ID con botón de copiar */}
        <div className="flex items-center gap-2 mt-2">
          <code className="flex-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono text-slate-600 dark:text-slate-400 truncate">
            ID: {prompt.id}
          </code>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopyId}
            className="h-7 w-7 shrink-0"
            title="Copiar ID"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
          <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-3 font-mono leading-relaxed">
            {prompt.prompt}
          </p>
        </div>

        {prompt.generation_params && (
          <div className="flex flex-wrap gap-1.5">
            <Badge
              variant="secondary"
              className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs"
            >
              T: {prompt.generation_params.temperature}
            </Badge>
            <Badge
              variant="secondary"
              className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs"
            >
              P: {prompt.generation_params.top_p}
            </Badge>
            <Badge
              variant="secondary"
              className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs"
            >
              {prompt.generation_params.max_length_tokens}t
            </Badge>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {prompt.last_updated
              ? format(new Date(prompt.last_updated), "dd/MM/yy", {
                  locale: es,
                })
              : format(new Date(prompt.created_date), "dd/MM/yy", {
                  locale: es,
                })}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(prompt)}
            className="flex-1 h-8 text-xs border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Eye className="w-3 h-3 mr-1.5" />
            Ver
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(prompt.id)}
            className="h-8 px-3 text-xs border-slate-300 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 hover:border-red-300"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
