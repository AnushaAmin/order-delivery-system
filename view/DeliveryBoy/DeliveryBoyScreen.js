import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { startBackgroundLocationTracking, stopBackgroundLocationTracking } from '../locationTask';
import { auth } from '../../firebase'; // Make sure this imports your firebase auth instance

const LOCATION_TASK_NAME = 'background-location-task';

export default function DeliveryBoyScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    let intervalId;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        console.error('Permission to access location was denied');
        return;
      }

      try {
        await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000, // Update every second
            distanceInterval: 1, // Update every meter
          },
          (newLocation) => {
            setLocation(newLocation);
          }
        );

        await startBackgroundLocationTracking();

        intervalId = setInterval(async () => {
          setTime(new Date().toLocaleTimeString());

          let updatedLocation = await Location.getCurrentPositionAsync({});
          setLocation(updatedLocation);
        }, 60000); // 60000 ms = 1 minute

        setTime(new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Error in location tracking:', error);
        setErrorMsg('Error in location tracking. Please check logs for details.');
      }
    })();

    // Clean up interval and stop background tracking
    return () => {
      clearInterval(intervalId);
      stopBackgroundLocationTracking();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigation.navigate('DeliveryBoyLogin');
    } catch (error) {
      console.error('Failed to logout:', error);
      alert('Failed to logout.');
    }
  };

  return (
    <View style={styles.container}>
      {errorMsg && <Text>{errorMsg}</Text>}
      {location && (
        <MapView
          style={styles.map}
          region={{
            latitude: location?.coords?.latitude || 0,
            longitude: location?.coords?.longitude || 0,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="You are here"
          />
        </MapView>
      )}
      <Text style={styles.time}>Current Time: {time}</Text>
      {location && (
        <Text style={styles.location}>
          Latitude: {location.coords.latitude.toFixed(4)}, Longitude: {location.coords.longitude.toFixed(4)}
        </Text>
      )}
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
    backgroundColor: '#F5FCFF',
  },
  map: {
    width: '100%',
    height: '50%',
  },
  time: {
    marginTop: 20,
    fontSize: 18,
  },
  location: {
    marginTop: 10,
    fontSize: 16,
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
