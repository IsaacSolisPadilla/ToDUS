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
import { useTranslation } from 'react-i18next';
import { NativeViewGestureHandler } from 'react-native-gesture-handler';

const TrashTasksScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { category } = route.params;
  const listRef = useRef(null);
  const [trashedTasks, setTrashedTasks] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteAllModalVisible, setDeleteAllModalVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const swipeableRefs = useRef({});
  const screenWidth = Dimensions.get('window').width;

  const getRetentionDays = async () => {
    const stored = await AsyncStorage.getItem('trashRetentionDays');
    const days = parseInt(stored, 10);
    return (isNaN(days) || days < 1) ? 7 : days;
  };

  const fetchTrashedTasks = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const url = category?.id
        ? `${BASE_URL}/api/tasks/trash?categoryId=${category.id}`
        : `${BASE_URL}/api/tasks/trash`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const retentionDays = await getRetentionDays();
      const cutoff = new Date(Date.now() - retentionDays * 24*60*60*1000);

      const stillInTrash = [];
      await Promise.all(response.data.map(async t => {
        if (t.dateTrashed) {
          const trashedAt = new Date(t.dateTrashed);
          if (trashedAt < cutoff) {
            try {
              await axios.delete(`${BASE_URL}/api/tasks/${t.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
            } catch (err) {
              console.warn(`No se pudo auto-eliminar tarea ${t.id}`, err);
            }
            return;
          }
        }
        stillInTrash.push(t);
      }));

      setTrashedTasks(stillInTrash);
    } catch (error) {
      console.error('Error cargando papelera:', error);
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

  const handleRecoverTask = async id => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      await axios.put(`${BASE_URL}/api/tasks/restore/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTrashedTasks();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', t('trash.recoverTasks'));
    }
  };

  const handleDeletePermanently = async () => {
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
    } catch (e) {
      console.error(e);
      Alert.alert('Error', t('trash.deleteTasks'));
    }
  };

  const handleDeleteAll = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const params = category?.id ? { categoryId: category.id } : {};
      await axios.post(`${BASE_URL}/api/tasks/trash/deleteAll`, null, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTrashedTasks();
      setDeleteAllModalVisible(false);
      Alert.alert(t('trash.emptyTrashSuccess'));
    } catch (e) {
      console.error(e);
      Alert.alert('Error', t('trash.emptyTrash'));
    }
  };

  const renderLeftActions = () => (
    <View style={GeneralStyles.leftAction}>
      <Text style={styles.actionText}>{t('trash.recover')}</Text>
    </View>
  );
  const renderRightActions = () => (
    <View style={GeneralStyles.rightAction}>
      <Text style={styles.actionText}>{t('trash.emptyAll')}</Text>
    </View>
  );

  return (
    <GeneralTemplate>
      <Text style={GeneralStyles.title}>
        {category
          ? `${t('trash.title')}: ${category.name}`
          : t('trash.title')}
      </Text>
      <View style={{ flex: 1, width: screenWidth * 0.8, alignSelf: 'center' }}>
        {/* Envolvemos la lista para permitir gestos simultáneos */}
        <NativeViewGestureHandler ref={listRef} disallowInterruption>
          <FlatList
            ref={ref => (listRef.current = ref)}
            data={trashedTasks}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <Swipeable
                ref={ref => (swipeableRefs.current[item.id] = ref)}
                simultaneousHandlers={listRef}
                activeOffsetX={[-30, 30]}
                failOffsetY={[-15, 15]}
                renderLeftActions={renderLeftActions}
                renderRightActions={renderRightActions}
                onSwipeableOpen={dir => {
                  swipeableRefs.current[item.id]?.close();
                  if (dir === 'left') {
                    handleRecoverTask(item.id);
                  } else {
                    setTaskToDelete(item);
                    setDeleteModalVisible(true);
                  }
                }}
              >
                <TouchableOpacity
                >
                <View
                  style={[
                    styles.taskItemContainer,
                    { borderLeftColor: item.priority?.colorHex },
                  ]}
                >
                  <Text style={styles.taskName}>{item.name}</Text>
                  <Text style={styles.taskStatusInfo}>
                    {t('trash.inTrash')}
                  </Text>
                </View>
                </TouchableOpacity>
              </Swipeable>
            )}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingBottom: screenWidth * 0.5,
              flexGrow: 1,
            }}
          />
        </NativeViewGestureHandler>
  
        <TouchableOpacity
          style={styles.deleteAllButton}
          onPress={() => setDeleteAllModalVisible(true)}
        >
          <Feather name="trash-2" size={20} color="#fff" />
          <Text style={styles.deleteAllText}>{t('trash.emptyAll')}</Text>
        </TouchableOpacity>
  
        <CustomModal
          visible={deleteModalVisible}
          title={t('trash.delete')}
          onConfirm={handleDeletePermanently}
          onCancel={() => setDeleteModalVisible(false)}
        >
          <Text>{t('trash.confirmDelete')}</Text>
        </CustomModal>
        <CustomModal
          visible={deleteAllModalVisible}
          title={t('trash.emptyAll')}
          onConfirm={handleDeleteAll}
          onCancel={() => setDeleteAllModalVisible(false)}
        >
          <Text>{t('trash.confirmEmptyAll')}</Text>
        </CustomModal>
      </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskName: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#721C24' 
  },
  taskStatusInfo: { 
    fontSize: 12, 
    fontStyle: 'italic', 
    color: '#721C24' 
  },
  actionText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  deleteAllButton: {
    backgroundColor: '#C8494B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginVertical: 20,
  },
  deleteAllText: { 
    color: 'white', 
    fontSize: 16, 
    marginLeft: 8 
  },
};

export default TrashTasksScreen;
