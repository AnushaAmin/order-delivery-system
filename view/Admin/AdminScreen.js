import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { firebase, auth } from '../../firebase';

export default function AdminScreen({ navigation }) {
  const [deliveryBoysCount, setDeliveryBoysCount] = useState(0);
  const [deliveryBoysRequestsCount, setDeliveryBoysRequestsCount] = useState(0);

  useEffect(() => {
    const unsubscribeDeliveryBoys = firebase.firestore().collection('deliveryBoys')
      .onSnapshot(snapshot => {
        setDeliveryBoysCount(snapshot.size); 
      });

    const unsubscribeRequests = firebase.firestore().collection('deliveryBoysRequest')
      .onSnapshot(snapshot => {
        setDeliveryBoysRequestsCount(snapshot.size); 
      });

    return () => {
      unsubscribeDeliveryBoys();
      unsubscribeRequests();
    };
  }, []);

  const handleRequestsBoxPress = () => {
    navigation.navigate('RequestsScreen'); 
  };

  const handleApprovedBoxPress = () => {
    navigation.navigate('ApprovedDeliveryScreen'); 
  };

  const handleLogout = async () => {
    try {
      // Unsubscribe from Firestore listeners
      firebase.firestore().terminate().then(async () => {
        await auth.signOut();
        navigation.navigate('MainScreen');
      }).catch((error) => {
        console.error('Error terminating Firestore:', error);
        alert('Failed to logout. Please try again.');
      });
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
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});
