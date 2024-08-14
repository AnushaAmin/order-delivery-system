import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { auth, firestore } from '../../firebase';

export default function DeliveryBoyScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchAssignedTasks = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
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
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const taskRef = firestore.collection('packages').doc(taskId);

      if (newStatus === 'DELIVERED') {
        await taskRef.update({
          status: newStatus,
          deliveredOn: new Date() // Save the delivery date
        });
      } else {
        await taskRef.update({ status: newStatus });
      }

      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus, deliveredOn: newStatus === 'DELIVERED' ? new Date() : task.deliveredOn } : task
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
      setErrorMsg('Error updating status. Please check logs for details.');
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigation.navigate('MainScreen');
    } catch (error) {
      console.error('Failed to logout:', error);
      alert('Failed to logout.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {errorMsg && <Text style={styles.errorMsg}>{errorMsg}</Text>}
        <Text style={styles.title}>Assigned Tasks</Text>
        {tasks.length > 0 ? (
          tasks.map(task => (
            <View key={task.id} style={styles.task}>
              <Text style={styles.taskText}>Package: {task.packageName}</Text>
              <Text style={styles.taskText}>Details: {task.packageDetails}</Text>
              <Text style={styles.taskText}>Status: {task.status}</Text>
              {task.status === 'ASSIGNED' && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleStatusChange(task.id, 'IN_TRANSIT')}
                >
                  <Text style={styles.buttonText}>Start Delivery</Text>
                </TouchableOpacity>
              )}
              {task.status === 'IN_TRANSIT' && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleStatusChange(task.id, 'DELIVERED')}
                >
                  <Text style={styles.buttonText}>Mark as Delivered</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <Text>No tasks assigned.</Text>
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
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start', // Center content vertically
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
  },
  errorMsg: {
    color: 'red',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  task: {
    width: '100%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  taskText: {
    fontSize: 16,
  },
  button: {
    backgroundColor: 'orange',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
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
