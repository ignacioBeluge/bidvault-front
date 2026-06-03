/**
 * ProposeItemScreen — Proponer artículo para subasta
 *
 * Reglas de negocio obligatorias:
 *   - Mínimo 6 fotos del artículo
 *   - Checkbox declaratorio: el bien es de origen lícito y le pertenece al usuario
 *   - Descripción del artículo
 *   - Precio base sugerido
 *   - Categoría sugerida
 */
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

const CATEGORIAS = ['comun', 'especial', 'plata', 'oro', 'platino'];
const CATEGORIA_LABELS = {
  comun: 'Común', especial: 'Especial', plata: 'Plata', oro: 'Oro', platino: 'Platino',
};
const FOTOS_REQUERIDAS = 6;

function Campo({ label, valor, onChange, placeholder, teclado, multiline, maxLength, error }) {
  return (
    <View style={styles.campo}>
      <Text style={styles.campoLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMulti, error && styles.inputError]}
        value={valor}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={teclado || 'default'}
        multiline={!!multiline}
        numberOfLines={multiline ? 4 : 1}
        maxLength={maxLength}
        autoCapitalize="sentences"
        autoCorrect={false}
      />
      {error ? <Text style={styles.errorTxt}>{error}</Text> : null}
    </View>
  );
}

function SelectorFotos({ fotos, onAgregar, onEliminar }) {
  const slots = Array.from({ length: Math.max(FOTOS_REQUERIDAS, fotos.length + 1) });

  return (
    <View>
      <View style={styles.fotosGrid}>
        {slots.map((_, i) => {
          const tieneFoto = i < fotos.length;
          const esAgregar = i === fotos.length;

          if (tieneFoto) {
            return (
              <View key={i} style={styles.fotoSlotOk}>
                <Ionicons name="image-outline" size={28} color="#86efac" />
                <Text style={styles.fotoNum}>#{i + 1}</Text>
                <TouchableOpacity style={styles.fotoEliminarBtn} onPress={() => onEliminar(i)}>
                  <Ionicons name="close-circle" size={18} color="#f87171" />
                </TouchableOpacity>
              </View>
            );
          }

          if (esAgregar && fotos.length < 10) {
            return (
              <TouchableOpacity key={i} style={styles.fotoSlotAdd} onPress={onAgregar}>
                <Ionicons name="camera-outline" size={28} color={colors.textMuted} />
                <Text style={styles.fotoAddTxt}>Agregar</Text>
              </TouchableOpacity>
            );
          }

          return (
            <View key={i} style={styles.fotoSlotVacio}>
              <Ionicons name="image-outline" size={24} color={colors.border} />
            </View>
          );
        })}
      </View>

      <View style={styles.fotosProgreso}>
        <View style={[
          styles.fotosProgresoBar,
          { width: `${Math.min((fotos.length / FOTOS_REQUERIDAS) * 100, 100)}%` },
          fotos.length >= FOTOS_REQUERIDAS && { backgroundColor: '#22c55e' },
        ]} />
      </View>
      <Text style={styles.fotosCont}>
        {fotos.length} de {FOTOS_REQUERIDAS} fotos requeridas
        {fotos.length >= FOTOS_REQUERIDAS && ' ✓'}
      </Text>
    </View>
  );
}

