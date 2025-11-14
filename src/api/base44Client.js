import chatService from './chatService';
import promptService from './promptService';
import clientService from './clientService';
import configService from './configService';

// Adapter para mantener la misma interfaz que Base44 (compatibilidad con código existente)
export const base44 = {
  entities: {
    Conversation: {
      list: async () => {
        // Las conversaciones se manejan en estado local del componente
        return [];
      },
      create: async (data) => {
        // Enviar mensaje usando el servicio modular
        const response = await chatService.sendMessage({
          prompt: data.prompt,
          temperature: data.temperature,
          systemInstructions: data.system_instructions,
          imageBase64: data.image_base64,
          sessionId: data.session_id
        });
        
        // Adaptar respuesta a formato esperado por ChatMessage
        return {
          id: Date.now().toString(),
          prompt: data.prompt,
          response: response.full_response,
          metrics: response.metrics,
          created_date: new Date().toISOString(),
          image_url: data.image_preview,
          model_params: {
            temperature: data.temperature || 1,
            top_p: 0.9,
            max_length_tokens: 2048
          }
        };
      }
    },
    ModelConfig: {
      list: async () => {
        const config = configService.get();
        return [{
          id: 'config_1',
          ...config
        }];
      },
      create: async (data) => {
        configService.save(data);
        return { id: 'config_1', ...data };
      },
      update: async (id, data) => {
        configService.save(data);
        return { id, ...data };
      }
    },
    SavedPrompt: {
      list: async () => {
        const templates = await promptService.list();
        // Adaptar formato de respuesta
        return templates.map((template, index) => ({
          id: template.id || template._id || `template_${index}`, // Fallback si no tiene ID
          name: template.name,
          description: template.description,
          prompt: template.prompts_array?.[0]?.text || '',
          created_date: template.created_at
        }));
      },
      get: async (id) => {
        const template = await promptService.get(id);
        return {
          id: template.id,
          name: template.name,
          description: template.description,
          prompt: template.prompts_array?.[0]?.text || '',
          created_date: template.created_at
        };
      },
      create: async (data) => {
        const response = await promptService.create({
          name: data.name,
          description: data.description,
          prompt: data.prompt,
          generation_params: {
            temperature: data.temperature || 0.7,
            max_tokens: 1000
          }
        });
        return {
          id: response.template_id,
          ...data
        };
      },
      update: async (id, data) => {
        await promptService.update(id, data);
        return { id, ...data };
      },
      delete: async (id) => {
        await promptService.delete(id);
        return { id };
      }
    },
    Client: {
      list: async () => {
        // Obtener clientes del backend
        const clients = await clientService.list();
        
        // Adaptar formato: mantener los campos tal como vienen del backend
        return clients.map(client => ({
          id: client.client_name,
          client_name: client.client_name,
          secret_key: client.secret_key, // El backend ya lo devuelve descifrado
          created_date: new Date().toISOString(), // La API no retorna fecha, usar fecha actual
        }));
      },
      create: async (data) => {
        await clientService.createSecret(data.client_name, data.secret_key);
        return { id: data.client_name, ...data };
      },
      update: async (id, data) => {
        await clientService.updateSecret(id, data.secret_key);
        return { id, ...data };
      },
      delete: async (id) => {
        await clientService.deleteSecret(id);
        return { id };
      }
    }
  }
};
