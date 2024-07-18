import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated, Easing } from 'react-native';

export default function MainScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const loadingWidth = useRef(new Animated.Value(0)).current;

  const handleAdminPress = () => {
    setLoading(true);
    Animated.timing(loadingWidth, {
      toValue: 100,
      duration: 2000, // 2 seconds to fill the loading bar
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(() => {
      setLoading(false);
      navigation.navigate('AdminLoginScreen');
    });
  };
   
  const handleDeliveryBoyPress = () => {
    setLoading(true);
    Animated.timing(loadingWidth, {
      toValue: 100,
      duration: 2000, // 2 seconds to fill the loading bar
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(() => {
      setLoading(false);
      navigation.navigate('DeliveryBoyLogin');
    });  
  }

  return (
    <View style={styles.container}>
      <Image source={require('../assets/deliveryLogin.png')} style={styles.image} />
      {loading ? (
        <Animated.View style={[styles.loadingBar, { width: loadingWidth.interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', '100%'],
          }) }]}>
          <Text style={styles.loadingText}>Loading...</Text>
        </Animated.View>
      ) : (
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.button} onPress={handleAdminPress}>
            <Text style={styles.buttonText}>Admin</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleDeliveryBoyPress}>
            <Text style={styles.buttonText}>Delivery Boy</Text>
          </TouchableOpacity>
        </View>
      )}
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
    width: 250,
    height: 250,
    marginBottom: 50,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  button: {
    backgroundColor: '#EB5B00',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
    flex: 1,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  loadingBar: {
    height: 10,
    backgroundColor: '#EB5B00',
    borderRadius: 5,
    width: '100%',
    marginTop: 10,
  },
  loadingText: {
    position: 'absolute',
    top: -20,
    color: '#EB5B00',
  },
});

