import apiClient from './apiClient';

const ADMIN_API_KEY = import.meta.env.VITE_ADMIN_API_KEY;

const clientService = {
  /**
   * Lista todos los clientes (si el endpoint existe)
   */
  async list() {
    try {
      const response = await apiClient.get('/admin/secretos', {
        headers: { 'X-Admin-API-Key': ADMIN_API_KEY }
      });
      
      // La API retorna: { success: true, total: X, clients: [...] }
      const data = response.data;
      
      if (data && Array.isArray(data.clients)) {
        return data.clients;
      }
      
      // Si no tiene la estructura esperada, retornar array vacío
      console.warn('⚠️ La respuesta de /admin/secretos no tiene la estructura esperada:', data);
      return [];
    } catch (error) {
      // Si el endpoint no existe (404), retornar array vacío
      if (error.response?.status === 404) {
        console.warn('⚠️ Endpoint /admin/secretos (GET) no implementado en el backend');
        return [];
      }
      throw error;
    }
  },

  /**
   * Crea un secreto JWT para un nuevo cliente
   */
  async createSecret(clientName, secretKey) {
    const response = await apiClient.post('/admin/secretos', {
      client_name: clientName,
      secret_key: secretKey
    }, {
      headers: { 'X-Admin-API-Key': ADMIN_API_KEY }
    });
    return response.data;
  },

  /**
   * Actualiza el secreto de un cliente
   */
  async updateSecret(clientName, secretKey) {
    const response = await apiClient.put(`/admin/secretos/${clientName}`, {
      secret_key: secretKey
    }, {
      headers: { 'X-Admin-API-Key': ADMIN_API_KEY }
    });
    return response.data;
  },

  /**
   * Elimina el secreto de un cliente
   */
  async deleteSecret(clientName) {
    const response = await apiClient.delete(`/admin/secretos/${clientName}`, {
      headers: { 'X-Admin-API-Key': ADMIN_API_KEY }
    });
    return response.data;
  },

  /**
   * Recarga el caché de secretos
   */
  async reloadCache() {
    const response = await apiClient.post('/admin/secretos/recargar-cache', {}, {
      headers: { 'X-Admin-API-Key': ADMIN_API_KEY }
    });
    return response.data;
  }
};

export default clientService;
