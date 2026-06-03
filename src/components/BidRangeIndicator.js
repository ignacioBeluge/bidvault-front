import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

/**
 * Muestra el rango válido de puja recibido del servidor.
 * El servidor calcula puja_minima y puja_maxima — el cliente solo los muestra.
 *
 * Props:
 *   restricciones: { puja_minima, puja_maxima, mejor_oferta_actual, aplican_limites }
 *   montoIngresado: number | null
 */
export default function BidRangeIndicator({ restricciones, montoIngresado }) {
  if (!restricciones) return null;

  const { puja_minima, puja_maxima, mejor_oferta_actual, aplican_limites } = restricciones;

  const fmt = (n) =>
    n != null ? '$' + Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2 }) : '—';

  const ratio = () => {
    if (!montoIngresado || !aplican_limites || !puja_maxima) return null;
    const r = (montoIngresado - puja_minima) / (puja_maxima - puja_minima);
    return Math.max(0, Math.min(1, r));
  };
  const r = ratio();

  const esValido =
    montoIngresado != null
      ? montoIngresado >= puja_minima && (!aplican_limites || montoIngresado <= puja_maxima)
      : null;

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>RANGO DE PUJA</Text>

      {/* Barra visual */}
      <View style={styles.barraWrap}>
        <View style={styles.barra}>
          {r !== null && <View style={[styles.relleno, { width: `${r * 100}%` }]} />}
        </View>
        {r !== null && <View style={[styles.thumb, { left: `${r * 100}%` }]} />}
      </View>

      {/* Mín / Máx */}
      <View style={styles.etiquetas}>
        <View>
          <Text style={styles.labelMin}>MÍN</Text>
          <Text style={styles.monto}>{fmt(puja_minima)}</Text>
        </View>
        {aplican_limites ? (
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.labelMax}>MÁX</Text>
            <Text style={styles.monto}>{fmt(puja_maxima)}</Text>
          </View>
        ) : (
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.sinLimite}>✦ SIN LÍMITE MÁX</Text>
            <Text style={styles.sinLimiteSub}>Cat. ORO / PLATINO</Text>
          </View>
        )}
      </View>

      {/* Oferta actual */}
      <Text style={styles.ofertaActual}>
        Mejor oferta:{' '}
        <Text style={styles.ofertaValor}>
          {mejor_oferta_actual > 0 ? fmt(mejor_oferta_actual) : 'Sin ofertas aún'}
        </Text>
      </Text>

      {/* Validación en tiempo real */}
      {esValido !== null && (
        <View style={[styles.badge, esValido ? styles.badgeOk : styles.badgeError]}>
          <Text style={styles.badgeTexto}>
            {esValido ? '✓ Monto válido' : '✗ Fuera de rango'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 14,
    gap: 10,
  },
  titulo: {
    color: colors.textSecondary,
    fontSize: 11,
    letterSpacing: 2,
  },
  barraWrap: { height: 8, position: 'relative', justifyContent: 'center' },
  barra: {
    height: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  relleno: { height: '100%', backgroundColor: colors.gold, borderRadius: 4 },
  thumb: {
    position: 'absolute',
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: colors.gold,
    borderWidth: 2, borderColor: colors.background,
    top: -5, marginLeft: -9,
  },
  etiquetas: { flexDirection: 'row', justifyContent: 'space-between' },
  labelMin: { color: colors.success, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  labelMax: { color: colors.error, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  monto: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  sinLimite: { color: colors.gold, fontSize: 11, fontWeight: '700' },
  sinLimiteSub: { color: colors.textMuted, fontSize: 10 },
  ofertaActual: { color: colors.textSecondary, fontSize: 12 },
  ofertaValor: { color: colors.textPrimary, fontWeight: '600' },
  badge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  badgeOk: { backgroundColor: '#14532d' },
  badgeError: { backgroundColor: '#450a0a' },
  badgeTexto: { color: colors.textPrimary, fontSize: 12, fontWeight: '600' },
});
