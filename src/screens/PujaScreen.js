import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert
} from 'react-native';
import Slider from '@react-native-community/slider';
import { colors } from '../theme/colors';
import { obtenerLimites, realizarPuja } from '../api/subastas';

export default function PujaScreen({ route, navigation }) {
  const { subastaId, itemId, descripcion } = route.params;

  const [limites, setLimites] = useState(null);   // los que manda el servidor
  const [montoPuja, setMontoPuja] = useState(0);  // valor actual del slider
  const [cargando, setCargando] = useState(true);
  const [pujando, setPujando] = useState(false);
  const [error, setError] = useState(null);

  // Trae los límites del servidor (NUNCA los calcula el cliente)
  async function cargarLimites() {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerLimites(subastaId, itemId);
      setLimites(data);
      // El slider arranca en la puja mínima
      setMontoPuja(Number(data.pujaMinima));
    } catch (e) {
      setError('No se pudieron cargar los límites de puja');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarLimites();
  }, []);

  // Realiza la puja
  async function handlePujar() {
    setPujando(true);
    try {
      // medioPagoId fijo en 1 (el de prueba). En real vendría de una selección.
      const resultado = await realizarPuja(subastaId, itemId, montoPuja, 1);

      Alert.alert(
        '¡Puja confirmada!',
        `Ofertaste $${resultado.montoOfertado}\n` +
        `${resultado.esMayorPostor ? 'Sos el mayor postor' : 'Fuiste superado'}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      // Muestra el mensaje de error que devuelve el backend
      const mensaje = e.response?.data?.mensaje || 'No se pudo realizar la puja';
      Alert.alert('Error', mensaje);
    } finally {
      setPujando(false);
    }
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
        <TouchableOpacity style={styles.retryButton} onPress={cargarLimites}>
          <Text style={styles.retryText}>REINTENTAR</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Si la subasta es oro/platino no hay tope: usamos minima*2 para el slider visual
  const maxSlider = limites.aplicanLimites
    ? Number(limites.pujaMaxima)
    : Number(limites.pujaMinima) * 2;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>‹ Volver</Text>
      </TouchableOpacity>

      <Text style={styles.titulo}>{descripcion || 'Ítem'}</Text>

      {/* Info de la oferta actual */}
      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>MEJOR OFERTA ACTUAL</Text>
        <Text style={styles.infoValor}>${limites.mejorOfertaActual}</Text>
      </View>

      {/* El monto que el usuario va a ofertar */}
      <Text style={styles.montoLabel}>TU OFERTA</Text>
      <Text style={styles.montoGrande}>${montoPuja.toLocaleString('es-AR')}</Text>

      {/* El slider — entre los límites que mandó el servidor */}
      <Slider
        style={{ width: '100%', height: 40, marginVertical: 20 }}
        minimumValue={Number(limites.pujaMinima)}
        maximumValue={maxSlider}
        step={100}
        value={montoPuja}
        onValueChange={setMontoPuja}
        minimumTrackTintColor={colors.gold}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.gold}
      />

      {/* Límites visibles (los del servidor) */}
      <View style={styles.limitesRow}>
        <View>
          <Text style={styles.limiteLabel}>MÍNIMO</Text>
          <Text style={styles.limiteValor}>${limites.pujaMinima}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.limiteLabel}>MÁXIMO</Text>
          <Text style={styles.limiteValor}>
            {limites.aplicanLimites ? `$${limites.pujaMaxima}` : 'Sin límite'}
          </Text>
        </View>
      </View>

      {/* Aviso para oro/platino */}
      {!limites.aplicanLimites && (
        <Text style={styles.sinLimite}>
          Tu categoría no tiene tope máximo de puja
        </Text>
      )}

      {/* Botón pujar */}
      <TouchableOpacity
        style={styles.botonPujar}
        onPress={handlePujar}
        disabled={pujando}
      >
        {pujando ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={styles.botonPujarText}>
            ⚡ PUJAR ${montoPuja.toLocaleString('es-AR')}
          </Text>
        )}
      </TouchableOpacity>
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
    marginBottom: 20,
  },
  titulo: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 4,
  },
  infoValor: {
    color: colors.gold,
    fontSize: 24,
    fontWeight: 'bold',
  },
  montoLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    letterSpacing: 2,
    textAlign: 'center',
  },
  montoGrande: {
    color: colors.gold,
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  limitesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  limiteLabel: {
    color: colors.textMuted,
    fontSize: 10,
    letterSpacing: 1,
  },
  limiteValor: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  sinLimite: {
    color: colors.gold,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
  botonPujar: {
    backgroundColor: colors.gold,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 24,
  },
  botonPujarText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
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