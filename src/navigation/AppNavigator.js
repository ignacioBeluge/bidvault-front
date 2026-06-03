import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';

// Pantallas de Ignacio
import DetalleSubastaScreen from '../screens/DetalleSubastaScreen';
import PujaScreen from '../screens/PujaScreen';

// Pantallas de Juani
import AuctionDetailScreen from '../screens/AuctionDetailScreen';
import RegisterStage1Screen from '../screens/RegisterStage1Screen';
import RegisterStage2Screen from '../screens/RegisterStage2Screen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BidHistoryScreen from '../screens/BidHistoryScreen';
import ProposeItemScreen from '../screens/ProposeItemScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">

        <Stack.Screen name="Login" component={LoginScreen} />

        <Stack.Screen name="Home" component={HomeScreen} />

        {/* Detalle de subasta — versión con puja end-to-end */}
        <Stack.Screen
          name="AuctionDetail"
          component={AuctionDetailScreen}
          options={{
            headerShown: true,
            title: 'Detalle de subasta',
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.gold,
            headerTitleStyle: { color: colors.textPrimary, fontWeight: '700' },
          }}
        />

        {/* Pantallas de Ignacio */}
        <Stack.Screen name="DetalleSubasta" component={DetalleSubastaScreen} />
        <Stack.Screen name="Puja" component={PujaScreen} />

        {/* Registro en 2 etapas */}
        <Stack.Screen name="RegisterStage1" component={RegisterStage1Screen} />
        <Stack.Screen name="RegisterStage2" component={RegisterStage2Screen} />

        {/* Notificaciones */}
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{
            headerShown: true,
            title: 'Notificaciones',
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.gold,
            headerTitleStyle: { color: colors.textPrimary, fontWeight: '700' },
          }}
        />

        {/* Perfil */}
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            headerShown: true,
            title: 'Mi perfil',
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.gold,
            headerTitleStyle: { color: colors.textPrimary, fontWeight: '700' },
          }}
        />

        {/* Historial de pujas */}
        <Stack.Screen
          name="BidHistory"
          component={BidHistoryScreen}
          options={{
            headerShown: true,
            title: 'Mis pujas',
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.gold,
            headerTitleStyle: { color: colors.textPrimary, fontWeight: '700' },
          }}
        />

        {/* Proponer artículo */}
        <Stack.Screen
          name="ProposeItem"
          component={ProposeItemScreen}
          options={{
            headerShown: true,
            title: 'Proponer artículo',
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.gold,
            headerTitleStyle: { color: colors.textPrimary, fontWeight: '700' },
          }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
