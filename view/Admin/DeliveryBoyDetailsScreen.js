import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { firebase } from '../../firebase';


export default function DeliveryBoyDetailsScreen({ route, navigation }) {
  const { deliveryBoy } = route.params;
  const [packages, setPackages] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const snapshot = await firebase.firestore().collection('packages')
          .where('assignedTo', '==', deliveryBoy.id)
          .get();

        if (snapshot.empty) {
          setError('No packages found for this delivery boy.');
        } else {
          const packagesList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setPackages(packagesList);
          setError(null); // Clear any previous errors
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
        setError('Error fetching packages.');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [deliveryBoy.id]);

  const renderItem = ({ item }) => (
    <View style={styles.packageContainer}>
      <Text style={styles.packageText}>Package: {item.packageName}</Text>
      <Text style={styles.packageText}>Details: {item.packageDetails}</Text>
      <Text style={styles.packageText}>Status: {item.status}</Text>
      {item.status === 'DELIVERED' && item.deliveredOn && (
        <Text style={styles.packageText}>Delivered On: {item.deliveredOn.toDate().toLocaleDateString()}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Packages for {deliveryBoy.name}</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : error ? (
        <Text>{error}</Text>
      ) : packages.length > 0 ? (
        <FlatList
          data={packages}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          style={styles.flatList}
        />
      ) : (
        <Text>No packages found for this delivery boy.</Text>
      )}

        <TouchableOpacity
        style={styles.mapButton}
        onPress={() => navigation.navigate('ViewLocation', { deliveryBoyId: deliveryBoy.id })}
      >
        <Text style={styles.mapButtonText}>View Location</Text>
      </TouchableOpacity>
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
  packageContainer: {
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
  packageText: {
    fontSize: 16,
    color: 'white',
  },
  flatList: {
    width: '100%',
  },
  mapButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  mapButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});
