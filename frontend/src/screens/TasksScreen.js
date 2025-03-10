import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, FlatList, TextInput, Dimensions } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import GeneralTemplate from '../components/GeneralTemplate';
import GeneralStyles from '../styles/GeneralStyles';
import CustomModal from '../components/CustomModal';
import axios from 'axios';

const TasksScreen = ({ navigation }) => {
  const [taskName, setTaskName] = useState('');
  const [priority, setPriority] = useState(null);
  const [priorities, setPriorities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const screenWidth = Dimensions.get('window').width;

  const fetchPriorities = async () => {
    try {
      const response = await axios.get('http://192.168.0.12:8080/api/priorities/all');
      setPriorities(response.data);
      if (response.data.length > 0) setPriority(response.data[0]);
    } catch (error) {
      console.error('Error al obtener prioridades:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const response = await axios.get('http://192.168.0.12:8080/api/tasks/list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error al obtener tareas del usuario:', error);
    }
  };

  useEffect(() => {
    fetchPriorities();
    fetchTasks();
  }, []);

  const handleCreateTask = async () => {
    if (!taskName.trim()) return Alert.alert('Error', 'El nombre de la tarea es obligatorio');
    if (!priority) return Alert.alert('Error', 'Selecciona una prioridad');
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return Alert.alert('Error', 'No estás autenticado. Inicia sesión de nuevo.');
      await axios.post('http://192.168.0.12:8080/api/tasks/create', { name: taskName, priorityId: priority.id }, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      setTaskName('');
      setPriority(priorities[0]);
      fetchTasks();
    } catch (error) {
      console.error('Error al crear la tarea:', error);
      Alert.alert('Error', error.response?.data?.error || 'No se pudo crear la tarea');
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      await axios.put(`http://192.168.0.12:8080/api/tasks/complete/${taskId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
    } catch (error) {
      console.error('Error al marcar tarea como completada:', error);
      Alert.alert('Error', 'No se pudo marcar como completada');
    }
  };

  const handleDeleteTask = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token || !taskToDelete) return;
      await axios.delete(`http://192.168.0.12:8080/api/tasks/${taskToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteModalVisible(false);
      setTaskToDelete(null);
      fetchTasks();
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      Alert.alert('Error', 'No se pudo eliminar la tarea');
    }
  };

  const renderRightActions = (task) => (
    <TouchableOpacity onPress={() => { setTaskToDelete(task); setDeleteModalVisible(true); }} style={styles.deleteAction}>
      <Text style={styles.actionText}>Eliminar</Text>
    </TouchableOpacity>
  );

  const renderLeftActions = (task) => (
    <TouchableOpacity onPress={() => navigation.navigate('TaskDetails', { task })} style={styles.editAction}>
      <Text style={styles.actionText}>Editar</Text>
    </TouchableOpacity>
  );

  return (
    <GeneralTemplate>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={GeneralStyles.keyboardAvoiding}>
        <View style={{ flex: 1, width: screenWidth * 0.8 }}>
          <Text style={GeneralStyles.title}>Tus Tareas</Text>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={tasks}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item }) => (
              <Swipeable
                renderLeftActions={() => renderLeftActions(item)}
                renderRightActions={() => renderRightActions(item)}
              >
                <View style={[styles.taskItemContainer, { borderLeftColor: item.priority?.colorHex }]}>  
                  <TouchableOpacity onPress={() => handleCompleteTask(item.id)} style={styles.checkWrapper}>
                    <View style={styles.checkCircle}>
                      {item.status === 'COMPLETED' && (
                        <FontAwesome name="check" size={18} color="#0C2527" />
                      )}
                    </View>
                  </TouchableOpacity>
                  <Text style={styles.taskName}>{item.name}</Text>
                </View>
              </Swipeable>
            )}
          />

          <View style={styles.bottomInputContainer}>
            <TextInput placeholder="Nueva tarea" style={styles.taskInput} value={taskName} onChangeText={setTaskName} />
            <View style={styles.pickerContainer}>
              <RNPickerSelect
                onValueChange={(value) => setPriority(priorities.find(p => p.id === value))}
                items={priorities.map(p => ({ label: p.name, value: p.id, color: p.colorHex }))}
                value={priority?.id}
                style={pickerSelectStyles}
                useNativeAndroidPickerStyle={false}
                Icon={() => <Feather name="chevron-down" size={18} color="#333" />}
              />
            </View>
            <TouchableOpacity onPress={handleCreateTask} style={styles.sendButton}>
              <Feather name="plus" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <CustomModal
            visible={deleteModalVisible}
            title="¿Eliminar tarea?"
            onConfirm={handleDeleteTask}
            onCancel={() => setDeleteModalVisible(false)}
          >
            <Text>¿Estás seguro de que quieres eliminar esta tarea?</Text>
          </CustomModal>
        </View>
      </KeyboardAvoidingView>
    </GeneralTemplate>
  );
};

const styles = {
  taskItemContainer: {
    backgroundColor: '#CDF8FA',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    marginVertical: 5,
    borderRadius: 8,
    borderLeftWidth: 8,
  },
  taskName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0C2527',
    flex: 1,
  },
  bottomInputContainer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    width: '100%',
  },
  taskInput: {
    flex: 1.3,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 8,
    justifyContent: 'center',
    marginRight: 6,
  },
  sendButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 8,
  },
  checkWrapper: {
    marginRight: 12,
  },
  checkCircle: {
    width: 25,
    height: 25,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#0C2527',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteAction: {
    backgroundColor: '#FF4C4C',
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: 20,
    borderRadius: 8,
  },
  editAction: {
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 20,
    borderRadius: 8,
  },
  actionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
};

const pickerSelectStyles = {
  inputIOS: { fontSize: 14, color: '#333' },
  inputAndroid: { fontSize: 14, color: '#333' },
};

export default TasksScreen;
