import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function MapComponent({ location }) {
  const initialRegion = {
    latitude: location?.coords?.latitude || 37.78825, // Default value if location is undefined
    longitude: location?.coords?.longitude || -122.4324, // Default value if location is undefined
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <MapView
      style={styles.map}
      region={initialRegion}
    >
      {location && (
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="You are here"
        />
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '50%',
  },
});
