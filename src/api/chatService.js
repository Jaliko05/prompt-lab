import apiClient from './apiClient';

const chatService = {
  /**
   * Envía un mensaje al modelo de IA
   */
  async sendMessage({ prompt, temperature, systemInstructions, imageBase64, sessionId }) {
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('temperatura', temperature || 1);
    formData.append('session_id', sessionId || 'default');
    
    if (systemInstructions) {
      formData.append('instrucciones_sistema', systemInstructions);
    }
    
    if (imageBase64) {
      formData.append('imagen_base64', imageBase64);
    }

    const response = await apiClient.post('/api/predict', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    return response.data;
  }
};

export default chatService;
