import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { Platform, Alert, ActivityIndicator } from 'react-native';
import { auth, firestore } from './firebase';
import { startLocationUpdates, stopLocationUpdates } from './view/locationTask';
import AuthStackScreen from './view/Stacks/AuthStackScreen';
import DeliveryPersonStackScreen from './view/Stacks/DeliveryPersonStackScreen';
import AdminStackScreen from './view/Stacks/AdminStackScreen';

export default function App() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [role, setRole] = React.useState(null);

  useEffect(() => {
    const getNotificationPermissions = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
    };

    const setupNotificationHandler = () => {
      Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification);
      });

      Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification response received:', response);
      });

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
    };

    getNotificationPermissions();
    setupNotificationHandler();

    const fetchAdminEmail = async () => {
      try {
        const adminRef = firestore.collection('admin').limit(1);
        const snapshot = await adminRef.get();
        if (!snapshot.empty) {
          const adminEmail = snapshot.docs[0].data().email;
          return adminEmail;
        } else {
          throw new Error('No admin email found in the database.');
        }
      } catch (error) {
        console.error('Error fetching admin email:', error);
        return null;
      }
    };

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const adminEmail = await fetchAdminEmail();
          if (adminEmail && user.email === adminEmail) {
            setRole('admin');
            stopLocationUpdates(); 
          } else {
            const deliveryBoyRef = firestore.collection('deliveryBoys').doc(user.uid);
            const deliveryBoyDoc = await deliveryBoyRef.get();
            if (deliveryBoyDoc.exists) {
              setRole('deliveryBoy');
              startLocationUpdates(user.uid);
            } else {
              setRole(null);
            }
          }
        } catch (error) {
          console.error('Error checking user role:', error);
          setRole(null);
        }
      } else {
        setRole(null);
        stopLocationUpdates(); 
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#EB5B00" />;
  }

  return (
    <NavigationContainer>
      {role === 'admin' ? (
        <AdminStackScreen />
      ) : role === 'deliveryBoy' ? (
        <DeliveryPersonStackScreen />
      ) : (
        <AuthStackScreen />
      )}
    </NavigationContainer>
  );
}
