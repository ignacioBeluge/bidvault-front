import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { colors } from '../theme/colors';
import { registerStage2 } from '../api/auth';

const TIPOS = [
  { id: 'CUENTA_BANCARIA', label: '🏦 Cuenta bancaria' },
  { id: 'TARJETA',         label: '💳 Tarjeta de crédito' },
  { id: 'CHEQUE_CERTIFICADO', label: '📄 Cheque certificado' },
];

export default function RegisterStage2Screen({ navigation, route }) {
  const [tipoSeleccionado, setTipoSeleccionado] = useState('TARJETA');

  // Campos tarjeta
  const [ultimos4, setUltimos4] = useState('');
  const [marca, setMarca] = useState('VISA');
  const [titular, setTitular] = useState('');
  const [vencimiento, setVencimiento] = useState('');

  // Campos cuenta bancaria
  const [banco, setBanco] = useState('');
  const [cbu, setCbu] = useState('');
  const [titularCuenta, setTitularCuenta] = useState('');

  // Campos cheque
  const [bancoEmisor, setBancoEmisor] = useState('');
  const [numeroCheque, setNumeroCheque] = useState('');
  const [montoCheque, setMontoCheque] = useState('');

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const validar = () => {
    if (tipoSeleccionado === 'TARJETA') {
      if (ultimos4.length !== 4) return 'Ingresá los últimos 4 dígitos de la tarjeta.';
      if (!titular.trim()) return 'El titular es obligatorio.';
      if (!/^\d{2}\/\d{2}$/.test(vencimiento)) return 'Formato de vencimiento: MM/AA.';
    } else if (tipoSeleccionado === 'CUENTA_BANCARIA') {
      if (!banco.trim()) return 'El banco es obligatorio.';
      if (cbu.length !== 22) return 'El CBU debe tener 22 dígitos.';
      if (!titularCuenta.trim()) return 'El titular es obligatorio.';
    } else if (tipoSeleccionado === 'CHEQUE_CERTIFICADO') {
      if (!bancoEmisor.trim()) return 'El banco emisor es obligatorio.';
      if (!numeroCheque.trim()) return 'El número de cheque es obligatorio.';
      if (!montoCheque || isNaN(montoCheque)) return 'El monto debe ser un número válido.';
    }
    return null;
  };

  const handleSubmit = async () => {
    const err = validar();
    if (err) { setError(err); return; }

    setError(null);
    setCargando(true);
    try {
      let detalle = {};
      if (tipoSeleccionado === 'TARJETA') {
        detalle = { numero_ultimos4: ultimos4, marca, titular, fecha_vencimiento: vencimiento };
      } else if (tipoSeleccionado === 'CUENTA_BANCARIA') {
        detalle = { banco, cbu, titular: titularCuenta };
      } else {
        detalle = { banco_emisor: bancoEmisor, numero_cheque: numeroCheque, monto: parseFloat(montoCheque) };
      }

      await registerStage2({ tipo: tipoSeleccionado, ...detalle });
      navigation.replace('Home');
    } catch (e) {
      setError(e.response?.data?.mensaje || 'No se pudo registrar el medio de pago.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

      {/* Header */}
      <Text style={styles.titulo}>Crear cuenta</Text>
      <View style={styles.etapas}>
        <View style={styles.etapaCompletada}><Text style={styles.etapaCompletadaTxt}>✓</Text></View>
        <View style={[styles.etapaLinea, { backgroundColor: colors.gold }]} />
        <View style={styles.etapaActiva}><Text style={styles.etapaActivaTxt}>2</Text></View>
      </View>
      <Text style={styles.etapaLabel}>Etapa 2 de 2 — Medio de pago</Text>
      <Text style={styles.etapaInfo}>
        Necesitás registrar un medio de pago para poder realizar pujas.
      </Text>

      {/* Selector de tipo */}
      <Text style={styles.seccion}>TIPO DE MEDIO DE PAGO</Text>
      {TIPOS.map((t) => (
        <TouchableOpacity
          key={t.id}
          style={[styles.tipoBtn, tipoSeleccionado === t.id && styles.tipoBtnActivo]}
          onPress={() => setTipoSeleccionado(t.id)}
        >
          <Text style={[styles.tipoBtnTxt, tipoSeleccionado === t.id && { color: colors.gold }]}>
            {t.label}
          </Text>
          {tipoSeleccionado === t.id && <Text style={styles.tipoCheck}>●</Text>}
        </TouchableOpacity>
      ))}

      {/* Campos según tipo */}
      {tipoSeleccionado === 'TARJETA' && (
        <>
          <Text style={styles.seccion}>DATOS DE LA TARJETA</Text>
          <Campo label="Últimos 4 dígitos" valor={ultimos4} onChange={setUltimos4} placeholder="4521" teclado="numeric" maxLength={4} />
          <Text style={styles.campoLabel}>MARCA</Text>
          <View style={styles.marcasRow}>
            {['VISA', 'MASTERCARD', 'AMEX', 'CABAL', 'NARANJA'].map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.marcaBtn, marca === m && styles.marcaBtnActivo]}
                onPress={() => setMarca(m)}
              >
                <Text style={[styles.marcaTxt, marca === m && { color: colors.gold }]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Campo label="Titular (como figura en la tarjeta)" valor={titular} onChange={setTitular} placeholder="JUAN GARCIA" autoCapitalize="characters" />
          <Campo label="Vencimiento (MM/AA)" valor={vencimiento} onChange={setVencimiento} placeholder="12/28" teclado="numeric" maxLength={5} />
        </>
      )}

      {tipoSeleccionado === 'CUENTA_BANCARIA' && (
        <>
          <Text style={styles.seccion}>DATOS DE LA CUENTA</Text>
          <Campo label="Banco" valor={banco} onChange={setBanco} placeholder="Banco Nación Argentina" />
          <Campo label="CBU (22 dígitos)" valor={cbu} onChange={setCbu} placeholder="0720123888000012345670" teclado="numeric" maxLength={22} />
          <Campo label="Titular" valor={titularCuenta} onChange={setTitularCuenta} placeholder="Juan García" />
        </>
      )}

      {tipoSeleccionado === 'CHEQUE_CERTIFICADO' && (
        <>
          <Text style={styles.seccion}>DATOS DEL CHEQUE</Text>
          <Campo label="Banco emisor" valor={bancoEmisor} onChange={setBancoEmisor} placeholder="Banco Galicia" />
          <Campo label="Número de cheque" valor={numeroCheque} onChange={setNumeroCheque} placeholder="00012345" teclado="numeric" />
          <Campo label="Monto certificado ($)" valor={montoCheque} onChange={setMontoCheque} placeholder="50000" teclado="decimal-pad" />
        </>
      )}

      {/* Error */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorTxt}>⚠️ {error}</Text>
        </View>
      )}

      {/* Botón */}
      <TouchableOpacity
        style={[styles.btn, cargando && styles.btnOff]}
        onPress={handleSubmit}
        disabled={cargando}
      >
        {cargando
          ? <ActivityIndicator color={colors.background} />
          : <Text style={styles.btnTxt}>COMPLETAR REGISTRO</Text>
        }
      </TouchableOpacity>

      <Text style={styles.info}>
        🔒 Tus datos de pago están encriptados y protegidos.
      </Text>
    </ScrollView>
  );
}

