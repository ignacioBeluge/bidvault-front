import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { getSubastas } from '../api/auctions';

const ESTADO_COLORES = {
  abierta:   { bg: '#14532d', texto: '#86efac' },
  carrada:   { bg: '#2a2a2a', texto: '#888888' },
};

const CATEGORIA_COLORES = {
  comun: '#555555', especial: '#0284c7',
  plata: '#94a3b8', oro: '#C9A84C', platino: '#e2e8f0',
};

function SubastaCard({ subasta, onPress }) {
  const ec = ESTADO_COLORES[subasta.estado] || ESTADO_COLORES.carrada;
  const cc = CATEGORIA_COLORES[subasta.categoria] || colors.textMuted;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitulo} numberOfLines={2}>{subasta.ubicacion}</Text>
        <View style={[styles.estadoBadge, { backgroundColor: ec.bg }]}>
          <Text style={[styles.estadoTexto, { color: ec.texto }]}>
            {subasta.estado === 'abierta' ? 'ACTIVA' : 'CERRADA'}
          </Text>
        </View>
      </View>

      <Text style={styles.fecha}>
        📅 {subasta.fecha} — {subasta.hora?.substring(0, 5)}hs
      </Text>

      <View style={styles.cardFooter}>
        <View style={[styles.dot, { backgroundColor: cc }]} />
        <Text style={[styles.categoria, { color: cc }]}>
          Cat. {subasta.categoria?.toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const { usuario, logout } = useAuth();
  const [subastas, setSubastas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async (esRefresh = false) => {
    if (!esRefresh) setCargando(true);
    setError(null);
    try {
      const data = await getSubastas();
      setSubastas(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.response?.data?.mensaje || 'No se pudo conectar con el servidor.');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  if (cargando) return (
    <View style={styles.centered}>
      <ActivityIndicator color={colors.gold} size="large" />
      <Text style={styles.cargandoTxt}>Cargando subastas...</Text>
    </View>
  );

  if (error) return (
    <View style={styles.centered}>
      <Text style={styles.errorTxt}>{error}</Text>
      <TouchableOpacity style={styles.btnReintentar} onPress={() => cargar()}>
        <Text style={styles.btnReintentarTxt}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>⚖️ BidVault</Text>
          <Text style={styles.headerSub}>
            Hola, {usuario?.nombre?.split(' ')[0]} · Cat. {usuario?.categoria?.toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={subastas}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.lista}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={() => { setRefrescando(true); cargar(true); }}
            tintColor={colors.gold}
          />
        }
        ListEmptyComponent={
          <View style={styles.vacio}>
            <Text style={{ fontSize: 48 }}>🏛️</Text>
            <Text style={styles.vacioTxt}>No hay subastas activas.</Text>
            <Text style={styles.vacioSub}>Deslizá para actualizar.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <SubastaCard
            subasta={item}
            onPress={() => navigation.navigate('AuctionDetail', {
              subastaId: item.id,
              categoriaUsuario: usuario?.categoria,
            })}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', gap: 16, padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  logo: { color: colors.gold, fontSize: 20, fontWeight: 'bold', letterSpacing: 1 },
  headerSub: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 4 },
  headerBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  lista: { padding: 16, paddingBottom: 32 },
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border, gap: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  cardTitulo: { flex: 1, color: colors.textPrimary, fontSize: 15, fontWeight: '700', lineHeight: 20 },
  estadoBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  estadoTexto: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  fecha: { color: colors.textSecondary, fontSize: 12 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  categoria: { fontSize: 12, fontWeight: '600' },
  cargandoTxt: { color: colors.textSecondary, fontSize: 14 },
  errorTxt: { color: colors.error, fontSize: 14, textAlign: 'center' },
  btnReintentar: { backgroundColor: colors.gold, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  btnReintentarTxt: { color: colors.background, fontWeight: '700' },
  vacio: { alignItems: 'center', paddingTop: 60, gap: 8 },
  vacioTxt: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
  vacioSub: { color: colors.textSecondary, fontSize: 13 },
});
