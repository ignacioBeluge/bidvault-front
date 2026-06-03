import React, { createContext, useState, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as loginApi } from '../api/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(false);

  // Hace login y guarda el token + datos del usuario
  async function login(email, password) {
    setCargando(true);
    try {
      const data = await loginApi(email, password);
      // Guardamos el token en el celular para futuras requests
      await AsyncStorage.setItem('token', data.token);
      setUsuario({
        id: data.usuarioId,
        nombre: data.nombre,
        categoria: data.categoria,
        etapaRegistro: data.etapaRegistro,
      });
      return { ok: true };
    } 
    catch (error) {
  console.log('ERROR LOGIN:', JSON.stringify(error.message));
  console.log('ERROR CODE:', error.code);
  const mensaje = error.response?.data?.mensaje
    || 'No se pudo conectar con el servidor';
  return { ok: false, mensaje };
} finally {
      setCargando(false);
    }
  }

  // Cierra sesión
  async function logout() {
    await AsyncStorage.removeItem('token');
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto fácil en cualquier pantalla
export function useAuth() {
  return useContext(AuthContext);
}