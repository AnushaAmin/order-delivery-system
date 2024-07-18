import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { firebase } from '../../firebase';

export default function ApprovedDeliveryScreen({ navigation }) {
  const [deliveryBoys, setDeliveryBoys] = useState([]);

  useEffect(() => {
    const unsubscribe = firebase.firestore().collection('deliveryBoys')
      .onSnapshot(snapshot => {
        const boysList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDeliveryBoys(boysList);
      });

    return () => unsubscribe();
  }, []);

  const handleDeliveryBoyPress = (deliveryBoy) => {
    // Navigate to a screen showing delivery boy's current location
    navigation.navigate('DeliveryBoyScreen', { deliveryBoy });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handleDeliveryBoyPress(item)}>
      <Text style={styles.name}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Approved Delivery Boys</Text>
      <FlatList
        data={deliveryBoys}
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
    backgroundColor: 'orange',
    borderRadius: 8,
    marginBottom: 15,
    padding: 20,
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color:'white'
  },
  flatList: {
    width: '100%',
  },
});
