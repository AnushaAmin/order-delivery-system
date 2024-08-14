import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { firestore } from '../../firebase';
import { Picker } from '@react-native-picker/picker';

export default function AssignPackageScreen() {
  const [packages, setPackages] = useState([]);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState('');
  const [assignedPackages, setAssignedPackages] = useState([]);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const packagesSnapshot = await firestore.collection('packages').where('status', '==', 'PREPARED').get();
        const packagesData = packagesSnapshot.docs.map(doc => {
          const data = doc.data();
          return { id: doc.id, name: data.packageName || 'Unnamed Package' };
        });
        setPackages(packagesData);
       // console.log('Fetched packages:', packagesData);
      } catch (error) {
        console.error('Error fetching packages:', error);
      }
    };

    const fetchDeliveryBoys = async () => {
      try {
        const deliveryBoysSnapshot = await firestore.collection('deliveryBoys').get();
        const deliveryBoysData = deliveryBoysSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
        setDeliveryBoys(deliveryBoysData);
       // console.log('Fetched delivery boys:', deliveryBoysData);
      } catch (error) {
        console.error('Error fetching delivery boys:', error);
      }
    };

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
        //console.log('Fetched assigned packages:', assignedPackagesData);
      } catch (error) {
        console.error('Error fetching assigned packages:', error);
      }
    };

    fetchPackages();
    fetchDeliveryBoys();
    fetchAssignedPackages();
  }, []);

  const assignPackage = async () => {
    if (selectedPackage && selectedDeliveryBoy) {
      const deliveryBoy = deliveryBoys.find(db => db.id === selectedDeliveryBoy);
      const packageDoc = firestore.collection('packages').doc(selectedPackage);
      await packageDoc.update({
        status: 'ASSIGNED',
        assignedTo: selectedDeliveryBoy,
      });

      alert('Package assigned successfully!');


      setAssignedPackages(prev => [
        ...prev,
        {
          id: selectedPackage,
          name: packages.find(pkg => pkg.id === selectedPackage).name,
          deliveryBoyName: deliveryBoy.name,
        },
      ]);

      // Remove the assigned package from the PREPARED packages list
      setPackages(packages.filter(pkg => pkg.id !== selectedPackage));
      setSelectedPackage('');
      setSelectedDeliveryBoy('');
    } else {
      alert('Please select both package and delivery boy');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Select Package</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedPackage}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedPackage(itemValue)}
        >
          <Picker.Item label="Select a package" value="" />
          {packages.map(pkg => (
            <Picker.Item key={pkg.id} label={pkg.name} value={pkg.id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Select Delivery Boy</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedDeliveryBoy}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedDeliveryBoy(itemValue)}
        >
          <Picker.Item label="Select a delivery boy" value="" />
          {deliveryBoys.map(db => (
            <Picker.Item key={db.id} label={db.name} value={db.id} />
          ))}
        </Picker>
      </View>

      <TouchableOpacity style={styles.button} onPress={assignPackage}>
        <Text style={styles.buttonText}>Assign Package</Text>
      </TouchableOpacity>

      <View style={styles.assignedContainer}>
        <Text style={styles.assignedTitle}>Assigned Packages</Text>
        {assignedPackages.length > 0 ? (
          assignedPackages.map(pkg => (
            <View key={pkg.id} style={styles.assignedItem}>
              <Text style={styles.assignedText}>{`Package: ${pkg.name}`}</Text>
              <Text style={styles.assignedText}>{`Assigned to: ${pkg.deliveryBoyName}`}</Text>
            </View>
          ))
        ) : (
          <Text>No packages assigned yet.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  label: {
    fontSize: 18,
    marginVertical: 10,
    fontWeight: 'bold',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    width: '100%',
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  button: {
    backgroundColor: '#EB5B00',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  assignedContainer: {
    width: '100%',
    marginTop: 20,
  },
  assignedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  assignedItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  assignedText: {
    fontSize: 16,
  },
});
