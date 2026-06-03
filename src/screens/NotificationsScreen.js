import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl,
} from 'react-native';
import { colors } from '../theme/colors';

// Datos de ejemplo — se reemplazarán con el endpoint real cuando el back lo provea
const NOTIFICACIONES_MOCK = [
  {
    id: '1',
    tipo: 'puja',
    titulo: 'Fuiste superado en una puja',
    mensaje: 'Un usuario ofreció $127.200 por el Jarrón Ming de la Subasta #1.',
    fecha: '2026-06-17T18:32:00',
    leida: false,
  },
  {
    id: '2',
    tipo: 'subasta',
    titulo: 'Subasta próxima a comenzar',
    mensaje: 'La Subasta #3 (Categoría Plata) comienza en 30 minutos en Palermo, CABA.',
    fecha: '2026-06-17T18:00:00',
    leida: false,
  },
  {
    id: '3',
    tipo: 'pago',
    titulo: 'Recordatorio de pago',
    mensaje: 'Tenés 48 horas para acreditar los fondos de la subasta ganada. Evitá la multa del 10%.',
    fecha: '2026-06-16T10:00:00',
    leida: true,
  },
  {
    id: '4',
    tipo: 'sistema',
    titulo: 'Bienvenido a BidVault',
    mensaje: 'Tu cuenta fue verificada exitosamente. Ya podés participar en subastas.',
    fecha: '2026-06-15T09:00:00',
    leida: true,
  },
];

const ICONOS = {
  puja: '🏷️',
  subasta: '⚖️',
  pago: '💰',
  sistema: '🔔',
};

function formatFecha(iso) {
  const d = new Date(iso);
  const hoy = new Date();
  const diffDias = Math.floor((hoy - d) / 86400000);
  if (diffDias === 0) return `Hoy ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  if (diffDias === 1) return 'Ayer';
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function NotifCard({ item, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.card, !item.leida && styles.cardNoLeida]}
      onPress={() => onPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardLeft}>
        <Text style={styles.icono}>{ICONOS[item.tipo] || '🔔'}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={[styles.titulo, !item.leida && styles.tituloNoLeido]} numberOfLines={1}>
            {item.titulo}
          </Text>
          <Text style={styles.fecha}>{formatFecha(item.fecha)}</Text>
        </View>
        <Text style={styles.mensaje} numberOfLines={2}>{item.mensaje}</Text>
      </View>
      {!item.leida && <View style={styles.dot} />}
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const [notifs, setNotifs] = useState(NOTIFICACIONES_MOCK);
  const [refreshing, setRefreshing] = useState(false);

  const noLeidas = notifs.filter(n => !n.leida).length;

  const marcarLeida = (id) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
  };

  const marcarTodasLeidas = () => {
    setNotifs(prev => prev.map(n => ({ ...n, leida: true })));
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Aquí iría la llamada al endpoint real
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <View style={styles.container}>
      {/* Subheader */}
      {noLeidas > 0 && (
        <View style={styles.subheader}>
          <Text style={styles.subheaderTxt}>{noLeidas} sin leer</Text>
          <TouchableOpacity onPress={marcarTodasLeidas}>
            <Text style={styles.marcarBtn}>Marcar todas como leídas</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={notifs}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <NotifCard item={item} onPress={marcarLeida} />}
        contentContainerStyle={styles.lista}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.gold}
          />
        }
        ListEmptyComponent={
          <View style={styles.vacio}>
            <Text style={styles.vacioIcono}>🔔</Text>
            <Text style={styles.vacioTxt}>Sin notificaciones</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separador} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  subheader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  subheaderTxt: { color: colors.textSecondary, fontSize: 12 },
  marcarBtn: { color: colors.gold, fontSize: 12, fontWeight: '600' },
  lista: { padding: 16, gap: 2 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  cardNoLeida: {
    borderColor: colors.gold + '44',
    backgroundColor: colors.surface,
  },
  cardLeft: { marginRight: 12, paddingTop: 2 },
  icono: { fontSize: 22 },
  cardBody: { flex: 1 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titulo: { color: colors.textPrimary, fontSize: 13, fontWeight: '500', flex: 1, marginRight: 8 },
  tituloNoLeido: { fontWeight: '700', color: '#fff' },
  fecha: { color: colors.textMuted, fontSize: 11 },
  mensaje: { color: colors.textSecondary, fontSize: 12, lineHeight: 17 },
  dot: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gold,
  },
  separador: { height: 8 },
  vacio: { alignItems: 'center', marginTop: 80 },
  vacioIcono: { fontSize: 48, marginBottom: 12 },
  vacioTxt: { color: colors.textMuted, fontSize: 15 },
});
