import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { firestore } from '../../firebase';

export default function CreatePackageScreen({ navigation }) {
  const [packageName, setPackageName] = useState('');
  const [packageDetails, setPackageDetails] = useState('');

  const createPackage = async () => {
    try {
      await firestore.collection('packages').add({
        packageName,
        packageDetails,
        status: 'PREPARED',
        assignedTo: null,
      });
      navigation.goBack();
    } catch (error) {
      console.error('Error creating package:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Package Name</Text>
      <TextInput
        placeholder="Enter package name"
        value={packageName}
        onChangeText={setPackageName}
        style={styles.input}
      />
      <Text style={styles.label}>Package Details</Text>
      <TextInput
        placeholder="Enter package details"
        value={packageDetails}
        onChangeText={setPackageDetails}
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={createPackage}>
        <Text style={styles.buttonText}>Create Package</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  label: {
    fontSize: 18,
    marginVertical: 10,
    fontWeight: 'bold',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#EB5B00',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
