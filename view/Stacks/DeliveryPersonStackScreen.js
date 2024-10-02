import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DeliveryBoyScreen from '../DeliveryBoy/DeliveryBoyScreen';
import ViewLocation from '../ViewLocation';

const DeliveryPersonStack = createStackNavigator();

export default function DeliveryPersonStackScreen() {
  return (
    <DeliveryPersonStack.Navigator>
      <DeliveryPersonStack.Screen name="DeliveryBoyScreen" component={DeliveryBoyScreen} />
      <DeliveryPersonStack.Screen name="ViewLocation" component={ViewLocation} />
    </DeliveryPersonStack.Navigator>
  );
}
