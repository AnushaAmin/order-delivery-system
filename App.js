import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native';
import { auth, firestore } from './firebase';
import { startLocationUpdates, stopLocationUpdates } from './view/locationTask';

// Import stack screens
import AuthStackScreen from './view/Stacks/AuthStackScreen';
import DeliveryPersonStackScreen from './view/Stacks/DeliveryPersonStackScreen';
import AdminStackScreen from './view/Stacks/AdminStackScreen';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null); // Use null to distinguish between loading and no role

  useEffect(() => {
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
            stopLocationUpdates(); // Stop location updates if the user is an admin
          } else {
            const deliveryBoyRef = firestore.collection('deliveryBoys').doc(user.uid);
            const deliveryBoyDoc = await deliveryBoyRef.get();
            if (deliveryBoyDoc.exists) {
              setRole('deliveryBoy');
              startLocationUpdates(user.uid); // Start location updates for delivery boy
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
        stopLocationUpdates(); // Stop location updates when no user is logged in
      }
      setLoading(false);
    });

    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#EB5B00" />;
  }

  return (
    <NavigationContainer>
      {role === 'admin' ? (
        <AdminStackScreen />
      ) : role === 'deliveryBoy' ? (
        <DeliveryPersonStackScreen/>
      ) : (
        <AuthStackScreen />
      )}
    </NavigationContainer>
  );
}
