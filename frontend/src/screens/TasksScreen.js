import React, { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Alert, KeyboardAvoidingView, TouchableOpacity, FlatList, TextInput, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BASE_URL } from '../config';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import GeneralTemplate from '../components/GeneralTemplate';
import GeneralStyles from '../styles/GeneralStyles';
import CustomModal from '../components/CustomModal';
import axios from 'axios';

const TasksScreen = ({ navigation, route }) => {
  const selectedCategory = route?.params?.category || null;

  const [taskName, setTaskName] = useState('');
  const [priority, setPriority] = useState(null);
  const [priorities, setPriorities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showPriorityOptions, setShowPriorityOptions] = useState(false);

  // Estado para controlar la visibilidad de las tareas completadas en una categoría
  const [showCompletedTasks, setShowCompletedTasks] = useState(
    selectedCategory && typeof selectedCategory.showComplete !== 'undefined'
      ? selectedCategory.showComplete
      : false
  );

  const screenWidth = Dimensions.get('window').width;
  const swipeableRefs = useRef({});

  // Si cambia la categoría, actualizamos el estado de mostrar completadas (solo para categoría)
  useEffect(() => {
    if (selectedCategory && typeof selectedCategory.showComplete !== 'undefined') {
      setShowCompletedTasks(selectedCategory.showComplete);
    }
  }, [selectedCategory]);

  const fetchPriorities = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/priorities/all`);
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
      const response = await axios.get(`${BASE_URL}/api/tasks/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filtramos las tareas para que no se muestren las que están en papelera
      let filteredTasks = response.data.filter(t => !t.trashed);
      // Si hay una categoría seleccionada, filtramos por esa categoría
      if (selectedCategory) {
        filteredTasks = filteredTasks.filter((t) => t.category?.id === selectedCategory.id);
      }
      
      // Aplicar orden según la categoría (si aplica)
      if (selectedCategory && selectedCategory.orderTasks) {
        switch (selectedCategory.orderTasks) {
          case 'DATE_CREATED':
            filteredTasks.sort((a, b) => new Date(a.dateCreated) - new Date(b.dateCreated));
            break;
          case 'DUE_DATE':
            filteredTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
            break;
          case 'PRIORITY_ASC':
            filteredTasks.sort((a, b) => a.priority.level - b.priority.level);
            break;
          case 'PRIORITY_DES':
            filteredTasks.sort((a, b) => b.priority.level - a.priority.level);
            break;
          case 'NAME_ASC':
            filteredTasks.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case 'NAME_DES':
            filteredTasks.sort((a, b) => b.name.localeCompare(a.name));
            break;
          default:
            break;
        }
      }
      setTasks(filteredTasks);
    } catch (error) {
      console.error('Error al obtener tareas del usuario:', error);
    }
  };

  useEffect(() => {
    fetchPriorities();
    fetchTasks();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [selectedCategory])
  );

  const handleCreateTask = async () => {
    if (!taskName.trim()) return Alert.alert('Error', 'El nombre de la tarea es obligatorio');
    if (!priority) return Alert.alert('Error', 'Selecciona una prioridad');
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return Alert.alert('Error', 'No estás autenticado. Inicia sesión de nuevo.');
      const requestData = {
        name: taskName,
        priorityId: priority.id,
        ...(selectedCategory && selectedCategory.id ? { categoryId: selectedCategory.id } : {})
      };
      await axios.post(`${BASE_URL}/api/tasks/create`, requestData, {
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

  // Si el input está vacío, redirige a la pantalla de papelera
  const handleAddButtonPress = () => {
    if (taskName.trim() === '') {
      navigation.navigate("TrashTasks", { category: selectedCategory });
    } else {
      handleCreateTask();
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      await axios.put(`${BASE_URL}/api/tasks/complete/${taskId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
    } catch (error) {
      console.error('Error al marcar tarea como completada:', error);
      Alert.alert('Error', 'No se pudo marcar como completada');
    }
  };

  // Para mover a papelera o eliminar definitivamente
  const handleTrashOrDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      if (!taskToDelete.trashed) {
        await axios.put(`${BASE_URL}/api/tasks/trash/${taskToDelete.id}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.delete(`${BASE_URL}/api/tasks/${taskToDelete.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setDeleteModalVisible(false);
      setTaskToDelete(null);
      fetchTasks();
    } catch (error) {
      console.error('Error al procesar la eliminación de la tarea:', error);
      Alert.alert('Error', 'No se pudo procesar la eliminación de la tarea');
    }
  };

  const renderTaskItem = ({ item }) => (
    <Swipeable
      ref={(ref) => {
        if (ref && item.id) swipeableRefs.current[item.id] = ref;
      }}
      renderLeftActions={() => (
        <View style={styles.leftAction}>
          <Text style={styles.actionText}>Editar</Text>
        </View>
      )}
      renderRightActions={() => (
        <View style={styles.rightAction}>
          <Text style={styles.actionText}>
            {item.trashed ? 'Eliminar permanentemente' : 'Mover a papelera'}
          </Text>
        </View>
      )}
      onSwipeableOpen={(direction) => {
        swipeableRefs.current[item.id]?.close();
        if (direction === 'left') {
          navigation.navigate('TaskDetails', { task: item });
        } else if (direction === 'right') {
          setTaskToDelete(item);
          setDeleteModalVisible(true);
        }
      }}
    >
      <View style={[styles.taskItemContainer, { borderLeftColor: item.priority?.colorHex, flexDirection: 'row', justifyContent: 'space-between' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity onPress={() => handleCompleteTask(item.id)} style={styles.checkWrapper}>
            <View style={styles.checkCircle}>
              {item.status === 'COMPLETED' && (
                <FontAwesome name="check" size={18} color="#0C2527" />
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.taskName}>{item.name}</Text>
        </View>
      </View>
    </Swipeable>
  );

  // Si no hay categoría seleccionada (Vista "Tus Tareas"), mostramos todas las tasks
  // Si hay categoría, se aplica la lógica del interruptor
  let dataToRender = [];
  if (!selectedCategory) {
    dataToRender = tasks;
  } else {
    dataToRender = showCompletedTasks ? [...tasks] : tasks.filter(task => task.status !== 'COMPLETED');
  }

  return (
    <GeneralTemplate>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={GeneralStyles.title}>
          {selectedCategory ? selectedCategory.name : 'Tus Tareas'}
        </Text>
        {/* Mostrar el ícono del ojo solo si hay categoría y showComplete es false */}
        {selectedCategory && selectedCategory.showComplete === false && (
          <TouchableOpacity onPress={() => setShowCompletedTasks(!showCompletedTasks)}>
            <Feather name={showCompletedTasks ? 'eye-off' : 'eye'} size={24} color="#CDF8FA" />
          </TouchableOpacity>
        )}
      </View>
      <KeyboardAvoidingView style={GeneralStyles.keyboardAvoiding}>
        <View style={{ flex: 1, width: screenWidth * 0.8 }}>
          <FlatList
            data={dataToRender}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderTaskItem}
          />

          {/* Input para nueva tarea */}
          <View style={styles.bottomInputContainer}>
            <TextInput 
              placeholder="Nueva tarea" 
              style={styles.taskInput} 
              value={taskName} 
              onChangeText={setTaskName} 
            />
            <View style={styles.customDropdownContainer}>
              <TouchableOpacity onPress={() => setShowPriorityOptions(!showPriorityOptions)} style={styles.selectedPriorityBox}>
                <Text style={[styles.selectedPriorityText, { color: priority?.colorHex }]}>
                  {priority ? priority.name : 'Selecciona prioridad'}
                </Text>
                <Feather name={showPriorityOptions ? 'chevron-up' : 'chevron-down'} size={18} color="#333" />
              </TouchableOpacity>
              {showPriorityOptions && (
                <View style={styles.dropdownOptionsListAbove}>
                  {priorities.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      onPress={() => {
                        setPriority(p);
                        setShowPriorityOptions(false);
                      }}
                      style={styles.priorityOption}
                    >
                      <Text style={[styles.priorityOptionText, { color: p.colorHex }]}>● {p.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            <TouchableOpacity onPress={handleAddButtonPress} style={styles.sendButton}>
              {taskName.trim() === '' ? (
                <Feather name="trash" size={15} color="white" />
              ) : (
                <Feather name="plus" size={15} color="white" />
              )}
            </TouchableOpacity>
          </View>

          <CustomModal
            visible={deleteModalVisible}
            title={taskToDelete && taskToDelete.trashed ? "Eliminar permanentemente" : "Mover a papelera"}
            onConfirm={handleTrashOrDeleteTask}
            onCancel={() => setDeleteModalVisible(false)}
          >
            <Text>
              {taskToDelete && taskToDelete.trashed 
                ? "¿Estás seguro de que deseas eliminar permanentemente esta tarea?" 
                : "¿Estás seguro de que deseas mover esta tarea a la papelera?"}
            </Text>
          </CustomModal>
        </View>
      </KeyboardAvoidingView>
    </GeneralTemplate>
  );
};

const styles = {
  taskItemContainer: {
    backgroundColor: '#CDF8FA',
    padding: 20,
    marginVertical: 5,
    borderRadius: 8,
    borderLeftWidth: 10,
  },
  taskName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0C2527',
    flex: 1,
  },
  taskStatusInfo: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#084F52',
    marginLeft: 8,
    alignSelf: 'center',
    textAlign: 'right',
    maxWidth: 90,
  },
  bottomInputContainer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CDF8FA',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#ccc',
    width: '100%',
    borderRadius: 10,
    marginBottom: 25,
  },
  taskInput: {
    flex: 1.3,
    backgroundColor: 'transparent',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
    fontSize: 16,
    color: '#0C2527',
  },
  customDropdownContainer: {
    flex: 1,
    position: 'relative',
    marginRight: 6,
  },
  selectedPriorityBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selectedPriorityText: {
    fontSize: 16,
    flex: 1,
  },
  dropdownOptionsListAbove: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#CDF8FA',
    borderRadius: 8,
    elevation: 3,
    zIndex: 10,
    marginBottom: 4,
  },
  priorityOption: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  priorityOptionText: {
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#084F52',
    padding: 12,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
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
  leftAction: {
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    paddingHorizontal: 20,
    flex: 1,
    borderRadius: 8,
  },
  rightAction: {
    backgroundColor: '#FF4C4C',
    justifyContent: 'center',
    paddingHorizontal: 20,
    flex: 1,
    borderRadius: 8,
  },
  actionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
};

export default TasksScreen;
