import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl
} from 'react-native';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { listarSubastas } from '../api/subastas';

export default function HomeScreen({ navigation }) {
  const { usuario } = useAuth();
  const [subastas, setSubastas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Trae las subastas del backend
  async function cargarSubastas() {
    setCargando(true);
    setError(null);
    try {
      const data = await listarSubastas();
      setSubastas(data);
    } catch (e) {
      setError('No se pudieron cargar las subastas');
    } finally {
      setCargando(false);
    }
  }

  // Se ejecuta al abrir la pantalla
  useEffect(() => {
    cargarSubastas();
  }, []);

  // Card de cada subasta
  function renderSubasta({ item }) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('DetalleSubasta', { id: item.id })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.ubicacion}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.categoria?.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.cardInfo}>📅 {item.fecha} · {item.hora}</Text>
        <Text style={styles.cardEstado}>Estado: {item.estado}</Text>
        <Text style={styles.verMas}>Ver subasta →</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.bienvenido}>BIENVENIDO</Text>
          <Text style={styles.nombre}>{usuario?.nombre}</Text>
        </View>
        <View style={styles.categoriaBadge}>
          <Text style={styles.categoriaText}>{usuario?.categoria?.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.seccion}>SUBASTAS ACTIVAS</Text>

      {/* Estados de carga / error / lista */}
      {cargando ? (
        <ActivityIndicator color={colors.gold} size="large" style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={cargarSubastas}>
            <Text style={styles.retryText}>REINTENTAR</Text>
          </TouchableOpacity>
        </View>
      ) : subastas.length === 0 ? (
        <Text style={styles.vacio}>No hay subastas activas en este momento</Text>
      ) : (
        <FlatList
          data={subastas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderSubasta}
          refreshControl={
            <RefreshControl
              refreshing={cargando}
              onRefresh={cargarSubastas}
              tintColor={colors.gold}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  bienvenido: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 1,
  },
  nombre: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  categoriaBadge: {
    backgroundColor: colors.gold,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  categoriaText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 10,
    letterSpacing: 1,
  },
  seccion: {
    color: colors.textSecondary,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  badge: {
    backgroundColor: 'rgba(201,168,76,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.3)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: colors.gold,
    fontSize: 9,
  },
  cardInfo: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  cardEstado: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 8,
  },
  verMas: {
    color: colors.gold,
    fontSize: 13,
    textAlign: 'right',
  },
  vacio: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
  },
  errorBox: {
    alignItems: 'center',
    marginTop: 40,
  },
  errorText: {
    color: colors.error,
    marginBottom: 16,
  },
  retryButton: {
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryText: {
    color: colors.gold,
    letterSpacing: 1,
  },
});