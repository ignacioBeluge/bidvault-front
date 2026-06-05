import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { registerStage1 } from '../api/auth';

function FotoButton({ label, tomada, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.fotoBtn, tomada && styles.fotoBtnOk]}
      onPress={onPress}
    >
      <Text style={styles.fotoBtnIcon}>{tomada ? '✓' : '📷'}</Text>
      <Text style={[styles.fotoBtnTxt, tomada && { color: '#86efac' }]}>
        {tomada ? 'Foto cargada' : label}
      </Text>
    </TouchableOpacity>
  );
}

// Campo normal
function Campo({ label, valor, onChange, placeholder, teclado, autoCapitalize }) {
  return (
    <View style={styles.campo}>
      <Text style={styles.campoLabel}>{label.toUpperCase()}</Text>
      <TextInput
        style={styles.input}
        value={valor}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={teclado || 'default'}
        autoCapitalize={autoCapitalize || 'sentences'}
        autoCorrect={false}
      />
    </View>
  );
}

// Campo contraseña con ojito — evita el bug del simulador iOS con secureTextEntry
function CampoPassword({ label, valor, onChange, placeholder }) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={styles.campo}>
      <Text style={styles.campoLabel}>{label.toUpperCase()}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.inputFlex}
          value={valor}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          textContentType="none"
        />
        <TouchableOpacity style={styles.ojito} onPress={() => setVisible(v => !v)}>
          <Ionicons
            name={visible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={colors.textMuted}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function RegisterStage1Screen({ navigation }) {
  const [form, setForm] = useState({
    nombre: '', email: '', password: '', confirmarPassword: '',
    calle: '', numero: '', ciudad: '', provincia: '', codigoPostal: '', paisOrigen: '',
  });
  const [fotoFrente, setFotoFrente] = useState(false);
  const [fotoDorso, setFotoDorso] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const set = (campo) => (valor) => setForm((f) => ({ ...f, [campo]: valor }));

  const validar = () => {
    if (!form.nombre.trim()) return 'El nombre es obligatorio.';
    if (!form.email.trim()) return 'El email es obligatorio.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Email inválido.';
    if (!form.password) return 'La contraseña es obligatoria.';
    if (form.password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
    if (form.password !== form.confirmarPassword) return 'Las contraseñas no coinciden.';
    if (!form.calle.trim() || !form.numero.trim() || !form.ciudad.trim()) return 'Completá el domicilio legal.';
    if (!form.paisOrigen.trim()) return 'El país de origen es obligatorio.';
    if (!fotoFrente) return 'Falta la foto del frente del documento.';
    if (!fotoDorso) return 'Falta la foto del dorso del documento.';
    return null;
  };

  const handleSubmit = async () => {
    const err = validar();
    if (err) { setError(err); return; }

    setError(null);
    setCargando(true);
    try {
      const res = await registerStage1({
        nombre: form.nombre.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        calle: form.calle.trim(),
        numero: form.numero.trim(),
        ciudad: form.ciudad.trim(),
        provincia: form.provincia.trim(),
        codigoPostal: form.codigoPostal.trim(),
        paisOrigen: form.paisOrigen.trim().toUpperCase(),
        fotoFrenteUrl: 'pendiente',
        fotoDorsoUrl: 'pendiente',
      });
      navigation.navigate('RegisterStage2', {
        email: form.email,
        usuarioId: res?.usuarioId,
      });
    } catch (e) {
      const msg = e.response?.data?.mensaje || 'No se pudo completar el registro.';
      setError(msg);
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

      <Text style={styles.titulo}>Crear cuenta</Text>
      <View style={styles.etapas}>
        <View style={styles.etapaActiva}><Text style={styles.etapaActivaTxt}>1</Text></View>
        <View style={styles.etapaLinea} />
        <View style={styles.etapaPendiente}><Text style={styles.etapaPendienteTxt}>2</Text></View>
      </View>
      <Text style={styles.etapaLabel}>Etapa 1 de 2 — Datos personales</Text>

      <Text style={styles.seccion}>DATOS PERSONALES</Text>
      <Campo label="Nombre completo" valor={form.nombre} onChange={set('nombre')} placeholder="Juan García" />
      <Campo label="Email" valor={form.email} onChange={set('email')} placeholder="juan@email.com" teclado="email-address" autoCapitalize="none" />
      <CampoPassword label="Contraseña" valor={form.password} onChange={set('password')} placeholder="Mínimo 8 caracteres" />
      <CampoPassword label="Confirmar contraseña" valor={form.confirmarPassword} onChange={set('confirmarPassword')} placeholder="Repetí la contraseña" />
      <Campo label="País de origen (código ISO)" valor={form.paisOrigen} onChange={set('paisOrigen')} placeholder="AR" autoCapitalize="characters" />

      <Text style={styles.seccion}>DOMICILIO LEGAL</Text>
      <Campo label="Calle" valor={form.calle} onChange={set('calle')} placeholder="Av. Corrientes" />
      <Campo label="Número" valor={form.numero} onChange={set('numero')} placeholder="1234" teclado="numeric" />
      <Campo label="Ciudad" valor={form.ciudad} onChange={set('ciudad')} placeholder="Buenos Aires" />
      <Campo label="Provincia" valor={form.provincia} onChange={set('provincia')} placeholder="CABA" />
      <Campo label="Código postal" valor={form.codigoPostal} onChange={set('codigoPostal')} placeholder="1043" teclado="numeric" />

      <Text style={styles.seccion}>DOCUMENTO DE IDENTIDAD</Text>
      <Text style={styles.fotoHint}>Necesitamos ambas caras de tu DNI o pasaporte.</Text>
      <FotoButton label="Tomar foto del FRENTE" tomada={fotoFrente} onPress={() => setFotoFrente(true)} />
      <FotoButton label="Tomar foto del DORSO" tomada={fotoDorso} onPress={() => setFotoDorso(true)} />

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorTxt}>⚠️ {error}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.btn, cargando && styles.btnOff]}
        onPress={handleSubmit}
        disabled={cargando}
      >
        {cargando
          ? <ActivityIndicator color={colors.background} />
          : <Text style={styles.btnTxt}>CONTINUAR A ETAPA 2</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 8 }}>
        <Text style={styles.link}>¿Ya tenés cuenta? <Text style={{ color: colors.gold }}>Iniciá sesión</Text></Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, gap: 12, paddingBottom: 40 },
  titulo: { color: colors.gold, fontSize: 24, fontWeight: 'bold', textAlign: 'center', letterSpacing: 1, marginBottom: 8 },
  etapas: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  etapaActiva: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.gold, justifyContent: 'center', alignItems: 'center' },
  etapaActivaTxt: { color: colors.background, fontWeight: '700', fontSize: 14 },
  etapaLinea: { width: 60, height: 2, backgroundColor: colors.border },
  etapaPendiente: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  etapaPendienteTxt: { color: colors.textMuted, fontWeight: '700', fontSize: 14 },
  etapaLabel: { color: colors.textSecondary, fontSize: 12, textAlign: 'center', marginBottom: 8 },
  seccion: { color: colors.textSecondary, fontSize: 11, letterSpacing: 2, marginTop: 8 },
  campo: { gap: 6 },
  campoLabel: { color: colors.textSecondary, fontSize: 11, letterSpacing: 1 },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 14, color: colors.textPrimary, fontSize: 14 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10 },
  inputFlex: { flex: 1, padding: 14, color: colors.textPrimary, fontSize: 14 },
  ojito: { padding: 14 },
  fotoHint: { color: colors.textMuted, fontSize: 12 },
  fotoBtn: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  fotoBtnOk: { borderColor: '#22c55e', backgroundColor: '#14532d22' },
  fotoBtnIcon: { fontSize: 20 },
  fotoBtnTxt: { color: colors.textSecondary, fontSize: 14 },
  errorBox: { backgroundColor: '#450a0a', borderRadius: 8, padding: 12 },
  errorTxt: { color: '#fca5a5', fontSize: 13 },
  btn: { backgroundColor: colors.gold, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnOff: { opacity: 0.5 },
  btnTxt: { color: colors.background, fontWeight: 'bold', fontSize: 15, letterSpacing: 1 },
  link: { color: colors.textMuted, textAlign: 'center', fontSize: 13 },
});
