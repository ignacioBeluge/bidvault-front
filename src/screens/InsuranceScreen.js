/**
 * InsuranceScreen — Seguro del artículo
 *
 * Reglas de negocio:
 *   - Todo artículo tiene seguro
 *   - El dueño puede ver el depósito donde está la pieza
 *   - El dueño puede ver los datos de la póliza
 *   - Botón para contactar a la aseguradora
 *   - Botón para aumentar la póliza pagando la diferencia
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, Linking,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

// Mock — reemplazar con GET /items/{id}/insurance cuando el back lo implemente
const getMockSeguro = (itemId) => ({
  item: {
    id: itemId || 1,
    descripcion: 'Jarrón Ming — Dinastía Qing, circa 1680',
    valorAsegurado: 180000,
  },
  deposito: {
    nombre: 'Depósito Seguro BidVault — Sede Central',
    direccion: 'Av. del Libertador 5200, Palermo, CABA',
    telefono: '+54 11 4800-1234',
    horario: 'Lun–Vie 9:00–18:00',
    responsable: 'Lic. Carlos Fernández',
    coordenadas: { lat: -34.5627, lng: -58.4431 },
  },
  poliza: {
    numero: 'POL-2026-00847',
    aseguradora: 'Seguros Premier S.A.',
    telefonoAseguradora: '+54 11 0800-333-7734',
    emailAseguradora: 'siniestros@seguros-premier.com.ar',
    cobertura: 'Todo riesgo — robo, incendio, daño accidental',
    montoAsegurado: 180000,
    franquicia: 5000,
    vencimiento: '2027-03-31',
    estado: 'vigente',   // 'vigente' | 'vencida' | 'suspendida'
  },
});

function FilaDato({ icono, label, valor, subvalor }) {
  return (
    <View style={styles.fila}>
      <Ionicons name={icono} size={18} color={colors.gold} style={styles.filaIcono} />
      <View style={styles.filaBody}>
        <Text style={styles.filaLabel}>{label}</Text>
        <Text style={styles.filaValor}>{valor}</Text>
        {subvalor ? <Text style={styles.filaSubvalor}>{subvalor}</Text> : null}
      </View>
    </View>
  );
}

function Seccion({ titulo, children }) {
  return (
    <View style={styles.seccionCard}>
      <Text style={styles.seccionTitulo}>{titulo}</Text>
      {children}
    </View>
  );
}

export default function InsuranceScreen({ route }) {
  const itemId = route?.params?.itemId;
  const [seguro, setSeguro] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [aumentando, setAumentando] = useState(false);

  useFocusEffect(useCallback(() => {
    setCargando(true);
    // TODO: reemplazar con llamada real: GET /items/{itemId}/insurance
    setTimeout(() => {
      setSeguro(getMockSeguro(itemId));
      setCargando(false);
    }, 500);
  }, [itemId]));

  const contactarAseguradora = () => {
    Alert.alert(
      'Contactar aseguradora',
      `${seguro.poliza.aseguradora}`,
      [
        {
          text: `📞 Llamar`,
          onPress: () => Linking.openURL(`tel:${seguro.poliza.telefonoAseguradora}`),
        },
        {
          text: `✉️ Email`,
          onPress: () => Linking.openURL(`mailto:${seguro.poliza.emailAseguradora}`),
        },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const aumentarPoliza = () => {
    Alert.prompt(
      'Aumentar póliza',
      `Monto asegurado actual: $${seguro.poliza.montoAsegurado.toLocaleString('es-AR')}\n\nIngresá el nuevo monto total deseado:`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          onPress: async (nuevoMonto) => {
            const monto = Number(nuevoMonto?.replace(/\./g, '').replace(',', '.'));
            if (!monto || monto <= seguro.poliza.montoAsegurado) {
              Alert.alert('Error', 'El nuevo monto debe ser mayor al actual.');
              return;
            }
            const diferencia = monto - seguro.poliza.montoAsegurado;
            // Prima estimada: ~0.8% del incremento anual
            const prima = Math.round(diferencia * 0.008);
            Alert.alert(
              'Confirmar aumento',
              `Nuevo monto asegurado: $${monto.toLocaleString('es-AR')}\nCosto adicional estimado: $${prima.toLocaleString('es-AR')}/año\n\n¿Confirmás el aumento?`,
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Confirmar',
                  onPress: async () => {
                    setAumentando(true);
                    // TODO: POST /items/{itemId}/insurance/increase { nuevoMonto }
                    await new Promise(r => setTimeout(r, 1000));
                    setAumentando(false);
                    setSeguro(prev => ({
                      ...prev,
                      poliza: { ...prev.poliza, montoAsegurado: monto },
                      item: { ...prev.item, valorAsegurado: monto },
                    }));
                    Alert.alert('¡Listo!', 'Tu póliza fue actualizada exitosamente.');
                  },
                },
              ]
            );
          },
        },
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  const verEnMapa = () => {
    const { lat, lng } = seguro.deposito.coordenadas;
    Linking.openURL(`maps://?q=${lat},${lng}`).catch(() =>
      Linking.openURL(`https://maps.google.com/?q=${lat},${lng}`)
    );
  };

  if (cargando) return (
    <View style={styles.centered}>
      <ActivityIndicator color={colors.gold} size="large" />
    </View>
  );

  const polizaVigente = seguro.poliza.estado === 'vigente';
  const diasParaVencer = Math.ceil(
    (new Date(seguro.poliza.vencimiento) - new Date()) / 86400000
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Artículo */}
      <View style={styles.itemHeader}>
        <Ionicons name="shield-checkmark-outline" size={32} color={colors.gold} />
        <View style={styles.itemHeaderBody}>
          <Text style={styles.itemDesc} numberOfLines={2}>{seguro.item.descripcion}</Text>
          <Text style={styles.itemValor}>
            Valor asegurado: ${seguro.item.valorAsegurado.toLocaleString('es-AR')}
          </Text>
        </View>
      </View>

      {/* Estado de la póliza */}
      <View style={[styles.estadoBox, !polizaVigente && styles.estadoBoxAlerta]}>
        <Ionicons
          name={polizaVigente ? 'checkmark-circle-outline' : 'warning-outline'}
          size={20}
          color={polizaVigente ? '#86efac' : '#fca5a5'}
        />
        <View style={{ flex: 1 }}>
          <Text style={[styles.estadoTxt, !polizaVigente && { color: '#fca5a5' }]}>
            Póliza {seguro.poliza.estado.toUpperCase()}
          </Text>
          {polizaVigente && diasParaVencer <= 60 && (
            <Text style={styles.estadoSub}>
              Vence en {diasParaVencer} días — {seguro.poliza.vencimiento}
            </Text>
          )}
          {polizaVigente && diasParaVencer > 60 && (
            <Text style={styles.estadoSub}>Vence el {seguro.poliza.vencimiento}</Text>
          )}
        </View>
      </View>

      {/* Datos de la póliza */}
      <Seccion titulo="DATOS DE LA PÓLIZA">
        <FilaDato icono="document-text-outline" label="Número de póliza" valor={seguro.poliza.numero} />
        <FilaDato icono="business-outline" label="Aseguradora" valor={seguro.poliza.aseguradora} />
        <FilaDato
          icono="shield-outline"
          label="Cobertura"
          valor={seguro.poliza.cobertura}
        />
        <FilaDato
          icono="cash-outline"
          label="Monto asegurado"
          valor={`$${seguro.poliza.montoAsegurado.toLocaleString('es-AR')}`}
          subvalor={`Franquicia: $${seguro.poliza.franquicia.toLocaleString('es-AR')}`}
        />
        <FilaDato
          icono="calendar-outline"
          label="Vencimiento"
          valor={seguro.poliza.vencimiento}
        />
      </Seccion>

      {/* Datos del depósito */}
      <Seccion titulo="DEPÓSITO DE LA PIEZA">
        <FilaDato icono="business-outline" label="Nombre" valor={seguro.deposito.nombre} />
        <FilaDato icono="location-outline" label="Dirección" valor={seguro.deposito.direccion} />
        <FilaDato icono="time-outline" label="Horario de atención" valor={seguro.deposito.horario} />
        <FilaDato icono="person-outline" label="Responsable" valor={seguro.deposito.responsable} />

        <TouchableOpacity style={styles.mapaBtn} onPress={verEnMapa}>
          <Ionicons name="map-outline" size={16} color={colors.gold} />
          <Text style={styles.mapaBtnTxt}>Ver en el mapa</Text>
        </TouchableOpacity>
      </Seccion>

      {/* Acciones */}
      <View style={styles.acciones}>
        <TouchableOpacity style={styles.btnSecundario} onPress={contactarAseguradora}>
          <Ionicons name="call-outline" size={18} color={colors.gold} />
          <Text style={styles.btnSecundarioTxt}>Contactar aseguradora</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btnPrimario, aumentando && styles.btnOff]}
          onPress={aumentarPoliza}
          disabled={aumentando}
        >
          {aumentando
            ? <ActivityIndicator color={colors.background} size="small" />
            : (
              <>
                <Ionicons name="trending-up-outline" size={18} color={colors.background} />
                <Text style={styles.btnPrimarioTxt}>Aumentar póliza</Text>
              </>
            )
          }
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 48, gap: 12 },
  centered: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },

  itemHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: colors.gold + '44', padding: 16,
  },
  itemHeaderBody: { flex: 1 },
  itemDesc: { color: colors.textPrimary, fontSize: 14, fontWeight: '700', lineHeight: 20, marginBottom: 4 },
  itemValor: { color: colors.gold, fontSize: 13, fontWeight: '600' },

  estadoBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#14532d22', borderRadius: 10,
    borderWidth: 1, borderColor: '#22c55e44', padding: 12,
  },
  estadoBoxAlerta: { backgroundColor: '#450a0a22', borderColor: '#f8717144' },
  estadoTxt: { color: '#86efac', fontSize: 13, fontWeight: '700' },
  estadoSub: { color: colors.textMuted, fontSize: 11, marginTop: 2 },

  seccionCard: {
    backgroundColor: colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: colors.border, padding: 16, gap: 14,
  },
  seccionTitulo: { color: colors.textSecondary, fontSize: 10, letterSpacing: 2, fontWeight: '700' },

  fila: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  filaIcono: { marginTop: 1, width: 24 },
  filaBody: { flex: 1 },
  filaLabel: { color: colors.textMuted, fontSize: 10, letterSpacing: 1, marginBottom: 2 },
  filaValor: { color: colors.textPrimary, fontSize: 13 },
  filaSubvalor: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },

  mapaBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: colors.gold + '66',
    borderRadius: 8, padding: 10, justifyContent: 'center',
    marginTop: 4,
  },
  mapaBtnTxt: { color: colors.gold, fontSize: 13, fontWeight: '600' },

  acciones: { gap: 10 },
  btnSecundario: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: colors.gold,
    borderRadius: 12, paddingVertical: 14,
  },
  btnSecundarioTxt: { color: colors.gold, fontWeight: '700', fontSize: 14 },
  btnPrimario: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.gold, borderRadius: 12, paddingVertical: 14,
  },
  btnOff: { opacity: 0.5 },
  btnPrimarioTxt: { color: colors.background, fontWeight: '700', fontSize: 14 },
});
