import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { auth, firestore } from '../../firebase';
import email from 'react-native-email'; // Import the email package
import { startLocationUpdates, stopLocationUpdates } from '../locationTask';

export default function DeliveryBoyScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchAssignedTasks = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          startLocationUpdates(user.uid);

          const tasksSnapshot = await firestore.collection('packages')
            .where('assignedTo', '==', user.uid)
            .get();

          const tasksList = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setTasks(tasksList);
        } else {
          setErrorMsg('User not logged in.');
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setErrorMsg('Error fetching tasks. Please check logs for details.');
      }
    };

    fetchAssignedTasks();

    return () => {
      stopLocationUpdates();
    };
  }, []);

  // Function to send email using react-native-email
  const sendEmailToAdmin = async (packageId, deliveryPersonId) => {
    try {
      const adminSnapshot = await firestore.collection('admin').get();
      if (!adminSnapshot.empty) {
        const adminDoc = adminSnapshot.docs[0];
        const adminEmail = adminDoc.data()?.email;
  
        if (adminEmail) {
  
          // Retrieve the delivery boy's name using their UID (which is stored as the document ID)
          const deliveryBoyDoc = await firestore.collection('deliveryBoys').doc(deliveryPersonId).get();
  
          if (deliveryBoyDoc.exists) {
            const deliveryBoyName = deliveryBoyDoc.data()?.name;
  
            if (deliveryBoyName) {
  
              // Prepare email
              const to = [adminEmail]; // Admin email from Firestore
              const subject = 'Package Delivered';
              const body = `${deliveryBoyName} has delivered package with ID: ${packageId} on ${new Date().toLocaleString()}`;
  
              // Use react-native-email to send email
              email(to, {
                subject: subject,
                body: body
              }).catch(console.error);
            } else {
              console.error('Delivery boy name not found.');
            }
          } else {
            console.error('Delivery boy document not found.');
          }
        } else {
          console.error('Admin email not found');
        }
      } else {
        console.error('Admin document not found');
      }
    } catch (error) {
      console.error('Error sending email:', error.message);
    }
  };

  const updatePackageStatus = async (packageId, newStatus) => {
    try {
      await firestore.collection('packages').doc(packageId).update({
        status: newStatus,
        deliveredOn: newStatus === 'DELIVERED' ? new Date() : null,
      });

      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === packageId ? { ...task, status: newStatus } : task
        )
      );

      if (newStatus === 'DELIVERED') {
        const user = auth.currentUser;
        sendEmailToAdmin(packageId, user.uid); // Send email when status is updated to DELIVERED
      }
    } catch (error) {
      console.error('Error updating package status:', error);
    }
  };

  const handleViewLocation = () => {
    navigation.navigate('ViewLocation');
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      stopLocationUpdates();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Assigned Tasks</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
        {tasks.length > 0 ? (
          tasks.map(task => (
            <View key={task.id} style={styles.taskContainer}>
              <Text style={styles.taskName}>{task.packageName || 'Unnamed Package'}</Text>
              <Text style={styles.taskStatus}>Status: {task.status}</Text>

              {task.status === 'ASSIGNED' && (
                <TouchableOpacity style={styles.button} onPress={() => updatePackageStatus(task.id, 'IN_TRANSIT')}>
                  <Text style={styles.buttonText}>Mark as In Transit</Text>
                </TouchableOpacity>
              )}

              {task.status === 'IN_TRANSIT' && (
                <TouchableOpacity style={styles.button} onPress={() => updatePackageStatus(task.id, 'DELIVERED')}>
                  <Text style={styles.buttonText}>Mark as Delivered</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <Text>No assigned tasks available.</Text>
        )}

<TouchableOpacity 
          style={styles.button} 
          onPress={() => {
            const user = auth.currentUser;
            if (user) {
              navigation.navigate('ViewLocation', { deliveryBoyId: user.uid });
            } else {
              setErrorMsg('User not logged in.');
            }
          }}
        >
          <Text style={styles.buttonText}>View Location</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#EB5B00',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: '#EB5B00',
    fontWeight: 'bold',
  },
  container: {
    padding: 20,
  },
  taskContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  taskName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskStatus: {
    fontSize: 16,
    color: '#555',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#EB5B00',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  locationButton: {
    backgroundColor: '#EB5B00',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  locationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
