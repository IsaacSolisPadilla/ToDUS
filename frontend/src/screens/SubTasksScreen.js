import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Dimensions,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../config';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import GeneralTemplate from '../components/GeneralTemplate';
import GeneralStyles from '../styles/GeneralStyles';
import InputField from '../components/InputField';
import { useTranslation } from 'react-i18next';

const SubTasksScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { task } = route.params;
  const [subTasks, setSubTasks] = useState([]);
  const [subTaskName, setSubTaskName] = useState('');
  const [editingSubTaskId, setEditingSubTaskId] = useState(null);
  const [editingSubTaskName, setEditingSubTaskName] = useState('');
  const [editingSubTaskStatus, setEditingSubTaskStatus] = useState(null);
  // New state to track bottom input focus
  const [bottomInputFocused, setBottomInputFocused] = useState(false);

  const MAX_TITLE_CHARS = 7;
  const displayTitle =
    task.name.length > MAX_TITLE_CHARS
      ? task.name.slice(0, MAX_TITLE_CHARS) + '…'
      : task.name;
  const swipeableRefs = useRef({});

  const fetchSubTasks = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(
        `${BASE_URL}/api/subtasks/task/${task.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubTasks(response.data);
    } catch (error) {
      console.error(t('subtasks.errorCreate'), error);
    }
  };

  useEffect(() => {
    fetchSubTasks();
  }, []);

  const handleCreateSubTask = async () => {
    if (!subTaskName.trim()) {
      return Alert.alert('Error', t('subtasks.errorRequired'));
    }
    try {
      const token = await AsyncStorage.getItem('token');
      const requestData = { name: subTaskName, status: 'PENDENT' };
      await axios.post(
        `${BASE_URL}/api/subtasks/create/${task.id}`,
        requestData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      setSubTaskName('');
      fetchSubTasks();
    } catch (error) {
      console.error(t('subtasks.errorCreate'), error);
      Alert.alert('Error', error.response?.data || t('subtasks.errorCreate'));
    }
  };

  const handleToggleCompleteSubTask = async id => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(
        `${BASE_URL}/api/subtasks/complete/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchSubTasks();
    } catch (error) {
      console.error(t('subtasks.errorUpdate'), error);
      Alert.alert('Error', t('subtasks.errorUpdate'));
    }
  };

  const handleDeleteSubTask = async id => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(
        `${BASE_URL}/api/subtasks/delete/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchSubTasks();
    } catch (error) {
      console.error(t('subtasks.errorDelete'), error);
      Alert.alert('Error', t('subtasks.errorDelete'));
    }
  };

  const handleUpdateSubTask = async id => {
    if (!editingSubTaskName.trim()) {
      Alert.alert('Error', t('subtasks.emptyName'));
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(
        `${BASE_URL}/api/subtasks/update/${id}`,
        { name: editingSubTaskName, status: editingSubTaskStatus },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      setEditingSubTaskId(null);
      setEditingSubTaskName('');
      fetchSubTasks();
    } catch (error) {
      console.error(t('subtasks.errorUpdate'), error);
      Alert.alert('Error', t('subtasks.errorUpdate'));
    }
  };

  const renderSubTask = ({ item }) => (
    <Swipeable
      activeOffsetX={[-30, 30]}
      failOffsetY={[-15, 15]}
      ref={ref => { if (ref) swipeableRefs.current[item.id] = ref; }}
      renderRightActions={() => (
        <View style={GeneralStyles.rightAction}>
          <Text style={styles.actionText}>{t('subtasks.actionDelete')}</Text>
        </View>
      )}
      onSwipeableOpen={() => {
        swipeableRefs.current[item.id]?.close();
        handleDeleteSubTask(item.id);
      }}
    >
      <View style={styles.subTaskItem}>
        <TouchableOpacity onPress={() => handleToggleCompleteSubTask(item.id)} style={styles.checkWrapper}>
          <View style={styles.checkCircle}>
            {item.status === 'COMPLETED' && <FontAwesome name="check" size={18} color="#0C2527" />}
          </View>
        </TouchableOpacity>
        {editingSubTaskId === item.id ? (
          <TextInput
            style={styles.editingSubTaskInput}
            value={editingSubTaskName}
            onChangeText={setEditingSubTaskName}
            onSubmitEditing={() => handleUpdateSubTask(item.id)}
            onBlur={() => handleUpdateSubTask(item.id)}
            autoFocus
          />
        ) : (
          <TouchableOpacity
            onPress={() => {
              setEditingSubTaskId(item.id);
              setEditingSubTaskName(item.name);
              setEditingSubTaskStatus(item.status);
            }}
            onLongPress={() => {
              setEditingSubTaskId(item.id);
              setEditingSubTaskName(item.name);
              setEditingSubTaskStatus(item.status);
            }}
            style={{ flex: 1 }}
          >
            <Text style={styles.subTaskName}>{item.name}</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.subTaskStatus}>{item.status}</Text>
      </View>
    </Swipeable>
  );

  return (
    <GeneralTemplate>
      <KeyboardAvoidingView
        style={GeneralStyles.keyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : (bottomInputFocused ? 'padding' : '')}
      >
        <View style={styles.container}>
          <Text style={[GeneralStyles.title, { flexShrink: 1 }]} numberOfLines={1} ellipsizeMode="tail">
            {displayTitle}
          </Text>

          <InputField label={t('subtasks.labelName')} value={task.name} editable={false} />
          <InputField label={t('subtasks.labelDescription')} value={task.description} editable={false} />

          <Text style={styles.subTaskTitle}>{t('subtasks.subtasksTitle')}</Text>

          {subTasks.length === 0 ? (
            <Text style={styles.noSubTasks}>{t('subtasks.noSubtasks')}</Text>
          ) : (
            <FlatList
              data={subTasks}
              keyExtractor={item => item.id.toString()}
              renderItem={renderSubTask}
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 80 }}
              showsVerticalScrollIndicator={false}
            />
          )}

          <View style={styles.bottomInputContainer}>
            <TextInput
              placeholder={t('subtasks.placeholderNew')}
              style={styles.subTaskInput}
              value={subTaskName}
              onChangeText={setSubTaskName}
              onFocus={() => setBottomInputFocused(true)}
              onBlur={() => setBottomInputFocused(false)}
            />
            <TouchableOpacity onPress={handleCreateSubTask} style={styles.sendButton}>
              <Feather name="plus" size={15} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </GeneralTemplate>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    keyboardAvoiding: {
      flex: 1,
      width: '100%',
    },
    taskDetailsBox: {
      backgroundColor: '#f0f0f0',
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
    },
    taskDetailName: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    taskDetailDescription: {
      fontSize: 16,
      color: '#333',
      marginTop: 4,
    },
    subTaskTitle: {
      fontSize: 42,
      fontWeight: 'bold',
      color: '#CDF8FA',
      marginBottom: 30,
      marginTop: 30,
      textAlign: 'center',
    },
    noSubTasks: {
      fontSize: 16,
      fontStyle: 'italic',
      color: 'gray',
      marginBottom: 16,
    },
    subTaskItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#CDF8FA',
      padding: 12,
      marginVertical: 5,
      borderRadius: 8,
      marginBottom: 8,
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
    subTaskName: {
      fontSize: 16,
      fontWeight: '600',
      flex: 1,
    },
    subTaskStatus: {
      fontSize: 14,
      color: 'gray',
    },
    editingSubTaskInput: {
      flex: 1,
      fontSize: 16,
      borderBottomWidth: 1,
      borderColor: '#084F52',
      padding: 4,
    },
    bottomInputContainer: {
      position: 'absolute',
      bottom: 0,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#CDF8FA',
      padding: 12,
      borderTopWidth: 1,
      marginTop: 20,
      borderColor: '#ccc',
      width: '100%',
      borderRadius: 10,
      marginBottom: 25,
    },
    subTaskInput: {
      flex: 1,
      backgroundColor: 'transparent',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      marginRight: 6,
      fontSize: 16,
      color: '#0C2527',
    },
    sendButton: {
      backgroundColor: '#084F52',
      padding: 12,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
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
  });

export default SubTasksScreen;
