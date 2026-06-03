import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="Login"
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        {/* Home lo agregamos en el próximo paso */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}