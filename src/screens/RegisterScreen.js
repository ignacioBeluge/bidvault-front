/**
 * Registro — Etapa 1
 * Campos obligatorios según reglas de negocio:
 *   - Nombre completo
 *   - Email
 *   - Contraseña (mín. 8 caracteres)
 *   - Domicilio legal (calle, número, ciudad, provincia, CP)
 *   - País de origen
 *   - Foto frente del DNI
 *   - Foto dorso del DNI
 */
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { registerStage1 } from '../api/auth';

function Campo({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, editable = true, error }) {
  return (
    <View style={styles.campo}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType || 'default'}
        autoCapitalize="none"
        editable={editable}
      />
      {error ? <Text style={styles.errorCampo}>{error}</Text> : null}
    </View>
  );
}

function FotoSelector({ label, seleccionada, onSeleccionar }) {
  return (
    <View style={styles.campo}>
      <Text style={styles.label}>{label} <Text style={styles.obligatorio}>*</Text></Text>
      <TouchableOpacity
        style={[styles.fotoBtn, seleccionada && styles.fotoBtnOk]}
        onPress={onSeleccionar}
      >
        <Text style={[styles.fotoBtnTxt, seleccionada && styles.fotoBtnTxtOk]}>
          {seleccionada ? '✓ Foto cargada' : '📷 Seleccionar foto'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    nombre: '', email: '', password: '', confirmarPassword: '',
    calle: '', numero: '', ciudad: '', provincia: '', codigoPostal: '',
    paisOrigen: 'Argentina',
  });
  const [fotoFrente, setFotoFrente] = useState(false);
  const [fotoDorso, setFotoDorso] = useState(false);
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);

  const set = (campo) => (valor) => setForm(f => ({ ...f, [campo]: valor }));

  const validar = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio.';
    if (!form.email.trim()) e.email = 'El email es obligatorio.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido.';
    if (!form.password) e.password = 'La contraseña es obligatoria.';
    else if (form.password.length < 8) e.password = 'Mínimo 8 caracteres.';
    if (form.password !== form.confirmarPassword) e.confirmarPassword = 'Las contraseñas no coinciden.';
    if (!form.calle.trim()) e.calle = 'La calle es obligatoria.';
    if (!form.numero.trim()) e.numero = 'El número es obligatorio.';
    if (!form.ciudad.trim()) e.ciudad = 'La ciudad es obligatoria.';
    if (!form.provincia.trim()) e.provincia = 'La provincia es obligatoria.';
    if (!form.codigoPostal.trim()) e.codigoPostal = 'El código postal es obligatorio.';
    if (!form.paisOrigen.trim()) e.paisOrigen = 'El país es obligatorio.';
    if (!fotoFrente) e.fotoFrente = 'La foto del frente del DNI es obligatoria.';
    if (!fotoDorso) e.fotoDorso = 'La foto del dorso del DNI es obligatoria.';
    return e;
  };

  const handleRegistrar = async () => {
    const e = validar();
    setErrores(e);
    if (Object.keys(e).length > 0) return;

    setCargando(true);
    try {
      await registerStage1({
        nombre: form.nombre,
        email: form.email.toLowerCase().trim(),
        password: form.password,
        domicilio: {
          calle: form.calle, numero: form.numero,
          ciudad: form.ciudad, provincia: form.provincia,
          codigoPostal: form.codigoPostal,
        },
        paisOrigen: form.paisOrigen,
        fotoFrenteUrl: 'pendiente', // Se implementa con expo-image-picker
        fotoDorsoUrl: 'pendiente',
      });
      // Ir a Etapa 2
      navigation.navigate('RegisterStage2', { email: form.email });
    } catch (err) {
      const msg = err.response?.data?.mensaje || 'No se pudo completar el registro.';
      // Si el back aún no tiene el endpoint, igual navegamos para demostrar el flujo
      if (err.response?.status === 404 || !err.response) {
        Alert.alert(
          'Endpoint pendiente',
          'El back aún no tiene el endpoint de registro. Navegando a Etapa 2 para demo.',
          [{ text: 'OK', onPress: () => navigation.navigate('RegisterStage2', { email: form.email }) }]
        );
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">

      <Text style={styles.titulo}>Crear cuenta</Text>
      <Text style={styles.subtitulo}>Etapa 1 de 2 — Datos personales</Text>

      {/* Datos de acceso */}
      <Text style={styles.seccion}>DATOS DE ACCESO</Text>
      <Campo label="Nombre completo *" value={form.nombre} onChangeText={set('nombre')}
        placeholder="Juan García" error={errores.nombre} />
      <Campo label="Email *" value={form.email} onChangeText={set('email')}
        placeholder="juan@email.com" keyboardType="email-address" error={errores.email} />
      <Campo label="Contraseña *" value={form.password} onChangeText={set('password')}
        placeholder="Mínimo 8 caracteres" secureTextEntry error={errores.password} />
      <Campo label="Confirmar contraseña *" value={form.confirmarPassword}
        onChangeText={set('confirmarPassword')} placeholder="Repetir contraseña"
        secureTextEntry error={errores.confirmarPassword} />

      {/* Domicilio */}
      <Text style={styles.seccion}>DOMICILIO LEGAL</Text>
      <Campo label="Calle *" value={form.calle} onChangeText={set('calle')}
        placeholder="Av. Corrientes" error={errores.calle} />
      <Campo label="Número *" value={form.numero} onChangeText={set('numero')}
        placeholder="1234" keyboardType="numeric" error={errores.numero} />
      <Campo label="Ciudad *" value={form.ciudad} onChangeText={set('ciudad')}
        placeholder="Buenos Aires" error={errores.ciudad} />
      <Campo label="Provincia *" value={form.provincia} onChangeText={set('provincia')}
        placeholder="CABA" error={errores.provincia} />
      <Campo label="Código postal *" value={form.codigoPostal} onChangeText={set('codigoPostal')}
        placeholder="1043" keyboardType="numeric" error={errores.codigoPostal} />
      <Campo label="País de origen *" value={form.paisOrigen} onChangeText={set('paisOrigen')}
        placeholder="Argentina" error={errores.paisOrigen} />

      {/* Fotos DNI */}
      <Text style={styles.seccion}>DOCUMENTO DE IDENTIDAD</Text>
      <FotoSelector label="Foto frente del DNI"
        seleccionada={fotoFrente} onSeleccionar={() => setFotoFrente(true)} />
      {errores.fotoFrente && <Text style={styles.errorCampo}>{errores.fotoFrente}</Text>}
      <FotoSelector label="Foto dorso del DNI"
        seleccionada={fotoDorso} onSeleccionar={() => setFotoDorso(true)} />
      {errores.fotoDorso && <Text style={styles.errorCampo}>{errores.fotoDorso}</Text>}

      {/* Botón */}
      <TouchableOpacity
        style={[styles.btn, cargando && styles.btnOff]}
        onPress={handleRegistrar}
        disabled={cargando}
      >
        {cargando
          ? <ActivityIndicator color={colors.background} />
          : <Text style={styles.btnTxt}>CONTINUAR →</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 8 }}>
        <Text style={styles.link}>¿Ya tenés cuenta? <Text style={{ color: colors.gold }}>Iniciá sesión</Text></Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingTop: 60, paddingBottom: 40, gap: 4 },
  titulo: { color: colors.gold, fontSize: 28, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
  subtitulo: { color: colors.textSecondary, fontSize: 13, marginBottom: 20 },
  seccion: { color: colors.textSecondary, fontSize: 11, letterSpacing: 2, marginTop: 20, marginBottom: 4 },
  campo: { marginBottom: 12 },
  label: { color: colors.textSecondary, fontSize: 11, letterSpacing: 1, marginBottom: 6 },
  obligatorio: { color: colors.error },
  input: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 10, padding: 12, color: colors.textPrimary, fontSize: 14,
  },
  inputError: { borderColor: colors.error },
  errorCampo: { color: colors.error, fontSize: 11, marginTop: 3 },
  fotoBtn: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 10, padding: 14, alignItems: 'center',
    borderStyle: 'dashed',
  },
  fotoBtnOk: { borderColor: '#22c55e', backgroundColor: '#14532d', borderStyle: 'solid' },
  fotoBtnTxt: { color: colors.textMuted, fontSize: 14 },
  fotoBtnTxtOk: { color: '#86efac', fontWeight: '600' },
  btn: {
    backgroundColor: colors.gold, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginTop: 24,
  },
  btnOff: { opacity: 0.5 },
  btnTxt: { color: colors.background, fontWeight: 'bold', fontSize: 15, letterSpacing: 2 },
  link: { color: colors.textMuted, textAlign: 'center', fontSize: 13, marginTop: 8 },
});
