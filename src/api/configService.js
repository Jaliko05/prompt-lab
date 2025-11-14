// Servicio para manejar la configuración del modelo (localStorage)

const configService = {
  /**
   * Obtiene la configuración actual del modelo
   */
  get() {
    const temperature = parseFloat(localStorage.getItem('model_temperature')) || 1;
    const systemInstructions = localStorage.getItem('system_instructions') || '';
    const topP = parseFloat(localStorage.getItem('model_top_p')) || 0.9;
    const maxTokens = parseInt(localStorage.getItem('model_max_tokens')) || 2048;
    
    return {
      temperature,
      system_instructions: systemInstructions,
      top_p: topP,
      max_length_tokens: maxTokens
    };
  },

  /**
   * Guarda la configuración del modelo
   */
  save(config) {
    if (config.temperature !== undefined) {
      localStorage.setItem('model_temperature', config.temperature);
    }
    if (config.system_instructions !== undefined) {
      localStorage.setItem('system_instructions', config.system_instructions);
    }
    if (config.top_p !== undefined) {
      localStorage.setItem('model_top_p', config.top_p);
    }
    if (config.max_length_tokens !== undefined) {
      localStorage.setItem('model_max_tokens', config.max_length_tokens);
    }
  }
};

export default configService;
