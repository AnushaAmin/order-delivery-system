import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminScreen from '../Admin/AdminScreen';
import RequestsScreen from '../Admin/RequestsScreen';
import ApprovedDeliveryScreen from '../Admin/ApprovedDeliveryScreen';
import CreatePackageScreen from '../Admin/CreatePackageScreen';
import AssignPackageScreen from '../Admin/AssignPackageScreen';
import DeliveryBoyDetailsScreen from '../Admin/DeliveryBoyDetailsScreen';
import ViewLocation from '../ViewLocation';

const AdminStack = createStackNavigator();

export default function AdminStackScreen() {
  return (
    <AdminStack.Navigator initialRouteName="AdminScreen">
      <AdminStack.Screen name="AdminScreen" component={AdminScreen} />
      <AdminStack.Screen name="RequestsScreen" component={RequestsScreen} />
      <AdminStack.Screen name="ApprovedDeliveryScreen" component={ApprovedDeliveryScreen} />
      <AdminStack.Screen name="CreatePackageScreen" component={CreatePackageScreen} />
      <AdminStack.Screen name="AssignPackageScreen" component={AssignPackageScreen} />
      <AdminStack.Screen name="DeliveryBoyDetailsScreen" component={DeliveryBoyDetailsScreen} />
      <AdminStack.Screen name="ViewLocation" component={ViewLocation} />
    </AdminStack.Navigator>
  );
}
