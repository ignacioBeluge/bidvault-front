import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import DetalleSubastaScreen from '../screens/DetalleSubastaScreen';
import PujaScreen from '../screens/PujaScreen';   // ← nuevo

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="Login"
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="DetalleSubasta" component={DetalleSubastaScreen} />
        <Stack.Screen name="Puja" component={PujaScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}