import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { firebase } from '../firebase';

const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('TaskManager error:', error);
    return;
  }
  if (data) {
    const { locations } = data;
    const user = firebase.auth().currentUser;

    if (user) {
      const userDoc = firebase.firestore().collection('deliveryLocations').doc(user.uid);

      for (const location of locations) {
        console.log('Background location update:', location); // Added log for debugging
        await userDoc.set({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: new Date(location.timestamp).toISOString(),
        }, { merge: true });
      }
    }
  }
});

export async function startBackgroundLocationTracking() {
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();

  if (foregroundStatus === 'granted' && backgroundStatus === 'granted') {
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      distanceInterval: 1, // Minimum change (in meters) between updates
      timeInterval: 60000, // Minimum interval (in milliseconds) between updates
      foregroundService: {
        notificationTitle: 'Tracking your location',
        notificationBody: 'Your location is being used to track your delivery personnel.',
      },
    });
    console.log('Background location tracking started.'); // Added log
  } else {
    console.error('Location permissions not granted');
  }
}

export async function stopBackgroundLocationTracking() {
  await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
  console.log('Background location tracking stopped.'); // Added log
}