function Campo({ label, valor, onChange, placeholder, teclado, seguro, autoCapitalize, maxLength }) {
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
        secureTextEntry={!!seguro}
        autoCapitalize={autoCapitalize || 'none'}
        autoCorrect={false}
        maxLength={maxLength}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, gap: 12, paddingBottom: 40 },
  titulo: { color: colors.gold, fontSize: 24, fontWeight: 'bold', textAlign: 'center', letterSpacing: 1, marginBottom: 8 },
  etapas: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  etapaCompletada: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.gold, justifyContent: 'center', alignItems: 'center' },
  etapaCompletadaTxt: { color: colors.background, fontWeight: '700', fontSize: 14 },
  etapaLinea: { width: 60, height: 2 },
  etapaActiva: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.gold, justifyContent: 'center', alignItems: 'center' },
  etapaActivaTxt: { color: colors.background, fontWeight: '700', fontSize: 14 },
  etapaLabel: { color: colors.textSecondary, fontSize: 12, textAlign: 'center' },
  etapaInfo: { color: colors.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 18 },
  seccion: { color: colors.textSecondary, fontSize: 11, letterSpacing: 2, marginTop: 8 },
  tipoBtn: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tipoBtnActivo: { borderColor: colors.gold },
  tipoBtnTxt: { color: colors.textSecondary, fontSize: 15 },
  tipoCheck: { color: colors.gold, fontSize: 12 },
  campo: { gap: 6 },
  campoLabel: { color: colors.textSecondary, fontSize: 11, letterSpacing: 1 },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 14, color: colors.textPrimary, fontSize: 14 },
  marcasRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  marcaBtn: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  marcaBtnActivo: { borderColor: colors.gold },
  marcaTxt: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  errorBox: { backgroundColor: '#450a0a', borderRadius: 8, padding: 12 },
  errorTxt: { color: '#fca5a5', fontSize: 13 },
  btn: { backgroundColor: colors.gold, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnOff: { opacity: 0.5 },
  btnTxt: { color: colors.background, fontWeight: 'bold', fontSize: 15, letterSpacing: 1 },
  info: { color: colors.textMuted, fontSize: 12, textAlign: 'center' },
});
