import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { firestore } from '../../firebase';
import { Picker } from '@react-native-picker/picker';
import * as Notifications from 'expo-notifications';

export default function AssignPackageScreen() {
  const [packages, setPackages] = useState([]);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState('');
  const [assignedPackages, setAssignedPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const deliveryBoysSnapshot = await firestore.collection('deliveryBoys').get();
        const deliveryBoysData = deliveryBoysSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          notificationToken: doc.data().notificationToken, // Fetch notification token
        }));
        setDeliveryBoys(deliveryBoysData);

        const packagesSnapshot = await firestore.collection('packages').where('status', '==', 'PREPARED').get();
        const packagesData = packagesSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().packageName || 'Unnamed Package',
        }));
        setPackages(packagesData);

        const assignedPackagesSnapshot = await firestore.collection('packages').where('status', '==', 'ASSIGNED').get();
        const assignedPackagesData = assignedPackagesSnapshot.docs.map(doc => {
          const data = doc.data();
          const deliveryBoy = deliveryBoysData.find(db => db.id === data.assignedTo);
          return {
            id: doc.id,
            name: data.packageName || 'Unnamed Package',
            deliveryBoyName: deliveryBoy ? deliveryBoy.name : 'Unknown',
          };
        });
        setAssignedPackages(assignedPackagesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchAssignedPackages = async () => {
      try {
        const assignedPackagesSnapshot = await firestore.collection('packages').where('status', '==', 'ASSIGNED').get();
        const assignedPackagesData = assignedPackagesSnapshot.docs.map(doc => {
          const data = doc.data();
          const deliveryBoy = deliveryBoys.find(db => db.id === data.assignedTo);
          return {
            id: doc.id,
            name: data.packageName || 'Unnamed Package',
            deliveryBoyName: deliveryBoy ? deliveryBoy.name : 'Unknown',
          };
        });
        setAssignedPackages(assignedPackagesData);
      } catch (error) {
        console.error('Error fetching assigned packages:', error);
      }
    };

    if (deliveryBoys.length > 0) {
      fetchAssignedPackages();
    }
  }, [deliveryBoys]);

  const assignPackage = async () => {
    if (selectedPackage && selectedDeliveryBoy) {
      try {
        const deliveryBoy = deliveryBoys.find(db => db.id === selectedDeliveryBoy);
        await firestore.collection('packages').doc(selectedPackage).update({
          status: 'ASSIGNED',
          assignedTo: selectedDeliveryBoy,
        });

        alert('Package assigned successfully!');


        setAssignedPackages(prevAssigned => [
          ...prevAssigned,
          {
            id: selectedPackage,
            name: packages.find(pkg => pkg.id === selectedPackage)?.name || 'Unnamed Package',
            deliveryBoyName: deliveryBoy?.name || 'Unknown',
          },
        ]);

        setPackages(prevPackages => prevPackages.filter(pkg => pkg.id !== selectedPackage));
        setSelectedPackage('');
        setSelectedDeliveryBoy('');
      } catch (error) {
        console.error('Error assigning package:', error);
        alert('Failed to assign package. Please try again.');
      }
    } else {
      alert('Please select a package and a delivery boy.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EB5B00" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Select Package</Text>
      <Picker
        selectedValue={selectedPackage}
        onValueChange={itemValue => setSelectedPackage(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select a package" value="" />
        {packages.map(pkg => (
          <Picker.Item key={pkg.id} label={pkg.name} value={pkg.id} />
        ))}
      </Picker>

      <Text style={styles.label}>Select Delivery Boy</Text>
      <Picker
        selectedValue={selectedDeliveryBoy}
        onValueChange={itemValue => setSelectedDeliveryBoy(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select a delivery boy" value="" />
        {deliveryBoys.map(boy => (
          <Picker.Item key={boy.id} label={boy.name} value={boy.id} />
        ))}
      </Picker>

      <TouchableOpacity style={styles.button} onPress={assignPackage}>
        <Text style={styles.buttonText}>Assign Package</Text>
      </TouchableOpacity>

      <Text style={styles.assignedTitle}>Assigned Packages</Text>
      {assignedPackages.length > 0 ? (
        assignedPackages.map(pkg => (
          <View key={pkg.id} style={styles.assignedPackage}>
            <Text style={styles.assignedPackageName}>{pkg.name}</Text>
            <Text style={styles.assignedDeliveryBoy}>{pkg.deliveryBoyName}</Text>
          </View>
        ))
      ) : (
        <Text>No assigned packages.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontSize: 18,
    marginVertical: 10,
    fontWeight: 'bold',
  },
  picker: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#EB5B00',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  assignedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 30,
  },
  assignedPackage: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginTop: 10,
  },
  assignedPackageName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  assignedDeliveryBoy: {
    fontSize: 16,
    color: '#555',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
