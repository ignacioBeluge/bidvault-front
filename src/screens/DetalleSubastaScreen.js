import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator
} from 'react-native';
import { colors } from '../theme/colors';
import { obtenerSubasta } from '../api/subastas';

export default function DetalleSubastaScreen({ route, navigation }) {
  const { id } = route.params;   // el id que mandamos desde Home
  const [subasta, setSubasta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  async function cargarDetalle() {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerSubasta(id);
      setSubasta(data);
    } catch (e) {
      setError('No se pudo cargar el detalle de la subasta');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDetalle();
  }, []);

  // Card de cada ítem del catálogo
  function renderItem({ item }) {
    return (
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() => navigation.navigate('Puja', {
          subastaId: id,
          itemId: item.id,
          descripcion: item.descripcion,
        })}
      >
        <Text style={styles.itemNombre}>{item.descripcion || 'Sin descripción'}</Text>
        <Text style={styles.itemBase}>Base: ${item.precioBase}</Text>
        {item.mejorOfertaActual != null && (
          <Text style={styles.itemOferta}>
            Mejor oferta: ${item.mejorOfertaActual}
          </Text>
        )}
        <Text style={styles.pujar}>Pujar →</Text>
      </TouchableOpacity>
    );
  }

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={cargarDetalle}>
          <Text style={styles.retryText}>REINTENTAR</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Botón volver */}
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>‹ Volver</Text>
      </TouchableOpacity>

      {/* Datos de la subasta */}
      <Text style={styles.titulo}>{subasta.ubicacion}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{subasta.categoria?.toUpperCase()}</Text>
      </View>
      <Text style={styles.info}>📅 {subasta.fecha} · {subasta.hora}</Text>
      <Text style={styles.info}>Capacidad: {subasta.capacidadAsistentes} asistentes</Text>

      <Text style={styles.seccion}>CATÁLOGO</Text>

      {subasta.items && subasta.items.length > 0 ? (
        <FlatList
          data={subasta.items}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      ) : (
        <Text style={styles.vacio}>Esta subasta no tiene ítems cargados</Text>
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
  center: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  back: {
    color: colors.gold,
    fontSize: 16,
    marginBottom: 16,
  },
  titulo: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gold,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 12,
  },
  badgeText: {
    color: colors.background,
    fontSize: 10,
    fontWeight: 'bold',
  },
  info: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },
  seccion: {
    color: colors.textSecondary,
    fontSize: 11,
    letterSpacing: 2,
    marginTop: 20,
    marginBottom: 12,
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  itemNombre: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  itemBase: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '600',
  },
  itemOferta: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  pujar: {
    color: colors.gold,
    fontSize: 13,
    textAlign: 'right',
    marginTop: 8,
  },
  vacio: {
    color: colors.textMuted,
    textAlign: 'center',
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