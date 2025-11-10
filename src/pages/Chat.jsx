import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Image as ImageIcon, Loader2, Sparkles, X } from "lucide-react";

import ChatMessage from "../components/chat/ChatMessage";

export default function ChatPage() {
  const [prompt, setPrompt] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => base44.entities.Conversation.list('-created_date'),
    initialData: [],
  });

  const { data: configs = [] } = useQuery({
    queryKey: ['modelConfigs'],
    queryFn: () => base44.entities.ModelConfig.list('-created_date', 1),
    initialData: [],
  });

  const currentConfig = configs[0] || {
    temperature: 0.7,
    top_p: 0.9,
    max_length_tokens: 2048
  };

  const createConversationMutation = useMutation({
    mutationFn: (data) => base44.entities.Conversation.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations]);

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
      let imageUrl = null;
      if (imageFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: imageFile });
        imageUrl = file_url;
      }

      const llmPrompt = `${prompt}${imageUrl ? '\n\n[Imagen adjunta en el contexto]' : ''}`;
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: llmPrompt,
        file_urls: imageUrl ? [imageUrl] : undefined,
      });

      await createConversationMutation.mutateAsync({
        prompt: prompt,
        response: result,
        image_url: imageUrl,
        model_params: currentConfig
      });

      setPrompt("");
      removeImage();
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    }
    setIsProcessing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg mb-6">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Bienvenido a PromptLab
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-center max-w-md">
                Inicia una conversación con la IA. Escribe un prompt o sube una imagen para comenzar.
              </p>
            </div>
          ) : (
            conversations.slice().reverse().map((conversation) => (
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
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 h-10 w-10 rounded-lg border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              disabled={isProcessing}
            >
              <ImageIcon className="w-5 h-5" />
            </Button>
            
            <Textarea
              placeholder="Escribe tu mensaje aquí..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isProcessing}
              className="min-h-[44px] max-h-[120px] resize-none border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-sm"
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