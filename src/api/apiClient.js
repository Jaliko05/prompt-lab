import axios from 'axios';

// Configuración de la API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const JWT_TOKEN = import.meta.env.VITE_JWT_TOKEN;

// Cliente API
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(JWT_TOKEN && { 'Authorization': `Bearer ${JWT_TOKEN}` })
  },
});

export default apiClient;
