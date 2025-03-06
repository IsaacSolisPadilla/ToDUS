import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons'; 
import GeneralTemplate from '../components/GeneralTemplate';
import InputField from '../components/InputField';
import CustomModal from '../components/CustomModal';
import Button from '../components/Button';
import GeneralStyles from '../styles/GeneralStyles';
import axios from 'axios';

const TasksScreen = ({ navigation }) => {
  const [taskName, setTaskName] = useState('');
  const [priority, setPriority] = useState(null);
  const [priorities, setPriorities] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [priorityModalVisible, setPriorityModalVisible] = useState(false);

  // Obtener la lista de prioridades desde el backend
  useEffect(() => {
    const fetchPriorities = async () => {
      try {
        const response = await axios.get('http://192.168.0.12:8080/api/priorities/all');
        setPriorities(response.data);
      } catch (error) {
        console.error('Error al obtener prioridades:', error);
      }
    };
    fetchPriorities();
  }, []);

  // Función para manejar la creación de la tarea
  const handleCreateTask = async () => {
    if (!taskName.trim()) {
      Alert.alert('Error', 'El nombre de la tarea es obligatorio');
      return;
    }
    if (!priority) {
      Alert.alert('Error', 'Selecciona una prioridad');
      return;
    }
    setModalVisible(true);
  };

  // Confirmar creación de tarea
  const confirmCreateTask = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'No estás autenticado. Inicia sesión de nuevo.');
        return;
      }

      const response = await axios.post(
        'http://192.168.0.12:8080/api/tasks/create',
        { name: taskName, priorityId: priority.id },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      Alert.alert('Éxito', 'Tarea creada correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);

      setModalVisible(false);
      setTaskName('');
      setPriority(null);
    } catch (error) {
      console.error('Error al crear la tarea:', error);
      const errorMessage = error.response?.data?.error || 'No se pudo crear la tarea';
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <GeneralTemplate>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={GeneralStyles.keyboardAvoiding}>
        <View style={GeneralStyles.innerContainer}>
          <Text style={GeneralStyles.title}>Nueva Tarea</Text>
          <View style={GeneralStyles.formContainer}>

            {/* Input para el nombre de la tarea */}
            <InputField 
              placeholder="Nombre de la tarea" 
              value={taskName} 
              onChangeText={setTaskName} 
            />

            {/* Input de Prioridad */}
            <TouchableOpacity onPress={() => setPriorityModalVisible(true)} style={[styles.priorityInput, priority && { borderColor: priority.color }]}>
              <Text style={[styles.priorityText, { color: priority ? priority.color : '#999' }]}>
                {priority ? priority.name : 'Selecciona una prioridad'}
              </Text>
              <Feather name="chevron-down" size={24} color={priority ? priority.color : '#999'} />
            </TouchableOpacity>

            {/* Botón para agregar la tarea */}
            <TouchableOpacity onPress={handleCreateTask} style={styles.addButton}>
              <Feather name="plus" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Modal de confirmación */}
        <CustomModal
          visible={modalVisible}
          title="¿Crear esta tarea?"
          onConfirm={confirmCreateTask}
          onCancel={() => setModalVisible(false)}
        >
          <Text>¿Estás seguro de que quieres agregar esta tarea?</Text>
        </CustomModal>

        {/* Modal para seleccionar prioridad */}
        <Modal visible={priorityModalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecciona una Prioridad</Text>
              <FlatList
                data={priorities}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[styles.priorityOption, { backgroundColor: item.color }]} 
                    onPress={() => {
                      setPriority(item);
                      setPriorityModalVisible(false);
                    }}
                  >
                    <Text style={styles.priorityOptionText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </GeneralTemplate>
  );
};

const styles = {
  priorityInput: {
    marginTop: 15,
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: '#ccc',
  },
  priorityText: {
    fontSize: 16,
  },
  addButton: {
    marginTop: 20,
    backgroundColor: '#007BFF',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  priorityOption: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  priorityOptionText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
};

export default TasksScreen;
