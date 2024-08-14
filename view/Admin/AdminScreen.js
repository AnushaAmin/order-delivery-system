import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { auth, firestore } from '../../firebase';

export default function AdminScreen({ navigation }) {
  const [deliveryBoysCount, setDeliveryBoysCount] = useState(0);
  const [deliveryBoysRequestsCount, setDeliveryBoysRequestsCount] = useState(0);
  const [assignedPackagesCount, setAssignedPackagesCount] = useState(0);

  useEffect(() => {
    const unsubscribeDeliveryBoys = firestore.collection('deliveryBoys')
      .onSnapshot(snapshot => {
        setDeliveryBoysCount(snapshot.size);
      });

    const unsubscribeRequests = firestore.collection('deliveryBoysRequest')
      .onSnapshot(snapshot => {
        setDeliveryBoysRequestsCount(snapshot.size);
      });

    const unsubscribePackages = firestore.collection('packages')
      .where('status', '==', 'ASSIGNED')
      .onSnapshot(snapshot => {
        setAssignedPackagesCount(snapshot.size);
      });

    return () => {
      unsubscribeDeliveryBoys();
      unsubscribeRequests();
      unsubscribePackages();
    };
  }, []);

  const handleRequestsBoxPress = () => {
    navigation.navigate('RequestsScreen');
  };

  const handleApprovedBoxPress = () => {
    navigation.navigate('ApprovedDeliveryScreen');
  };

  const handleCreatePackagePress = () => {
    navigation.navigate('CreatePackageScreen');
  };

  const handleAssignPackagePress = () => {
    navigation.navigate('AssignPackageScreen');
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigation.navigate('MainScreen'); // Ensure to navigate to the auth stack
    } catch (error) {
      console.error('Failed to logout:', error);
      alert('Failed to logout. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.boxContainer}>
        <TouchableOpacity style={styles.countBox} onPress={handleRequestsBoxPress}>
          <Text style={styles.countText}>{deliveryBoysRequestsCount}</Text>
          <Text style={styles.countLabel}>Delivery Boys Requests</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.countBox} onPress={handleApprovedBoxPress}>
          <Text style={styles.countText}>{deliveryBoysCount}</Text>
          <Text style={styles.countLabel}>Approved Delivery Boys</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.boxContainer}>
        <TouchableOpacity style={styles.countBox} onPress={handleCreatePackagePress}>
          <Text style={styles.countLabel}>Create Package</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.countBox} onPress={handleAssignPackagePress}>
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '40%',
  },
  buttonText: {
    color: '#FFFF',
    fontSize: 16,
  },
  packageCountText: {
    color: '#FFFFF',
    fontSize: 14,
    marginTop: 5,
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
});
