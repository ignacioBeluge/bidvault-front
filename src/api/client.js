import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANTE: la URL del backend.
// Para simulador iOS usar localhost. Para dispositivo físico usar la IP de la Mac.
const API_URL = 'http://localhost:8080';

const client = axios.create({
  baseURL: API_URL,
  timeout: 10000,  // 10 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: antes de cada request, agrega el token JWT si existe.
// Así no tenés que poner el token a mano en cada llamada.
client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
