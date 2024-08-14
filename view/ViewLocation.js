import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { firebase, firestore } from '../firebase';
import { startBackgroundLocationTracking, stopBackgroundLocationTracking } from './locationTask'; // Import the tracking functions

export default function ViewLocation({ route }) {
  const { deliveryBoyId } = route.params;
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const updateLocationInDatabase = async (lat, long) => {
      try {
        await firestore.collection('deliveryBoys').doc(deliveryBoyId).set({
          location: new firebase.firestore.GeoPoint(lat, long) // Use firebase.firestore.GeoPoint
        }, { merge: true });
        console.log('Location updated in Firestore:', lat, long);
      } catch (err) {
        console.error('Error updating location:', err);
        setError('Error updating location.');
      }
    };

    const fetchLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location permission not granted.');
          return;
        }

        let { coords } = await Location.getCurrentPositionAsync({});
        console.log('Fetched coordinates:', coords);
        setLocation(coords);
        setLoading(false);

        await updateLocationInDatabase(coords.latitude, coords.longitude);

        const locationUpdateInterval = setInterval(async () => {
          let { coords } = await Location.getCurrentPositionAsync({});
          console.log('Updated coordinates:', coords);
          setLocation(coords);
          await updateLocationInDatabase(coords.latitude, coords.longitude);
        }, 60000);

        return () => clearInterval(locationUpdateInterval);
      } catch (err) {
        console.error('Error fetching location:', err);
        setError('Error fetching location.');
        setLoading(false);
      }
    };

    fetchLocation();

    // Start background location tracking
    startBackgroundLocationTracking();

    // Cleanup function to stop background location tracking when the component unmounts
    return () => {
      stopBackgroundLocationTracking();
    };
  }, [deliveryBoyId]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} />
      </MapView>
      <Text style={styles.text}>Your Location</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  text: {
    position: 'absolute',
    top: 20,
    left: 20,
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
  },
});
