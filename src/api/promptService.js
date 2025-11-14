import apiClient from './apiClient';

const promptService = {
  /**
   * Lista todas las plantillas de prompts
   */
  async list() {
    const response = await apiClient.get('/api/prompt-templates');
    return response.data;
  },

  /**
   * Obtiene una plantilla específica
   */
  async get(templateId) {
    const response = await apiClient.get(`/api/prompt-templates/${templateId}`);
    return response.data;
  },

  /**
   * Crea una nueva plantilla
   */
  async create(data) {
    const now = Date.now() / 1000; // Timestamp en segundos (formato Unix)
    
    const response = await apiClient.post('/api/prompt-templates', {
      name: data.name,
      description: data.description || '',
      prompts_array: [{ text: data.prompt }],
      cache_validity_days: data.cache_validity_days || 30,
      generation_params: {
        top_p: data.generation_params?.top_p || 0.9,
        temperature: data.generation_params?.temperature || 1,
        max_length_tokens: data.generation_params?.max_length_tokens || 2048
      },
      created_by: 'user', // Puedes cambiar esto si tienes un sistema de usuarios
      created_at: now,
      last_updated: now
    });
    return response.data;
  },

  /**
   * Actualiza una plantilla existente
   */
  async update(templateId, data) {
    const updateData = {};
    if (data.name) updateData.name = data.name;
    if (data.description) updateData.description = data.description;
    if (data.prompt) updateData.prompts_array = [{ text: data.prompt }];
    
    const response = await apiClient.put(`/api/prompt-templates/${templateId}`, updateData);
    return response.data;
  },

  /**
   * Elimina una plantilla
   */
  async delete(templateId) {
    const response = await apiClient.delete(`/api/prompt-templates/${templateId}`);
    return response.data;
  }
};

export default promptService;
