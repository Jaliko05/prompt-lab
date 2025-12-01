import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import configService from "@/api/configService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Send,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  X,
  Plus,
} from "lucide-react";
import logo from "/Logo_41_anos.svg";

import ChatMessage from "../components/chat/ChatMessage";

export default function ChatPage() {
  const [prompt, setPrompt] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversations, setConversations] = useState(() => {
    // Cargar conversaciones desde localStorage al iniciar
    const saved = localStorage.getItem("chatHistory");
    return saved ? JSON.parse(saved) : [];
  });
  const [sessionId, setSessionId] = useState(() => {
    // Cargar o crear un nuevo session_id
    const saved = localStorage.getItem("currentSessionId");
    return saved || `session_${Date.now()}`;
  });
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const queryClient = useQueryClient();

  // Obtener configuración directamente desde localStorage
  const [currentConfig, setCurrentConfig] = useState(() => configService.get());

  // Actualizar configuración cuando cambie en localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setCurrentConfig(configService.get());
    };

    window.addEventListener("storage", handleStorageChange);
    // También revisar cambios cada vez que el componente se enfoca
    window.addEventListener("focus", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
    };
  }, []);

  const createConversationMutation = useMutation({
    mutationFn: (data) => base44.entities.Conversation.create(data),
    onSuccess: (newConversation) => {
      // Agregar la nueva conversación al estado local
      setConversations((prev) => {
        const updated = [...prev, newConversation];
        // Guardar en localStorage
        localStorage.setItem("chatHistory", JSON.stringify(updated));
        return updated;
      });
    },
  });

  // Guardar sessionId en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem("currentSessionId", sessionId);
  }, [sessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px"; // Reset height
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 200) + "px"; // Max 200px
    }
  }, [prompt]);

  // Función para iniciar una nueva conversación
  const handleNewConversation = () => {
    setConversations([]);
    setSessionId(`session_${Date.now()}`);
    localStorage.removeItem("chatHistory");
    localStorage.setItem("currentSessionId", `session_${Date.now()}`);
    setPrompt("");
    removeImage();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async () => {
    if (!prompt.trim() && !imageFile) return;

    setIsProcessing(true);
    try {
      // Obtener la configuración más reciente antes de enviar
      const config = configService.get();
      console.log("📋 Configuración usada para el mensaje:", config);

      // Convertir imagen a base64 si existe
      let imageBase64 = null;
      if (imageFile) {
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve, reject) => {
          reader.onloadend = () => {
            // Remover el prefijo "data:image/...;base64,"
            const base64 = reader.result.split(",")[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
      }

      // Enviar directamente a tu API usando el adapter de base44
      const result = await createConversationMutation.mutateAsync({
        prompt: prompt,
        temperature: config.temperature,
        max_tokens: config.max_length_tokens,
        top_p: config.top_p,
        system_instructions: config.system_instructions,
        image_base64: imageBase64,
        image_preview: imagePreview, // Pasar el preview para mostrarlo en el chat
        session_id: sessionId, // Usar el mismo session_id para toda la conversación
      });

      setPrompt("");
      removeImage();
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    }
    setIsProcessing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <img src={logo} alt="Logo" className="w-11 h-11" />

              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Bienvenido a NeuroScore
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-center max-w-md">
                Inicia una conversación con la IA de Sistemas GyG. Escribe un
                prompt o sube una imagen para comenzar.
              </p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <ChatMessage key={conversation.id} conversation={conversation} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <div className="max-w-3xl mx-auto">
          {imagePreview && (
            <div className="mb-3 relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-20 w-20 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900"
                onClick={removeImage}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}

          <div className="flex gap-2 items-end">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            {conversations.length > 0 && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleNewConversation}
                className="shrink-0 h-10 w-10 rounded-lg border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                disabled={isProcessing}
                title="Nueva Conversación"
              >
                <Plus className="w-5 h-5" />
              </Button>
            )}

            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 h-10 w-10 rounded-lg border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              disabled={isProcessing}
              title="Subir imagen"
            >
              <ImageIcon className="w-5 h-5" />
            </Button>

            <Textarea
              ref={textareaRef}
              placeholder="Escribe tu mensaje aquí..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isProcessing}
              className="min-h-[44px] max-h-[200px] resize-none border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-sm overflow-y-auto"
              rows={1}
            />

            <Button
              onClick={handleSendMessage}
              disabled={isProcessing || (!prompt.trim() && !imageFile)}
              className="shrink-0 h-10 w-10 bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
              size="icon"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
