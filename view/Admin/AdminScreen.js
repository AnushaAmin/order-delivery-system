import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import * as Notifications from 'expo-notifications';
import { auth, firestore } from '../../firebase';

export default function AdminScreen({ navigation }) {
  const [deliveryBoysCount, setDeliveryBoysCount] = useState(0);
  const [deliveryBoysRequestsCount, setDeliveryBoysRequestsCount] = useState(0);
  const [assignedPackagesCount, setAssignedPackagesCount] = useState(0);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const unsubscribeDeliveryBoys = firestore.collection('deliveryBoys')
      .onSnapshot(snapshot => setDeliveryBoysCount(snapshot.size));

    const unsubscribeRequests = firestore.collection('deliveryBoysRequest')
      .onSnapshot(snapshot => setDeliveryBoysRequestsCount(snapshot.size));

    const unsubscribePackages = firestore.collection('packages')
      .where('status', '==', 'ASSIGNED')
      .onSnapshot(snapshot => setAssignedPackagesCount(snapshot.size));

    // Notification handling
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      setNotification(notification.request.content);
    });

    const notificationResponseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received:', response);
    });

    return () => {
      unsubscribeDeliveryBoys();
      unsubscribeRequests();
      unsubscribePackages();
      notificationListener.remove();
      notificationResponseListener.remove();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigation.navigate('MainScreen'); // Navigate to auth stack after logout
    } catch (error) {
      console.error('Failed to logout:', error);
      alert('Failed to logout. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {notification && (
        <View style={styles.notificationContainer}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationBody}>{notification.body}</Text>
        </View>
      )}
      <View style={styles.boxContainer}>
        <TouchableOpacity style={styles.countBox} onPress={() => navigation.navigate('RequestsScreen')}>
          <Text style={styles.countText}>{deliveryBoysRequestsCount}</Text>
          <Text style={styles.countLabel}>Delivery Boys Requests</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.countBox} onPress={() => navigation.navigate('ApprovedDeliveryScreen')}>
          <Text style={styles.countText}>{deliveryBoysCount}</Text>
          <Text style={styles.countLabel}>Approved Delivery Boys</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.boxContainer}>
        <TouchableOpacity style={styles.countBox} onPress={() => navigation.navigate('CreatePackageScreen')}>
          <Text style={styles.countLabel}>Create Package</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.countBox} onPress={() => navigation.navigate('AssignPackageScreen')}>
          <Text style={styles.countText}>{assignedPackagesCount}</Text>
          <Text style={styles.countLabel}>Assign Package</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  countBox: {
    backgroundColor: 'orange',
    padding: 20,
    borderRadius: 10,
    width: '45%',
    alignItems: 'center',
  },
  countText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  countLabel: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  logoutButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#EB5B00',
    padding: 10,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  notificationContainer: {
    position: 'absolute',
    top: 50,
    width: '100%',
    backgroundColor: '#EB5B00',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  notificationBody: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});
