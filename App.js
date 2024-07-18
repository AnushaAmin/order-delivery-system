
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import DeliveryBoyScreen from './view/DeliveryBoy/DeliveryBoyScreen';
import AdminScreen from './view/Admin/AdminScreen';
import AdminLoginScreen from './view/Admin/AdminLoginScreen';
import MainScreen from './view/MainScreen';
import DeliveryBoyLogin from './view/DeliveryBoy/DeliveryBoyLogin';
import RegisterScreen from './view/DeliveryBoy/RegisterScreen';
import RequestsScreen from './view/Admin/RequestsScreen';
import ApprovedDeliveryScreen from './view/Admin/ApprovedDeliveryScreen';
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Main">
        <Stack.Screen name="MainScreen"  component={MainScreen} options={{ title: 'Order-Delivery' }}/> 
        <Stack.Screen name="AdminLoginScreen"  component={AdminLoginScreen} options={{ title: 'Admin Login' }}/>
        <Stack.Screen name="DeliveryBoyLogin"  component={DeliveryBoyLogin} options={{ title: 'Delivery Boy Login' }}/>
        <Stack.Screen name="RegisterScreen"  component={RegisterScreen} options={{ title: 'Register' }}/>
        <Stack.Screen name="DeliveryBoyScreen" component={DeliveryBoyScreen} options={{ title: 'Delivery Boy Screen' }}/>
        <Stack.Screen name="Admin" component={AdminScreen} />
        <Stack.Screen name="RequestsScreen" component={RequestsScreen} options={{ title: '' }}/>
        <Stack.Screen name="ApprovedDeliveryScreen" component={ApprovedDeliveryScreen} options={{ title: '' }} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
