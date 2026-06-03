import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

const CATEGORIA_INFO = {
  comun:   { label: 'COMÚN',   color: '#94a3b8', descripcion: 'Acceso a subastas de categoría Común.' },
  especial:{ label: 'ESPECIAL',color: '#a78bfa', descripcion: 'Acceso a subastas Común y Especial.' },
  plata:   { label: 'PLATA',   color: '#e2e8f0', descripcion: 'Acceso a subastas hasta categoría Plata.' },
  oro:     { label: 'ORO',     color: '#C9A84C', descripcion: 'Sin límite máximo de puja. Acceso hasta Oro.' },
  platino: { label: 'PLATINO', color: '#e0f2fe', descripcion: 'Sin límites. Acceso a todas las subastas.' },
};

function FilaDato({ icono, label, valor }) {
  return (
    <View style={styles.fila}>
      <Text style={styles.filaIcono}>{icono}</Text>
      <View style={styles.filaBody}>
        <Text style={styles.filaLabel}>{label}</Text>
        <Text style={styles.filaValor}>{valor}</Text>
      </View>
    </View>
  );
}

export default function ProfileScreen({ navigation }) {
  const { usuario, logout } = useAuth();

  const cat = usuario?.categoria
    ? CATEGORIA_INFO[usuario.categoria.toLowerCase()] || CATEGORIA_INFO.comun
    : CATEGORIA_INFO.comun;

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que querés salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  if (!usuario) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.sinSesion}>No hay sesión activa.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Avatar */}
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetra}>
            {usuario.nombre ? usuario.nombre[0].toUpperCase() : '?'}
          </Text>
        </View>
        <Text style={styles.nombre}>{usuario.nombre}</Text>

        {/* Badge de categoría */}
        <View style={[styles.categoriaBadge, { borderColor: cat.color }]}>
          <Text style={[styles.categoriaLabel, { color: cat.color }]}>{cat.label}</Text>
        </View>
        <Text style={styles.categoriaDesc}>{cat.descripcion}</Text>
      </View>

      {/* Datos de cuenta */}
      <View style={styles.seccionCard}>
        <Text style={styles.seccionTitulo}>DATOS DE CUENTA</Text>
        <FilaDato icono="👤" label="Nombre" valor={usuario.nombre} />
        <FilaDato icono="🆔" label="ID de usuario" valor={`#${usuario.id}`} />
        <FilaDato
          icono="📋"
          label="Etapa de registro"
          valor={usuario.etapaRegistro === 2 ? 'Completo ✓' : 'Etapa 1 completada'}
        />
      </View>

      {/* Privilegios según categoría */}
      <View style={styles.seccionCard}>
        <Text style={styles.seccionTitulo}>PRIVILEGIOS</Text>
        <View style={styles.privilegio}>
          <Text style={styles.privilegioIcono}>
            {['oro', 'platino'].includes(usuario.categoria?.toLowerCase()) ? '✅' : '❌'}
          </Text>
          <Text style={styles.privilegioTxt}>Sin límite máximo de puja</Text>
        </View>
        <View style={styles.privilegio}>
          <Text style={styles.privilegioIcono}>✅</Text>
          <Text style={styles.privilegioTxt}>
            Subastas hasta categoría {cat.label}
          </Text>
        </View>
        <View style={styles.privilegio}>
          <Text style={styles.privilegioIcono}>✅</Text>
          <Text style={styles.privilegioTxt}>Proponer artículos para subasta</Text>
        </View>
      </View>

      {/* Acciones */}
      <View style={styles.seccionCard}>
        <Text style={styles.seccionTitulo}>ACCIONES</Text>
        <TouchableOpacity
          style={styles.accionBtn}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Text style={styles.accionIcono}>🔔</Text>
          <Text style={styles.accionTxt}>Notificaciones</Text>
          <Text style={styles.accionArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Botón cerrar sesión */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutTxt}>CERRAR SESIÓN</Text>
      </TouchableOpacity>

      <Text style={styles.version}>BidVault v2.0 — TPO DAI</Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 48 },
  centrado: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  sinSesion: { color: colors.textMuted },

  avatarWrap: { alignItems: 'center', marginBottom: 24, paddingTop: 8 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.gold + '22',
    borderWidth: 2, borderColor: colors.gold,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  avatarLetra: { color: colors.gold, fontSize: 34, fontWeight: 'bold' },
  nombre: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  categoriaBadge: {
    borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 4,
    marginBottom: 6,
  },
  categoriaLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  categoriaDesc: { color: colors.textMuted, fontSize: 12, textAlign: 'center', maxWidth: 240 },

  seccionCard: {
    backgroundColor: colors.surface,
    borderRadius: 14, borderWidth: 1,
    borderColor: colors.border,
    padding: 16, marginBottom: 12,
  },
  seccionTitulo: {
    color: colors.textSecondary, fontSize: 10,
    letterSpacing: 2, marginBottom: 12, fontWeight: '700',
  },

  fila: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  filaIcono: { fontSize: 18, marginRight: 12, width: 26 },
  filaBody: { flex: 1 },
  filaLabel: { color: colors.textMuted, fontSize: 10, letterSpacing: 1, marginBottom: 2 },
  filaValor: { color: colors.textPrimary, fontSize: 14 },

  privilegio: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  privilegioIcono: { fontSize: 16, marginRight: 10 },
  privilegioTxt: { color: colors.textSecondary, fontSize: 13 },

  accionBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 6,
  },
  accionIcono: { fontSize: 18, marginRight: 12 },
  accionTxt: { color: colors.textPrimary, fontSize: 14, flex: 1 },
  accionArrow: { color: colors.textMuted, fontSize: 20 },

  logoutBtn: {
    borderWidth: 1, borderColor: '#ef4444',
    borderRadius: 12, padding: 16,
    alignItems: 'center', marginTop: 8, marginBottom: 16,
  },
  logoutTxt: { color: '#ef4444', fontWeight: 'bold', fontSize: 14, letterSpacing: 2 },
  version: { color: colors.textMuted, fontSize: 11, textAlign: 'center' },
});
