import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { auth, firestore } from '../../firebase';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const handleRegister = async () => {
    try {
      const userCredentials = await auth.createUserWithEmailAndPassword(email, password);
      const { uid } = userCredentials.user;
  
      // Save additional details to Firestore in 'deliveryBoysRequest' collection
      await firestore.collection('deliveryBoysRequest').doc(uid).set({
        name,
        email,
        phone,
        status: 'pending', // Initial status is pending approval
      });

      // Show confirmation message to the user
      Alert.alert(
        'Registration Successful',
        'Your registration request has been submitted. Please wait for approval.',
        [{ text: 'OK', onPress: () => navigation.navigate('DeliveryBoyLogin') }]
      );
    } catch (error) {
      console.error('Error registering user:', error);
      let errorMessage = 'Failed to register. Please check your details and try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email address is already in use.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters long.';
      }
      Alert.alert('Registration Failed', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/deliveryLogin.png')} style={styles.image} />
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
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
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#EB5B00',
    borderWidth: 1,
    marginBottom: 12,
    padding: 10,
    width: '100%',
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#EB5B00',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
    marginTop: 20,
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  waitText: {
    marginTop: 10,
    fontSize: 14,
    color: '#808080',
  },
});
