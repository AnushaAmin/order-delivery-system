import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { firestore } from '../firebase';
import { auth } from '../firebase';  

const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('TaskManager error:', error);
    return;
  }
  if (data) {
    const { locations } = data;
    const user = auth.currentUser;
    if (user && locations && locations.length > 0) {
      try {
        const { latitude, longitude } = locations[0].coords;
        await firestore.collection('locations').doc(user.uid).set({
          location: new firestore.GeoPoint(latitude, longitude),
          timestamp: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),  
        }, { merge: true });
      } catch (err) {
        console.error('Error updating location:', err);
      }
    }
  }
});

export const startLocationUpdates = async () => {
  const hasStarted = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
  if (!hasStarted) {
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      distanceInterval: 1,
      deferredUpdatesInterval: 10000,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'Location Tracking',
        notificationBody: 'We are tracking your location in the background.',
      },
    });
  }
};

export const stopLocationUpdates = async () => {
  const hasStarted = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
  if (hasStarted) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
  }
};
