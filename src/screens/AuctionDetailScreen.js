import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { getSubasta, getConstraints } from '../api/auctions';
import { hacerPuja } from '../api/bids';
import BidRangeIndicator from '../components/BidRangeIndicator';

const POLLING_INTERVAL = 5000; // refresca cada 5 segundos

function fmt(n) {
  if (!n && n !== 0) return 'Sin ofertas';
  return '$' + Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2 });
}

export default function AuctionDetailScreen({ route }) {
  const { subastaId, categoriaUsuario } = route.params;

  const [subasta, setSubasta] = useState(null);
  const [restricciones, setRestricciones] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);

  const [montoInput, setMontoInput] = useState('');
  const [pujando, setPujando] = useState(false);
  const [errorPuja, setErrorPuja] = useState(null);
  const [exitoPuja, setExitoPuja] = useState(null);
  const [countdown, setCountdown] = useState(POLLING_INTERVAL / 1000);
  const [refreshing, setRefreshing] = useState(false);

  // El item principal de la subasta
  const item = subasta?.items?.[0];
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; }; // cleanup al desmontar
  }, []);

  const cargar = useCallback(async (esPolling = false) => {
    if (!isMounted.current) return;
    if (!esPolling) setCargando(true); // spinner solo en carga inicial, no en polling
    setErrorCarga(null);
    try {
      const data = await getSubasta(subastaId);
      if (!isMounted.current) return;
      setSubasta(data);

      if (data.items?.length > 0) {
        try {
          const c = await getConstraints(subastaId, data.items[0].id, categoriaUsuario || 'comun');
          if (!isMounted.current) return;
          setRestricciones(c);
        } catch {
          // Si falla constraints, no bloqueamos la pantalla
        }
      }
    } catch (e) {
      if (!isMounted.current) return;
      if (!esPolling) setErrorCarga(e.response?.data?.mensaje || 'No se pudo cargar la subasta.');
    } finally {
      if (isMounted.current && !esPolling) setCargando(false);
    }
  }, [subastaId, categoriaUsuario]);

  // Carga inicial
  useEffect(() => { cargar(); }, [cargar]);

  // Countdown visual: decrementa cada segundo
  useFocusEffect(
    useCallback(() => {
      setCountdown(POLLING_INTERVAL / 1000);
      const tick = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) return POLLING_INTERVAL / 1000;
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(tick);
    }, [])
  );

  // Polling: refresca automáticamente cada 5 segundos mientras la pantalla está activa
  useFocusEffect(
    useCallback(() => {
      const intervalo = setInterval(() => {
        if (!pujando) cargar(true); // true = es polling, no muestra spinner
      }, POLLING_INTERVAL);
      return () => clearInterval(intervalo); // limpia al salir de la pantalla
    }, [cargar, pujando])
  );

  async function handlePujar() {
    setErrorPuja(null);
    setExitoPuja(null);

    const monto = parseFloat(montoInput.replace(',', '.'));
    if (isNaN(monto) || monto <= 0) { setErrorPuja('Ingresá un monto válido.'); return; }

    if (restricciones) {
      if (monto < restricciones.pujaMinima) {
        setErrorPuja(`El mínimo es ${fmt(restricciones.pujaMinima)}.`); return;
      }
      if (restricciones.aplicanLimites && monto > restricciones.pujaMaxima) {
        setErrorPuja(`El máximo es ${fmt(restricciones.pujaMaxima)}.`); return;
      }
    }

    Alert.alert(
      'Confirmá tu puja',
      `¿Confirmás ${fmt(monto)} en "${subasta.ubicacion}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setPujando(true);
            try {
              await hacerPuja(subastaId, item.id, monto);
              if (!isMounted.current) return;
              setExitoPuja('¡Puja realizada exitosamente!');
              setMontoInput('');
              cargar();
            } catch (e) {
              if (!isMounted.current) return;
              setErrorPuja(e.response?.data?.mensaje || 'No se pudo enviar la puja.');
            } finally {
              if (isMounted.current) setPujando(false);
            }
          },
        },
      ]
    );
  }

  if (cargando) return (
    <View style={styles.centered}><ActivityIndicator color={colors.gold} size="large" /></View>
  );

  if (errorCarga) return (
    <View style={styles.centered}>
      <Text style={styles.errorTxt}>{errorCarga}</Text>
      <TouchableOpacity style={styles.btnReintentar} onPress={cargar}>
        <Text style={styles.btnReintentarTxt}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );

  // Adaptar restricciones del back al formato del BidRangeIndicator
  const restriccionesIndicador = restricciones ? {
    puja_minima: restricciones.pujaMinima,
    puja_maxima: restricciones.pujaMaxima,
    mejor_oferta_actual: restricciones.mejorOfertaActual ?? item?.mejorOfertaActual ?? 0,
    aplican_limites: restricciones.aplicanLimites,
  } : null;

  const montoNum = parseFloat(montoInput.replace(',', '.')) || null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            setCountdown(POLLING_INTERVAL / 1000);
            await cargar(false);
            setRefreshing(false);
          }}
          tintColor={colors.gold}
        />
      }
    >

      {/* Indicador de tiempo real con countdown */}
      <View style={styles.liveRow}>
        <View style={styles.liveDot} />
        <Text style={styles.liveTxt}>EN VIVO</Text>
        <Text style={styles.liveCountdown}>· actualiza en {countdown}s</Text>
      </View>

      {/* Título y badges */}
      <Text style={styles.titulo}>{subasta.ubicacion}</Text>
      <View style={styles.badgesRow}>
        <View style={[styles.badge, subasta.estado === 'abierta' && styles.badgeActiva]}>
          <Text style={styles.badgeTxt}>
            {subasta.estado === 'abierta' ? 'ACTIVA' : 'CERRADA'}
          </Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeTxt}>Cat. {subasta.categoria?.toUpperCase()}</Text>
        </View>
      </View>

      {/* Info de fecha */}
      <Text style={styles.fecha}>📅 {subasta.fecha} — {subasta.hora?.substring(0, 5)}hs</Text>

      {/* Item principal */}
      {item && (
        <View style={styles.itemCard}>
          <Text style={styles.itemLabel}>ARTÍCULO EN SUBASTA</Text>
          <Text style={styles.itemNombre}>{item.descripcion || 'Sin descripción'}</Text>
          <View style={styles.itemRow}>
            <View>
              <Text style={styles.itemSubLabel}>PRECIO BASE</Text>
              <Text style={styles.itemValor}>{fmt(item.precioBase)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.itemSubLabel}>MEJOR OFERTA</Text>
              <Text style={[styles.itemValor, { color: colors.gold }]}>
                {item.mejorOfertaActual ? fmt(item.mejorOfertaActual) : 'Sin ofertas'}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Sección de puja */}
      {subasta.estado === 'abierta' && item && (
        <View style={styles.seccionPuja}>
          <Text style={styles.seccionTitulo}>Realizar puja</Text>

          {/* Indicador de rango — exigido por la cátedra */}
          {restriccionesIndicador && (
            <BidRangeIndicator
              restricciones={restriccionesIndicador}
              montoIngresado={montoNum}
            />
          )}

          <View style={styles.inputRow}>
            <Text style={styles.simbolo}>$</Text>
            <TextInput
              style={styles.input}
              value={montoInput}
              onChangeText={setMontoInput}
              placeholder={restricciones ? String(restricciones.pujaMinima) : String(item.precioBase)}
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              editable={!pujando}
            />
          </View>

          {errorPuja && <View style={styles.errorBox}><Text style={styles.errorBoxTxt}>⚠️ {errorPuja}</Text></View>}
          {exitoPuja && <View style={styles.exitoBox}><Text style={styles.exitoTxt}>{exitoPuja}</Text></View>}

          {pujando && (
            <View style={styles.pendienteBox}>
              <ActivityIndicator color={colors.gold} size="small" />
              <Text style={styles.pendienteTxt}>Procesando tu puja...</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.btnPujar, pujando && styles.btnPujarOff]}
            onPress={handlePujar}
            disabled={pujando}
          >
            <Text style={styles.btnPujarTxt}>{pujando ? 'Procesando...' : 'PUJAR AHORA'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {subasta.estado !== 'abierta' && (
        <View style={styles.inactivaBox}>
          <Text style={styles.inactivaTxt}>Esta subasta ya no está activa.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
  liveTxt: { color: '#22c55e', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  liveCountdown: { color: '#86efac', fontSize: 10, letterSpacing: 0.5 },
  centered: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 },
  titulo: { color: colors.textPrimary, fontSize: 22, fontWeight: '800', lineHeight: 28 },
  badgesRow: { flexDirection: 'row', gap: 8 },
  badge: { backgroundColor: '#1e1e1e', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeActiva: { backgroundColor: '#14532d' },
  badgeTxt: { color: colors.textPrimary, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  fecha: { color: colors.textSecondary, fontSize: 13 },
  itemCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 10 },
  itemLabel: { color: colors.textSecondary, fontSize: 11, letterSpacing: 2 },
  itemNombre: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between' },
  itemSubLabel: { color: colors.textSecondary, fontSize: 10, letterSpacing: 1 },
  itemValor: { color: colors.textPrimary, fontSize: 18, fontWeight: '800' },
  seccionPuja: { gap: 12 },
  seccionTitulo: { color: colors.textPrimary, fontSize: 17, fontWeight: '700' },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 14 },
  simbolo: { color: colors.textSecondary, fontSize: 20, fontWeight: '600', marginRight: 6 },
  input: { flex: 1, color: colors.textPrimary, fontSize: 22, fontWeight: '700', paddingVertical: 12 },
  errorBox: { backgroundColor: '#450a0a', borderRadius: 8, padding: 12 },
  errorBoxTxt: { color: '#fca5a5', fontSize: 13 },
  exitoBox: { backgroundColor: '#14532d', borderRadius: 8, padding: 12 },
  exitoTxt: { color: '#86efac', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  pendienteBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 8, padding: 12, gap: 10 },
  pendienteTxt: { color: colors.textSecondary, fontSize: 13, flex: 1 },
  btnPujar: { backgroundColor: colors.gold, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  btnPujarOff: { opacity: 0.5 },
  btnPujarTxt: { color: colors.background, fontSize: 15, fontWeight: 'bold', letterSpacing: 2 },
  inactivaBox: { backgroundColor: colors.surface, borderRadius: 8, padding: 16, alignItems: 'center' },
  inactivaTxt: { color: colors.textSecondary, fontSize: 14 },
  errorTxt: { color: colors.error, fontSize: 14, textAlign: 'center' },
  btnReintentar: { backgroundColor: colors.gold, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  btnReintentarTxt: { color: colors.background, fontWeight: '700' },
});
