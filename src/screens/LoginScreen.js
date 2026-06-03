import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, cargando } = useAuth();

  async function handleLogin() {
    // Validación de campos obligatorios (manejo de errores del front)
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos incompletos', 'Completá email y contraseña');
      return;
    }

    const resultado = await login(email, password);

    if (resultado.ok) {
      // Login exitoso → ir al Home
      navigation.replace('Home');
    } else {
      // Mostrar el error que devolvió el backend
      Alert.alert('Error', resultado.mensaje);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Logo */}
      <Text style={styles.logo}>⚖️ BidVault</Text>

      {/* Tabs */}
      <View style={styles.tabs}>
        <Text style={styles.tabActive}>Iniciar sesión</Text>
        <Text style={styles.tabInactive}>Registrarse</Text>
      </View>

      {/* Campo email */}
      <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
      <TextInput
        style={styles.input}
        placeholder="juan.garcia@email.com"
        placeholderTextColor={colors.textMuted}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {/* Campo contraseña */}
      <Text style={styles.label}>CONTRASEÑA</Text>
      <TextInput
        style={styles.input}
        placeholder="••••••••"
        placeholderTextColor={colors.textMuted}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Botón ingresar */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={cargando}
      >
        {cargando ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={styles.buttonText}>INGRESAR</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.registerLink}>
        ¿No tenés cuenta? <Text style={{ color: colors.gold }}>Registrate</Text>
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    justifyContent: 'center',
  },
  logo: {
    fontSize: 28,
    color: colors.gold,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 40,
    letterSpacing: 2,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 28,
  },
  tabActive: {
    flex: 1,
    textAlign: 'center',
    color: colors.gold,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.gold,
    fontSize: 14,
  },
  tabInactive: {
    flex: 1,
    textAlign: 'center',
    color: colors.textMuted,
    paddingBottom: 12,
    fontSize: 14,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    color: colors.textPrimary,
    fontSize: 14,
  },
  button: {
    backgroundColor: colors.gold,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  buttonText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 2,
  },
  registerLink: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 24,
    fontSize: 13,
  },
});