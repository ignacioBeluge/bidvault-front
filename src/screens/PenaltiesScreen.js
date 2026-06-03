/**
 * PenaltiesScreen — Gestión de multas
 *
 * Reglas de negocio:
 *   - Si un usuario gana una subasta y no presenta los fondos en 72hs:
 *       → Multa del 10% del valor ofertado
 *       → Bloqueo de otras subastas hasta regularizar
 *   - El usuario puede ver sus multas activas e historial
 *   - Puede pagar la multa para desbloquearse
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

// Mock — reemplazar con GET /users/{id}/penalties cuando el back lo implemente
const getMockMultas = (usuarioId) => ({
  bloqueado: true,
  multasPendientes: [
    {
      id: 1,
      subastaId: 5,
      subastaUbicacion: 'Belgrano, CABA',
      itemDescripcion: 'Escultura bronce Art Déco — Chiparus, 1925',
      montoOfertado: 218000,
      multaMonto: 21800,   // 10% de 218000
      fechaSubasta: '2026-05-20',
      fechaLimite: '2026-05-23T20:10:00',
      horasRestantes: 0,   // ya venció
      estado: 'vencida',
    },
  ],
  multasHistorial: [
    {
      id: 2,
      subastaId: 3,
      itemDescripcion: 'Reloj de bolsillo Patek Philippe 1920',
      montoOfertado: 102000,
      multaMonto: 10200,
      fechaSubasta: '2026-04-10',
      estado: 'pagada',
      fechaPago: '2026-04-12',
    },
  ],
});

function formatMonto(n) {
  return '$' + Number(n).toLocaleString('es-AR');
}

function CountdownTimer({ fechaLimite }) {
  const limite = new Date(fechaLimite);
  const ahora = new Date();
  const diffMs = limite - ahora;

  if (diffMs <= 0) {
    return <Text style={styles.timerVencido}>Plazo vencido</Text>;
  }

  const horas = Math.floor(diffMs / 3600000);
  const minutos = Math.floor((diffMs % 3600000) / 60000);
  return (
    <Text style={styles.timerActivo}>
      ⏱ {horas}h {minutos}m restantes para pagar
    </Text>
  );
}

function MultaCard({ multa, onPagar, pagando }) {
  const esVencida = multa.estado === 'vencida';
  const esPagada = multa.estado === 'pagada';

  return (
    <View style={[styles.card, esPagada && styles.cardPagada]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderBody}>
          <Text style={styles.cardDesc} numberOfLines={2}>{multa.itemDescripcion}</Text>
          <Text style={styles.cardUbicacion}>
            {multa.subastaUbicacion || ''}
          </Text>
        </View>
        <View style={[
          styles.estadoBadge,
          esVencida && styles.estadoVencida,
          esPagada && styles.estadoPagada,
          !esVencida && !esPagada && styles.estadoPendiente,
        ]}>
          <Text style={[
            styles.estadoTxt,
            esVencida && { color: '#fca5a5' },
            esPagada && { color: '#86efac' },
            !esVencida && !esPagada && { color: '#fbbf24' },
          ]}>
            {esVencida ? 'VENCIDA' : esPagada ? 'PAGADA' : 'PENDIENTE'}
          </Text>
        </View>
      </View>

      <View style={styles.montosRow}>
        <View style={styles.montoCol}>
          <Text style={styles.montoLabel}>OFERTA GANADA</Text>
          <Text style={styles.montoValor}>{formatMonto(multa.montoOfertado)}</Text>
        </View>
        <Ionicons name="arrow-forward-outline" size={16} color={colors.textMuted} />
        <View style={styles.montoCol}>
          <Text style={styles.montoLabel}>MULTA (10%)</Text>
          <Text style={[styles.montoValor, { color: esPagada ? '#86efac' : '#f87171' }]}>
            {formatMonto(multa.multaMonto)}
          </Text>
        </View>
      </View>

      {!esPagada && (
        <CountdownTimer fechaLimite={multa.fechaLimite} />
      )}

      {esPagada && (
        <Text style={styles.fechaPago}>✓ Pagada el {multa.fechaPago}</Text>
      )}

      {!esPagada && (
        <TouchableOpacity
          style={[styles.pagarBtn, pagando && styles.btnOff]}
          onPress={() => onPagar(multa)}
          disabled={pagando}
        >
          {pagando
            ? <ActivityIndicator color={colors.background} size="small" />
            : (
              <>
                <Ionicons name="card-outline" size={16} color={colors.background} />
                <Text style={styles.pagarBtnTxt}>Pagar {formatMonto(multa.multaMonto)}</Text>
              </>
            )
          }
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function PenaltiesScreen() {
  const { usuario } = useAuth();
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [pagandoId, setPagandoId] = useState(null);

  useFocusEffect(useCallback(() => {
    setCargando(true);
    // TODO: reemplazar con GET /users/{usuario.id}/penalties
    setTimeout(() => {
      setData(getMockMultas(usuario?.id));
      setCargando(false);
    }, 500);
  }, [usuario]));

  const handlePagar = (multa) => {
    Alert.alert(
      'Confirmar pago de multa',
      `Vas a pagar ${formatMonto(multa.multaMonto)} correspondiente a la multa por no acreditar fondos en la subasta.\n\nSe debitará de tu medio de pago registrado.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Pagar ahora',
          onPress: async () => {
            setPagandoId(multa.id);
            // TODO: POST /penalties/{multa.id}/pay
            await new Promise(r => setTimeout(r, 1500));
            setData(prev => ({
              ...prev,
              bloqueado: prev.multasPendientes.length <= 1 ? false : prev.bloqueado,
              multasPendientes: prev.multasPendientes.filter(m => m.id !== multa.id),
              multasHistorial: [
                { ...multa, estado: 'pagada', fechaPago: new Date().toISOString().split('T')[0] },
                ...prev.multasHistorial,
              ],
            }));
            setPagandoId(null);
            Alert.alert(
              '¡Multa pagada!',
              prev => prev.multasPendientes.length <= 1
                ? 'Tu cuenta fue desbloqueada. Ya podés participar en subastas.'
                : 'Pago registrado exitosamente.'
            );
          },
        },
      ]
    );
  };

  if (cargando) return (
    <View style={styles.centered}>
      <ActivityIndicator color={colors.gold} size="large" />
    </View>
  );

  const tienePendientes = data.multasPendientes.length > 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Banner de bloqueo */}
      {data.bloqueado && (
        <View style={styles.bloqueoBox}>
          <Ionicons name="lock-closed" size={28} color="#fca5a5" />
          <View style={styles.bloqueoBody}>
            <Text style={styles.bloqueoTitulo}>Cuenta bloqueada</Text>
            <Text style={styles.bloqueoDesc}>
              No podés participar en subastas hasta regularizar las multas pendientes.
            </Text>
          </View>
        </View>
      )}

      {!data.bloqueado && !tienePendientes && (
        <View style={styles.okBox}>
          <Ionicons name="checkmark-circle-outline" size={28} color="#86efac" />
          <View style={styles.bloqueoBody}>
            <Text style={[styles.bloqueoTitulo, { color: '#86efac' }]}>Todo en orden</Text>
            <Text style={styles.bloqueoDesc}>No tenés multas pendientes.</Text>
          </View>
        </View>
      )}

      {/* Multas pendientes */}
      {tienePendientes && (
        <>
          <Text style={styles.seccion}>MULTAS PENDIENTES</Text>
          {data.multasPendientes.map(multa => (
            <MultaCard
              key={multa.id}
              multa={multa}
              onPagar={handlePagar}
              pagando={pagandoId === multa.id}
            />
          ))}
        </>
      )}

      {/* Info de la regla */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
        <Text style={styles.infoTxt}>
          Si ganás una subasta y no acreditás los fondos dentro de las{' '}
          <Text style={styles.infoBold}>72 horas</Text>, se aplica una multa del{' '}
          <Text style={styles.infoBold}>10% del monto ofertado</Text> y tu cuenta queda bloqueada
          hasta regularizar la deuda.
        </Text>
      </View>

      {/* Historial */}
      {data.multasHistorial.length > 0 && (
        <>
          <Text style={styles.seccion}>HISTORIAL</Text>
          {data.multasHistorial.map(multa => (
            <MultaCard
              key={multa.id}
              multa={multa}
              onPagar={handlePagar}
              pagando={false}
            />
          ))}
        </>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 48, gap: 12 },
  centered: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },

  bloqueoBox: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#450a0a', borderRadius: 14,
    borderWidth: 1, borderColor: '#f8717144', padding: 16,
  },
  okBox: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#14532d22', borderRadius: 14,
    borderWidth: 1, borderColor: '#22c55e44', padding: 16,
  },
  bloqueoBody: { flex: 1 },
  bloqueoTitulo: { color: '#fca5a5', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  bloqueoDesc: { color: colors.textSecondary, fontSize: 12, lineHeight: 17 },

  seccion: {
    color: colors.textSecondary, fontSize: 10,
    letterSpacing: 2, fontWeight: '700', marginTop: 4,
  },

  card: {
    backgroundColor: colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: colors.border, padding: 14, gap: 10,
  },
  cardPagada: { opacity: 0.7 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  cardHeaderBody: { flex: 1 },
  cardDesc: { color: colors.textPrimary, fontSize: 13, fontWeight: '600', lineHeight: 18, marginBottom: 3 },
  cardUbicacion: { color: colors.textMuted, fontSize: 11 },

  estadoBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  estadoVencida: { backgroundColor: '#450a0a' },
  estadoPagada: { backgroundColor: '#14532d' },
  estadoPendiente: { backgroundColor: '#451a03' },
  estadoTxt: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },

  montosRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    backgroundColor: colors.background, borderRadius: 8, padding: 10,
  },
  montoCol: { alignItems: 'center', gap: 3 },
  montoLabel: { color: colors.textMuted, fontSize: 9, letterSpacing: 1 },
  montoValor: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },

  timerActivo: { color: '#fbbf24', fontSize: 12, textAlign: 'center' },
  timerVencido: { color: '#f87171', fontSize: 12, textAlign: 'center', fontWeight: '600' },
  fechaPago: { color: '#86efac', fontSize: 11, textAlign: 'center' },

  pagarBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.gold, borderRadius: 10, paddingVertical: 12,
  },
  btnOff: { opacity: 0.5 },
  pagarBtnTxt: { color: colors.background, fontWeight: '700', fontSize: 14 },

  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: colors.surface, borderRadius: 10,
    borderWidth: 1, borderColor: colors.border, padding: 12,
  },
  infoTxt: { color: colors.textMuted, fontSize: 12, lineHeight: 18, flex: 1 },
  infoBold: { color: colors.textSecondary, fontWeight: '700' },
});
