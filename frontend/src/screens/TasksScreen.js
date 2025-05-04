import React, { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  View, 
  Text, 
  Alert, 
  KeyboardAvoidingView, 
  TouchableOpacity, 
  TextInput, 
  Dimensions, 
  Platform, 
  BackHandler,
  SectionList,
  StyleSheet
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BASE_URL } from '../config';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import GeneralTemplate from '../components/GeneralTemplate';
import GeneralStyles from '../styles/GeneralStyles';
import CustomModal from '../components/CustomModal';
import axios from 'axios';
import * as Notifications from 'expo-notifications';
import { useTranslation } from 'react-i18next';
import LoadingOverlay from '../components/LoadingOverlay';
import logo from '../../assets/icono.png';

const TasksScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const handleBackPress = () => true; // Bloquea el retroceso

  const selectedCategory = route?.params?.category || null;

  const [taskName, setTaskName] = useState('');
  const [priority, setPriority] = useState(null);
  const [priorities, setPriorities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showPriorityOptions, setShowPriorityOptions] = useState(false);
  const [showCompletedTasks, setShowCompletedTasks] = useState(
    selectedCategory && typeof selectedCategory.showComplete !== 'undefined'
      ? selectedCategory.showComplete
      : false
  );
  const [mainCategories, setMainCategories] = useState([]);
  const [rules, setRules] = useState([]);

  const screenWidth = Dimensions.get('window').width;
  const swipeableRefs = useRef({});

  const [notifyOnPriorityChange, setNotifyOnPriorityChange] = useState(false);
  const [notifyDueReminders, setNotifyDueReminders] = useState(false);
  const [dueReminderDays, setDueReminderDays] = useState(1);
  const [loading, setLoading] = useState(true);

  // load notification prefs once
  useEffect(() => {
    (async () => {
      const a = await AsyncStorage.getItem('notifyOnPriorityChange');
      const b = await AsyncStorage.getItem('notifyDueReminders');
      const c = await AsyncStorage.getItem('dueReminderDays');
      if (a !== null) setNotifyOnPriorityChange(a === 'true');
      if (b !== null) setNotifyDueReminders(b === 'true');
      if (c !== null) setDueReminderDays(parseInt(c, 10));
    })();
  }, []);

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

      // 1) traer todo
      const { data: all } = await axios.get(
        `${BASE_URL}/api/tasks/list`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const now = new Date();

      // 2) auto‑trash caducadas
      for (const t of all) {
        if (
          t.status === 'COMPLETED' &&
          t.category?.autoDeleteComplete &&
          t.completedAt
        ) {
          const completedAt = new Date(t.completedAt);
          const days = t.category.deleteCompleteDays ?? 0;
          const cutoff = new Date(now - days * 86400e3);
          if (completedAt < cutoff) {
            try {
              await axios.put(
                `${BASE_URL}/api/tasks/trash/${t.id}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
              );
            } catch (err) {
              console.warn('Auto‑trash failed for', t.id, err);
            }
          }
        }
      }

      // 2.1) auto‑prioridad + notificación
      const rulesJson = await AsyncStorage.getItem('priorityRules');
      const loadedRules = rulesJson ? JSON.parse(rulesJson) : [];
      setRules(loadedRules);

      for (const t of all) {
        if (!t.trashed && t.dueDate && t.priority?.id != null) {
          const due = new Date(t.dueDate);
          const daysLeft = (due - now) / 86400e3;
          const rule = loadedRules.find(r =>
            r.fromId === t.priority.id && daysLeft <= r.days
          );
          if (rule) {
            // old/new priority names
            const oldP = priorities.find(p => p.id === rule.fromId);
            const newP = priorities.find(p => p.id === rule.toId);

            try {
              await axios.put(
                `${BASE_URL}/api/tasks/update/${t.id}`,
                {
                  name: t.name,
                  description: t.description,
                  dueDate: t.dueDate,
                  priorityId: rule.toId,
                  categoryId: t.category?.id
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                }
              );
              if (notifyOnPriorityChange && oldP && newP) {
                await Notifications.scheduleNotificationAsync({
                  content: {
                    title: t('tasks.notificationPriorityChangedTitle'),
                    body: t('tasks.notificationPriorityChangedBody', {
                      name: t.name, old: oldP.name, new: newP.name
                    })
                },
                  trigger: null
                });
              }
            } catch (err) {
              console.warn('Auto‑priority failed for', t.id, err);
            }
          }
        }
      }

      // 3) refrescar lista
      const { data: fresh } = await axios.get(
        `${BASE_URL}/api/tasks/list`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      let filtered = fresh.filter(t => !t.trashed);

      // 4) filtrar por categoría
      if (selectedCategory) {
        filtered = filtered.filter(t => t.category?.id === selectedCategory.id);
      }

      // 5) orden
      if (selectedCategory?.orderTasks) {
        switch (selectedCategory.orderTasks) {
          case 'DATE_CREATED':
            filtered.sort((a, b) => new Date(a.dateCreated) - new Date(b.dateCreated));
            break;
          case 'DUE_DATE':
            filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
            break;
          case 'PRIORITY_ASC':
            filtered.sort((a, b) => a.priority.level - b.priority.level);
            break;
          case 'PRIORITY_DES':
            filtered.sort((a, b) => b.priority.level - a.priority.level);
            break;
          case 'NAME_ASC':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case 'NAME_DES':
            filtered.sort((a, b) => b.name.localeCompare(a.name));
            break;
        }
      }

      setTasks(filtered);

      // 6) due reminders
      if (notifyDueReminders) {
        filtered.forEach(async t => {
          if (t.dueDate) {
            const due = new Date(t.dueDate);
            const daysLeft = Math.ceil((due - now) / 86400e3);
            if (daysLeft === dueReminderDays) {
              await Notifications.scheduleNotificationAsync({
                content: {
                    title: t('tasks.notificationDueTitle'),
                    body: t('tasks.notificationDueBody', {
                      days: daysLeft,
                      name: t.name
                  })
                },
                trigger: null
              });
            }
          }
        });
      }
    } catch (e) {
      console.error('Error fetching tasks:', e);
    }
  };

  const fetchMainCategories = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/categories/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cats = await Promise.all(
        response.data.map(async (cat) => {
          const stored = await AsyncStorage.getItem(`showCategory_${cat.id}`);
          return { ...cat, showOnMain: stored === 'true' };
        })
      );
      const mainCats = cats.filter(cat => cat.showOnMain);
      setMainCategories(mainCats);
    } catch (error) {
      console.error('Error al obtener categorías para pantalla principal:', error);
    }
  };

  const fetchRules = async () => {
    const json = await AsyncStorage.getItem('priorityRules');
    if (json) setRules(JSON.parse(json));
  };

  useEffect(() => {
    // Captura la suscripción
    const backHandlerSub = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );
  
    const initialize = async () => {
      try {
        setLoading(true);
        await fetchPriorities();
        await fetchTasks();
        await fetchRules();
        await fetchMainCategories();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
  
    initialize();
    return () => backHandlerSub.remove();
  }, [selectedCategory]);

  useFocusEffect(useCallback(() => {
    fetchTasks();
  }, [selectedCategory]));

  if (loading) {
    return (
      <LoadingOverlay
        visible
        text={t('statsScreen.loading')}
        logoSource={logo}
      />
    );
  }

  const handleCreateTask = async () => {
    if (!taskName.trim()) return Alert.alert(t('tasks.error'), t('tasks.nameRequired'));
    if (!priority) return Alert.alert(t('tasks.error'), t('tasks.selectPriority'));
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return Alert.alert(t('tasks.error'), t('tasks.notAuthenticated'));
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
      Alert.alert('Error', error.response?.data?.error || t('tasks.creationError'));
    }
  };

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
      Alert.alert(t('tasks.error'), t('tasks.markCompleteError'));
    }
  };

  const handleTrashTask = async (taskId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      await axios.put(`${BASE_URL}/api/tasks/trash/${taskId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
    } catch (error) {
      console.error('Error al mover la tarea a la papelera:', error);
      Alert.alert(t('tasks.error'), t('tasks.trashError'));
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      await axios.delete(`${BASE_URL}/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
    } catch (error) {
      console.error('Error al eliminar permanentemente la tarea:', error);
      Alert.alert(t('tasks.error'), t('tasks.deleteError'));
    }
  };

  const handleTrashOrDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      if (!taskToDelete.trashed) {
        handleTrashTask(taskToDelete.id);
      } else {
        handleDeleteTask(taskToDelete.id);
        setDeleteModalVisible(true);
      }
      setTaskToDelete(null);
    } catch (error) {
      console.error('Error al procesar la eliminación de la tarea:', error);
      Alert.alert(t('tasks.error'), t('tasks.processDeleteError'));
    }
  };

  const handleTaskPress = (task) => {
    navigation.navigate('SubTasks', { task });
  };

  const getTaskStatusInfo = (item) => {
    const today = new Date();
    const dueDate = item.dueDate ? new Date(item.dueDate) : null;
    if (!dueDate) return '';
    const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    const completedDate = new Date();

    if (item.status === 'COMPLETED') {
      if (completedDate < dueDate) {
        const earlyDays = Math.floor((dueDate - completedDate) / (1000 * 60 * 60 * 24));
        return `✔ ${earlyDays} ${t('tasks.earlyDays')}`;
      } else if (completedDate > dueDate) {
        const lateDays = Math.floor((completedDate - dueDate) / (1000 * 60 * 60 * 24));
        return `✔ ${lateDays} ${t('tasks.lateDays')}`;
      } else {
        return `✔ ${t('tasks.onTime')}`;
      }
    } else {
      if (diffDays < 0)   return `⚠️ ${t('tasks.overdue')}`;
      if (diffDays === 0) return `⚠️ ${t('tasks.expiresToday')}`;
      if (diffDays > 0 && diffDays <= 7) {
        // ⏳ 5 days remaining
        return `⏳ ${diffDays} ${t('tasks.daysRemaining')}`;
      }
      return '';
    }
  };

  const renderTaskItem = ({ item }) => (
    <Swipeable
      activeOffsetX={[-10, 10]}
      ref={(ref) => {
        if (ref && item.id) swipeableRefs.current[item.id] = ref;
      }}
      renderLeftActions={() => (
        <View style={styles.leftAction}>
          <Text style={styles.actionText}>{t('tasks.actionEdit')}</Text>
        </View>
      )}
      renderRightActions={() => (
        <View style={styles.rightAction}>
          <Text style={styles.actionText}>
            {item.trashed ? t('tasks.modalTitleDelete') : t('tasks.actionMoveTrash')}
          </Text>
        </View>
      )}
      onSwipeableOpen={(direction) => {
        swipeableRefs.current[item.id]?.close();
        if (direction === 'left') {
          navigation.navigate('TaskDetails', { task: item });
        } else if (direction === 'right') {
          handleTrashTask(item.id);
        }
      }}
    >
      <TouchableOpacity onPress={() => handleTaskPress(item)}>
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
          <Text style={styles.taskStatusInfo}>{getTaskStatusInfo(item)}</Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  const filteredTasks = selectedCategory
  ? (showCompletedTasks
      ? tasks
      : tasks.filter(t => t.status !== 'COMPLETED'))
  : tasks;

// 2) Saca los IDs de las categorías ancladas:
const mainCatIds = mainCategories.map(cat => cat.id);

// 3) Las tareas “globales” son las que NO pertenecen a ninguna anclada:
const globalTasks = filteredTasks.filter(
  t => !t.category || !mainCatIds.includes(t.category.id)
);

// 4) Monta las secciones:
let sections = [];
if (selectedCategory) {
  // Vista de categoría: sólo una sección, con tus tasks filtradas
  sections = [
    { title: selectedCategory.name, data: filteredTasks }
  ];
} else {
  // Vista global:
  //   A) “Todas las tareas” ← sólo globalTasks
  sections.push({
    title: t('tasks.sectionAllTasks'),
    data: globalTasks
  });
  //   B) Una sección para cada categoría anclada SI tiene tareas
  mainCategories.forEach(cat => {
    const catTasks = filteredTasks.filter(t => t.category?.id === cat.id);
    if (catTasks.length > 0) {
      sections.push({ title: cat.name, data: catTasks });
    }
  });
}
    

  return (
    <GeneralTemplate>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text style={GeneralStyles.title}>
          { selectedCategory ? selectedCategory.name : t('tasks.sectionAllTasks') }
      </Text>

      {/* ojo sólo en vista de categoría */}
      { selectedCategory && typeof selectedCategory.showComplete !== 'undefined' && (
        <TouchableOpacity onPress={() => setShowCompletedTasks(!showCompletedTasks)}>
          <Feather
            name={showCompletedTasks ? 'eye-off' : 'eye'}
            size={24}
            color="#CDF8FA"
          />
        </TouchableOpacity>
      )}
      </View>
      <KeyboardAvoidingView
        style={GeneralStyles.keyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : ''}
      >
        <View style={{ flex: 1, width: screenWidth * 0.8 }}>
        <SectionList
          sections={sections}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => renderTaskItem({ item })}
          renderSectionHeader={({ section: { title } }) => {
            if (selectedCategory) return null;
            if (title === t('tasks.sectionAllTasks')) return null;
            return (
              <Text style={[GeneralStyles.title, styles.sectionHeader]}>
                {title}
              </Text>
            );
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />

          <View style={styles.bottomInputContainer}>
            <TextInput
              placeholder={t('tasks.placeholderNewTask')}
              style={styles.taskInput}
              value={taskName}
              onChangeText={setTaskName}
            />
            <View style={styles.customDropdownContainer}>
              <TouchableOpacity
                onPress={() => setShowPriorityOptions(!showPriorityOptions)}
                style={styles.selectedPriorityBox}
              >
                <Text style={[styles.selectedPriorityText, { color: priority?.colorHex }]}>
                  {priority ? priority.name : t('tasks.noPriority')}
                </Text>
                <Feather
                  name={showPriorityOptions ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="#333"
                />
              </TouchableOpacity>
              {showPriorityOptions && (
                <View style={styles.dropdownOptionsListAbove}>
                  {priorities.map(p => (
                    <TouchableOpacity
                      key={p.id}
                      onPress={() => {
                        setPriority(p);
                        setShowPriorityOptions(false);
                      }}
                      style={styles.priorityOption}
                    >
                      <Text style={[styles.priorityOptionText, { color: p.colorHex }]}>
                        ● {p.name}
                      </Text>
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
    width: 30,
    height: 30,
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
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    flex: 1,
    borderRadius: 8,
  },
  actionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  categoryTasksSection: {
    marginTop: 20,
  },
  categorySectionTitle: {
    fontSize: 18,
    color: '#084F52',
    fontWeight: '600',
    marginBottom: 10,
  }
};

export default TasksScreen;