export default function ProposeItemScreen({ navigation }) {
  const { usuario } = useAuth();

  const [form, setForm] = useState({
    descripcion: '',
    precioBase: '',
    categoria: 'plata',
    observaciones: '',
  });
  const [fotos, setFotos] = useState([]);
  const [declaracion, setDeclaracion] = useState(false);
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);

  const set = (campo) => (valor) => setForm(f => ({ ...f, [campo]: valor }));

  const agregarFoto = () => {
    // Simula selección de foto — integrar expo-image-picker en versión final
    if (fotos.length >= 10) return;
    setFotos(prev => [...prev, { uri: `foto_${Date.now()}`, placeholder: true }]);
  };

  const eliminarFoto = (index) => {
    setFotos(prev => prev.filter((_, i) => i !== index));
  };

  const validar = () => {
    const e = {};
    if (!form.descripcion.trim() || form.descripcion.trim().length < 20)
      e.descripcion = 'La descripción debe tener al menos 20 caracteres.';
    if (!form.precioBase || isNaN(form.precioBase) || Number(form.precioBase) <= 0)
      e.precioBase = 'Ingresá un precio base válido.';
    if (fotos.length < FOTOS_REQUERIDAS)
      e.fotos = `Se requieren al menos ${FOTOS_REQUERIDAS} fotos del artículo.`;
    if (!declaracion)
      e.declaracion = 'Debés declarar que el bien es lícito y te pertenece.';
    return e;
  };

  const handleSubmit = async () => {
    const e = validar();
    setErrores(e);
    if (Object.keys(e).length > 0) return;

    setCargando(true);
    try {
      // TODO: conectar con endpoint real cuando Ignacio lo implemente
      // POST /items/propose
      // Body: { descripcion, precioBase, categoriasSugerida, fotoUrls[], declaracionOrigen: true }
      await new Promise(r => setTimeout(r, 1200)); // simula latencia

      Alert.alert(
        '¡Propuesta enviada!',
        'Tu artículo fue enviado para revisión. Te notificaremos cuando sea aprobado para subasta.',
        [{ text: 'Aceptar', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert('Error', err.response?.data?.mensaje || 'No se pudo enviar la propuesta.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.intro}>
        Completá el formulario para proponer tu artículo. El equipo de BidVault lo revisará antes de incluirlo en una subasta.
      </Text>

      {/* Fotos */}
      <Text style={styles.seccion}>FOTOS DEL ARTÍCULO <Text style={styles.req}>*</Text></Text>
      <Text style={styles.hint}>Mínimo {FOTOS_REQUERIDAS} fotos desde distintos ángulos. Máximo 10.</Text>
      <SelectorFotos fotos={fotos} onAgregar={agregarFoto} onEliminar={eliminarFoto} />
      {errores.fotos && <Text style={styles.errorTxt}>{errores.fotos}</Text>}

      {/* Descripción */}
      <Text style={styles.seccion}>DESCRIPCIÓN DEL ARTÍCULO <Text style={styles.req}>*</Text></Text>
      <Campo
        label="Descripción detallada"
        valor={form.descripcion}
        onChange={set('descripcion')}
        placeholder="Describí el artículo: origen, época, materiales, estado de conservación, historia..."
        multiline
        maxLength={800}
        error={errores.descripcion}
      />
      <Text style={styles.charCount}>{form.descripcion.length}/800</Text>

      {/* Precio base */}
      <Text style={styles.seccion}>VALUACIÓN</Text>
      <Campo
        label="Precio base sugerido ($)"
        valor={form.precioBase}
        onChange={set('precioBase')}
        placeholder="150000"
        teclado="numeric"
        error={errores.precioBase}
      />
      <Text style={styles.hint}>El precio final lo determina el equipo de BidVault.</Text>

      {/* Categoría sugerida */}
      <Text style={styles.seccion}>CATEGORÍA SUGERIDA</Text>
      <View style={styles.categoriasRow}>
        {CATEGORIAS.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoriaBtn, form.categoria === cat && styles.categoriaBtnActivo]}
            onPress={() => set('categoria')(cat)}
          >
            <Text style={[styles.categoriaBtnTxt, form.categoria === cat && { color: colors.gold }]}>
              {CATEGORIA_LABELS[cat]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Observaciones opcionales */}
      <Text style={styles.seccion}>OBSERVACIONES ADICIONALES</Text>
      <Campo
        label="Información extra (opcional)"
        valor={form.observaciones}
        onChange={set('observaciones')}
        placeholder="Certificados de autenticidad, proveniencia, restauraciones, etc."
        multiline
        maxLength={400}
      />

      {/* Checkbox declaratorio — obligatorio por reglas de negocio */}
      <Text style={styles.seccion}>DECLARACIÓN JURADA <Text style={styles.req}>*</Text></Text>
      <TouchableOpacity
        style={[styles.checkRow, declaracion && styles.checkRowActivo]}
        onPress={() => setDeclaracion(d => !d)}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, declaracion && styles.checkboxActivo]}>
          {declaracion && <Ionicons name="checkmark" size={14} color={colors.background} />}
        </View>
        <Text style={styles.checkTxt}>
          Declaro bajo juramento que el bien descripto es de{' '}
          <Text style={styles.checkBold}>origen lícito</Text> y me{' '}
          <Text style={styles.checkBold}>pertenece legítimamente</Text>. Entiendo que
          una declaración falsa puede derivar en acciones legales.
        </Text>
      </TouchableOpacity>
      {errores.declaracion && <Text style={styles.errorTxt}>{errores.declaracion}</Text>}

      {/* Botón enviar */}
      <TouchableOpacity
        style={[styles.btn, cargando && styles.btnOff]}
        onPress={handleSubmit}
        disabled={cargando}
      >
        {cargando
          ? <ActivityIndicator color={colors.background} />
          : (
            <View style={styles.btnInner}>
              <Ionicons name="send-outline" size={18} color={colors.background} />
              <Text style={styles.btnTxt}>ENVIAR PROPUESTA</Text>
            </View>
          )
        }
      </TouchableOpacity>

      <Text style={styles.footer}>
        Una vez enviada, el equipo de BidVault revisará tu propuesta en un plazo de 48-72hs hábiles.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 48, gap: 8 },

  intro: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, marginBottom: 8 },

  seccion: { color: colors.textSecondary, fontSize: 10, letterSpacing: 2, fontWeight: '700', marginTop: 16, marginBottom: 6 },
  req: { color: '#f87171' },
  hint: { color: colors.textMuted, fontSize: 11, marginBottom: 8, lineHeight: 16 },

  // Fotos
  fotosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  fotoSlotOk: {
    width: 90, height: 90, borderRadius: 10,
    backgroundColor: '#14532d22', borderWidth: 1, borderColor: '#22c55e',
    justifyContent: 'center', alignItems: 'center',
    position: 'relative',
  },
  fotoNum: { color: '#86efac', fontSize: 10, marginTop: 2 },
  fotoEliminarBtn: { position: 'absolute', top: 4, right: 4 },
  fotoSlotAdd: {
    width: 90, height: 90, borderRadius: 10,
    backgroundColor: colors.surface, borderWidth: 1,
    borderColor: colors.gold, borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center', gap: 4,
  },
  fotoAddTxt: { color: colors.gold, fontSize: 11 },
  fotoSlotVacio: {
    width: 90, height: 90, borderRadius: 10,
    backgroundColor: colors.surface, borderWidth: 1,
    borderColor: colors.border, borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center',
  },
  fotosProgreso: {
    height: 3, backgroundColor: colors.border, borderRadius: 2, marginBottom: 6,
  },
  fotosProgresoBar: {
    height: 3, backgroundColor: colors.gold, borderRadius: 2,
  },
  fotosCont: { color: colors.textMuted, fontSize: 11, marginBottom: 4 },

  // Campos
  campo: { gap: 6 },
  campoLabel: { color: colors.textSecondary, fontSize: 11, letterSpacing: 1 },
  input: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 10, padding: 14, color: colors.textPrimary, fontSize: 14,
  },
  inputMulti: { height: 100, textAlignVertical: 'top' },
  inputError: { borderColor: '#f87171' },
  charCount: { color: colors.textMuted, fontSize: 10, textAlign: 'right', marginTop: 2 },
  errorTxt: { color: '#f87171', fontSize: 11, marginTop: 2 },

  // Categorías
  categoriasRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoriaBtn: {
    borderWidth: 1, borderColor: colors.border,
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: colors.surface,
  },
  categoriaBtnActivo: { borderColor: colors.gold },
  categoriaBtnTxt: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },

  // Checkbox
  checkRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: colors.border,
    padding: 14,
  },
  checkRowActivo: { borderColor: colors.gold, backgroundColor: colors.gold + '11' },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: colors.border,
    justifyContent: 'center', alignItems: 'center',
    marginTop: 1, flexShrink: 0,
  },
  checkboxActivo: { backgroundColor: colors.gold, borderColor: colors.gold },
  checkTxt: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, flex: 1 },
  checkBold: { color: colors.textPrimary, fontWeight: '700' },

  // Botón
  btn: {
    backgroundColor: colors.gold, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginTop: 16,
  },
  btnOff: { opacity: 0.5 },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnTxt: { color: colors.background, fontWeight: 'bold', fontSize: 15, letterSpacing: 1 },

  footer: { color: colors.textMuted, fontSize: 11, textAlign: 'center', lineHeight: 16, marginTop: 8 },
});
