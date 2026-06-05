import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

// Mock data — reemplazar con llamada al endpoint cuando Ignacio lo implemente:
// GET /users/{id}/bids  o  GET /bids/history
const getMockHistorial = (usuarioId) => [
  {
    id: 1,
    subastaId: 1,
    subastaUbicacion: 'Palermo, CABA',
    subastaFecha: '2026-06-17',
    itemDescripcion: 'Jarrón Ming — Dinastía Qing, circa 1680',
    precioBase: 120000,
    montoOfertado: 125000,
    mejorOfertaFinal: 132000,
    estado: 'perdida',   // 'ganada' | 'perdida' | 'activa' | 'pendiente_pago'
    fecha: '2026-06-02T18:45:00',
  },
  {
    id: 2,
    subastaId: 2,
    subastaUbicacion: 'Recoleta, CABA',
    subastaFecha: '2026-05-28',
    itemDescripcion: 'Reloj de bolsillo Patek Philippe 1920',
    precioBase: 85000,
    montoOfertado: 102000,
    mejorOfertaFinal: 102000,
    estado: 'ganada',
    fecha: '2026-05-28T20:10:00',
  },
  {
    id: 3,
    subastaId: 3,
    subastaUbicacion: 'San Telmo, CABA',
    subastaFecha: '2026-06-17',
    itemDescripcion: 'Escultura bronce Art Déco — Chiparus, 1925',
    precioBase: 200000,
    montoOfertado: 218000,
    mejorOfertaFinal: 218000,
    estado: 'pendiente_pago',
    fecha: '2026-06-01T19:30:00',
  },
  {
    id: 4,
    subastaId: 4,
    subastaUbicacion: 'Belgrano, CABA',
    subastaFecha: '2026-06-20',
    itemDescripcion: 'Colección de monedas romanas — siglo II d.C.',
    precioBase: 45000,
    montoOfertado: 47000,
    mejorOfertaFinal: null,
    estado: 'activa',
    fecha: '2026-06-02T17:00:00',
  },
];

const ESTADO_CONFIG = {
  ganada:          { label: 'GANADA',          color: '#86efac', bg: '#14532d', icono: 'trophy-outline' },
  perdida:         { label: 'PERDIDA',          color: '#94a3b8', bg: '#1e293b', icono: 'close-circle-outline' },
  activa:          { label: 'EN CURSO',         color: '#fbbf24', bg: '#451a03', icono: 'time-outline' },
  pendiente_pago:  { label: 'PENDIENTE PAGO',   color: '#f87171', bg: '#450a0a', icono: 'warning-outline' },
};

function formatMonto(n) {
  return '$' + n.toLocaleString('es-AR');
}

