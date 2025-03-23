import React, { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Alert, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BASE_URL } from '../config';
import { Feather } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import GeneralTemplate from '../components/GeneralTemplate';
import GeneralStyles from '../styles/GeneralStyles';
import CustomModal from '../components/CustomModal';
import axios from 'axios';

const TrashTasksScreen = ({ navigation, route }) => {
  const { category } = route.params; // Puede ser null o tener datos
  const [trashedTasks, setTrashedTasks] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const screenWidth = Dimensions.get('window').width;
  const swipeableRefs = useRef({});

  const fetchTrashedTasks = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const url = category && category.id 
        ? `${BASE_URL}/api/tasks/trash?categoryId=${category.id}` 
        : `${BASE_URL}/api/tasks/trash`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrashedTasks(response.data);
    } catch (error) {
      console.error('Error al obtener tareas en la papelera:', error);
    }
  };

  useEffect(() => {
    fetchTrashedTasks();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTrashedTasks();
    }, [category])
  );

  // Recuperar la tarea (swipe a la derecha)
  const handleRecoverTask = async (taskId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      await axios.put(`${BASE_URL}/api/tasks/restore/${taskId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTrashedTasks();
    } catch (error) {
      console.error('Error al recuperar la tarea:', error);
      Alert.alert('Error', 'No se pudo recuperar la tarea');
    }
  };

  // Eliminación definitiva (swipe a la izquierda con confirmación)
  const handleDeleteTaskPermanently = async () => {
    if (!taskToDelete) return;
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      await axios.delete(`${BASE_URL}/api/tasks/${taskToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteModalVisible(false);
      setTaskToDelete(null);
      fetchTrashedTasks();
    } catch (error) {
      console.error('Error al eliminar permanentemente la tarea:', error);
      Alert.alert('Error', 'No se pudo eliminar la tarea');
    }
  };

  const renderLeftActions = (item) => (
    <View style={styles.leftAction}>
      <Text style={styles.actionText}>Recuperar</Text>
    </View>
  );

  const renderRightActions = (item) => (
    <View style={styles.rightAction}>
      <Text style={styles.actionText}>Eliminar</Text>
    </View>
  );

  return (
    <GeneralTemplate>
      <View>
        <Text style={GeneralStyles.title}>
          {category ? `Papelera: ${category.name}` : 'Papelera'}
        </Text>
      </View>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={trashedTasks}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: screenWidth * 0.5 }}
        renderItem={({ item }) => (
          <Swipeable
            ref={(ref) => {
              if (ref && item.id) swipeableRefs.current[item.id] = ref;
            }}
            renderLeftActions={() => renderLeftActions(item)}
            renderRightActions={() => renderRightActions(item)}
            onSwipeableOpen={(direction) => {
              swipeableRefs.current[item.id]?.close();
              if (direction === 'left') {
                handleRecoverTask(item.id);
              } else if (direction === 'right') {
                // Swipe izquierda: mostrar modal para eliminar definitivamente
                setTaskToDelete(item);
                setDeleteModalVisible(true);
              }
            }}
          >
            <View style={[styles.taskItemContainer, { borderLeftColor: item.priority?.colorHex }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Text style={styles.taskName}>{item.name}</Text>
              </View>
              <Text style={styles.taskStatusInfo}>En Papelera</Text>
            </View>
          </Swipeable>
        )}
      />
      <CustomModal
        visible={deleteModalVisible}
        title="Eliminar permanentemente"
        onConfirm={handleDeleteTaskPermanently}
        onCancel={() => setDeleteModalVisible(false)}
      >
        <Text>¿Estás seguro de que deseas eliminar permanentemente esta tarea?</Text>
      </CustomModal>
    </GeneralTemplate>
  );
};

const styles = {
  taskItemContainer: {
    backgroundColor: '#F8D7DA',
    padding: 20,
    marginVertical: 5,
    borderRadius: 8,
    borderLeftWidth: 10,
  },
  taskName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#721C24',
    flex: 1,
  },
  taskStatusInfo: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#721C24',
    marginLeft: 8,
    alignSelf: 'center',
    textAlign: 'right',
    maxWidth: 90,
  },
  leftAction: {
    backgroundColor: '#28A745',
    justifyContent: 'center',
    paddingHorizontal: 20,
    flex: 1,
    borderRadius: 8,
  },
  rightAction: {
    backgroundColor: '#DC3545',
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

export default TrashTasksScreen;
