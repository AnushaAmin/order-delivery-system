import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { firebase } from '../../firebase';

export default function RequestsScreen() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const unsubscribeRequests = firebase.firestore().collection('deliveryBoysRequest')
      .onSnapshot(snapshot => {
        const requestsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRequests(requestsData);
      });

    return () => unsubscribeRequests();
  }, []);

  const handleAccept = async (requestId) => {
    try {
      // Move request to approved delivery boys collection
      const requestRef = firebase.firestore().collection('deliveryBoysRequest').doc(requestId);
      const requestDoc = await requestRef.get();

      if (requestDoc.exists) {
        const requestData = requestDoc.data();

        // Add to approved delivery boys
        await firebase.firestore().collection('deliveryBoys').doc(requestId).set({
          name: requestData.name,
          email: requestData.email,
          phone: requestData.phone,
          // Add other necessary fields
        });

        // Delete from requests
        await requestRef.delete();

        Alert.alert('Success', 'Request accepted successfully!');
      } else {
        Alert.alert('Error', 'Request not found.');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      Alert.alert('Error', 'Failed to accept request. Please try again later.');
    }
  };

  const handleReject = async (requestId) => {
    try {
      // Delete request from requests collection
      await firebase.firestore().collection('deliveryBoysRequest').doc(requestId).delete();
      Alert.alert('Success', 'Request rejected successfully!');
    } catch (error) {
      console.error('Error rejecting request:', error);
      Alert.alert('Error', 'Failed to reject request. Please try again later.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.requestBox}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.detail}>Email: {item.email}</Text>
        <Text style={styles.detail}>Phone: {item.phone}</Text>
      </View>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={[styles.button, { backgroundColor: 'green' }]} onPress={() => handleAccept(item.id)}>
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: 'red' }]} onPress={() => handleReject(item.id)}>
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delivery Boys Requests</Text>
      <FlatList
        data={requests}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.flatList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  itemContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 15,
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 1,
  },
  requestBox: {
    padding: 20,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  detail: {
    fontSize: 16,
    marginTop: 5,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: '#CCCCCC',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    width: '45%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  flatList: {
    width: '100%',
  },
});
