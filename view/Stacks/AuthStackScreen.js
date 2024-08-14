import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MainScreen from '../MainScreen';
import AdminLoginScreen from '../Admin/AdminLoginScreen';
import DeliveryBoyLogin from '../DeliveryBoy/DeliveryBoyLogin';
import RegisterScreen from '../DeliveryBoy/RegisterScreen';
const AuthStack = createStackNavigator();

export default function AuthStackScreen() {
  return (
    <AuthStack.Navigator initialRouteName="Main">
      <AuthStack.Screen name="MainScreen" component={MainScreen} />
      <AuthStack.Screen name="AdminLoginScreen" component={AdminLoginScreen} />
      <AuthStack.Screen name="DeliveryBoyLogin" component={DeliveryBoyLogin} />
      <AuthStack.Screen name="RegisterScreen" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}