function formatFecha(iso) {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function HistorialCard({ item, navigation }) {
  const cfg = ESTADO_CONFIG[item.estado] || ESTADO_CONFIG.perdida;
  const puedeVerSeguro = item.estado === 'ganada' || item.estado === 'pendiente_pago';

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardTituloWrap}>
          <Text style={styles.cardDesc} numberOfLines={2}>{item.itemDescripcion}</Text>
          <Text style={styles.cardUbicacion}>📍 {item.subastaUbicacion}</Text>
        </View>
        <View style={[styles.estadoBadge, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icono} size={11} color={cfg.color} />
          <Text style={[styles.estadoTxt, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>

      {/* Montos */}
      <View style={styles.montosRow}>
        <View style={styles.montoCol}>
          <Text style={styles.montoLabel}>TU OFERTA</Text>
          <Text style={styles.montoValor}>{formatMonto(item.montoOfertado)}</Text>
        </View>
        <View style={styles.montoSep} />
        <View style={styles.montoCol}>
          <Text style={styles.montoLabel}>PRECIO BASE</Text>
          <Text style={styles.montoValorMuted}>{formatMonto(item.precioBase)}</Text>
        </View>
        {item.mejorOfertaFinal && item.estado !== 'activa' && (
          <>
            <View style={styles.montoSep} />
            <View style={styles.montoCol}>
              <Text style={styles.montoLabel}>OFERTA FINAL</Text>
              <Text style={[styles.montoValor, item.estado === 'ganada' && { color: '#86efac' }]}>
                {formatMonto(item.mejorOfertaFinal)}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Alerta pago pendiente */}
      {item.estado === 'pendiente_pago' && (
        <View style={styles.alertaBox}>
          <Ionicons name="warning-outline" size={14} color="#fca5a5" />
          <Text style={styles.alertaTxt}>
            Tenés 72hs para acreditar fondos. Evitá la multa del 10%.
          </Text>
        </View>
      )}

      <View style={styles.cardFooterRow}>
        <Text style={styles.cardFecha}>{formatFecha(item.fecha)}</Text>
        {puedeVerSeguro && (
          <TouchableOpacity
            style={styles.seguroBtn}
            onPress={() => navigation.navigate('Insurance', { itemId: item.id })}
          >
            <Ionicons name="shield-checkmark-outline" size={13} color={colors.gold} />
            <Text style={styles.seguroBtnTxt}>Ver seguro</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function BidHistoryScreen({ navigation }) {
  const { usuario } = useAuth();
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargar = useCallback(async (esRefresh = false) => {
    if (!esRefresh) setCargando(true);
    try {
      // TODO: reemplazar con llamada real cuando Ignacio implemente el endpoint
      // const data = await getUserBids(usuario.id);
      await new Promise(r => setTimeout(r, 400)); // simula latencia
      setHistorial(getMockHistorial(usuario?.id));
    } finally {
      setCargando(false);
      setRefreshing(false);
    }
  }, [usuario]);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  // Estadísticas
  const ganadas = historial.filter(h => h.estado === 'ganada').length;
  const pendientes = historial.filter(h => h.estado === 'pendiente_pago').length;
  const totalOfertado = historial.reduce((acc, h) => acc + h.montoOfertado, 0);
  const totalPagado = historial
    .filter(h => h.estado === 'ganada')
    .reduce((acc, h) => acc + h.mejorOfertaFinal, 0);

  if (cargando) return (
    <View style={styles.centered}>
      <ActivityIndicator color={colors.gold} size="large" />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Resumen — métricas */}
      <View style={styles.resumen}>
        <View style={styles.resumenItem}>
          <Text style={styles.resumenNum}>{historial.length}</Text>
          <Text style={styles.resumenLabel}>Pujas</Text>
        </View>
        <View style={styles.resumenSep} />
        <View style={styles.resumenItem}>
          <Text style={[styles.resumenNum, { color: '#86efac' }]}>{ganadas}</Text>
          <Text style={styles.resumenLabel}>Ganadas</Text>
        </View>
        <View style={styles.resumenSep} />
        <View style={styles.resumenItem}>
          <Text style={[styles.resumenNum, { color: pendientes > 0 ? '#f87171' : colors.textSecondary }]}>
            {pendientes}
          </Text>
          <Text style={styles.resumenLabel}>Pago pend.</Text>
        </View>
      </View>

      {/* Métricas de importes */}
      <View style={styles.metricas}>
        <View style={styles.metricaItem}>
          <Text style={styles.metricaLabel}>TOTAL OFERTADO</Text>
          <Text style={styles.metricaValor}>{formatMonto(totalOfertado)}</Text>
        </View>
        <View style={styles.metricaSep} />
        <View style={styles.metricaItem}>
          <Text style={styles.metricaLabel}>TOTAL PAGADO</Text>
          <Text style={[styles.metricaValor, { color: '#86efac' }]}>
            {totalPagado > 0 ? formatMonto(totalPagado) : '—'}
          </Text>
        </View>
      </View>

      <FlatList
        data={historial}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => <HistorialCard item={item} navigation={navigation} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); cargar(true); }}
            tintColor={colors.gold}
          />
        }
        ListEmptyComponent={
          <View style={styles.vacio}>
            <Ionicons name="receipt-outline" size={48} color={colors.textMuted} />
            <Text style={styles.vacioTxt}>Aún no realizaste ninguna puja</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },

  resumen: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 16,
  },
  resumenItem: { flex: 1, alignItems: 'center' },
  resumenNum: { color: colors.gold, fontSize: 22, fontWeight: 'bold' },
  resumenLabel: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  resumenSep: { width: 1, backgroundColor: colors.border },

  metricas: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  metricaItem: { flex: 1 },
  metricaLabel: { color: colors.textMuted, fontSize: 9, letterSpacing: 1, marginBottom: 3 },
  metricaValor: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
  metricaSep: { width: 1, backgroundColor: colors.border, marginHorizontal: 16 },
  lista: { padding: 16, paddingBottom: 32 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 10,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  cardTituloWrap: { flex: 1 },
  cardDesc: { color: colors.textPrimary, fontSize: 14, fontWeight: '600', lineHeight: 19, marginBottom: 3 },
  cardUbicacion: { color: colors.textMuted, fontSize: 11 },
  estadoBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 6, paddingHorizontal: 7, paddingVertical: 4,
  },
  estadoTxt: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },

  montosRow: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  montoCol: { flex: 1, alignItems: 'center' },
  montoSep: { width: 1, height: 28, backgroundColor: colors.border },
  montoLabel: { color: colors.textMuted, fontSize: 9, letterSpacing: 1, marginBottom: 3 },
  montoValor: { color: colors.textPrimary, fontSize: 13, fontWeight: '700' },
  montoValorMuted: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },

  alertaBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#450a0a', borderRadius: 8, padding: 10,
  },
  alertaTxt: { color: '#fca5a5', fontSize: 12, flex: 1, lineHeight: 16 },

  cardFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardFecha: { color: colors.textMuted, fontSize: 10 },
  seguroBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  seguroBtnTxt: { color: colors.gold, fontSize: 11, fontWeight: '600' },

  vacio: { alignItems: 'center', paddingTop: 80, gap: 12 },
  vacioTxt: { color: colors.textMuted, fontSize: 14 },
});
