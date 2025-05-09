import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import GeneralTemplate from '../components/GeneralTemplate';
import GeneralStyles from '../styles/GeneralStyles';
import InputField from '../components/InputField';
import Button from '../components/Button';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomModal from '../components/CustomModal';
import { BASE_URL } from '../config';
import { useTranslation } from 'react-i18next';
import LoadingOverlay from '../components/LoadingOverlay';
import logo from '../../assets/icono.png';

const TaskDetailScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { task } = route.params;

  const [name, setName] = useState(task.name);
  const [dueDate, setDueDate] = useState(task.dueDate);
  const [description, setDescription] = useState(task.description || '');
  const [priorityName, setPriorityName] = useState(task.priority?.name || '');
  const [priorityId, setPriorityId] = useState(task.priority?.id || null);
  const [priorities, setPriorities] = useState([]);
  const [showPriorityOptions, setShowPriorityOptions] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(dueDate ? new Date(dueDate) : new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        await fetchPriorities();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  const fetchPriorities = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/priorities/by-user`,{
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setPriorities(response.data);
    } catch (error) {
      console.error('Error al obtener prioridades:', error);
    }
  };

  const handleAutoSave = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      await axios.put(`${BASE_URL}/api/tasks/update/${task.id}`, {
        name,
        description,
        dueDate,
        priorityId
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      navigation.setParams({ shouldRefresh: true });
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      Alert.alert('Error', t('taskDetail.errorSave'));
    }
  };

  const formatDatePretty = (isoDateString) => {
    if (!isoDateString) return '';
    const date = new Date(isoDateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const onChangeDate = (event, selectedDate) => {
    if (!selectedDate) {
      if (Platform.OS === 'android') setShowDatePicker(false);
      return;
    }
  
    setTempDate(selectedDate);
  
    if (Platform.OS === 'android') {
      setDueDate(selectedDate.toISOString());
      setShowDatePicker(false);
    }
  };

  const confirmDate = () => {
    setDueDate(tempDate.toISOString());
    setShowDatePicker(false);
  };

  const handleGoBack = async () => {
    const hasChanges =
      name !== task.name ||
      description !== (task.description || '') ||
      dueDate !== task.dueDate ||
      priorityId !== task.priority?.id;

    if (hasChanges) {
      await handleAutoSave();
    }

    navigation.goBack();
  };

  if (loading) {
    return (
      <LoadingOverlay
        visible
        text={t('taskDetail.loading')}
        logoSource={logo}
      />
    );
  }

  return (
    <GeneralTemplate>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={GeneralStyles.keyboardAvoiding}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={GeneralStyles.innerContainer}>
            <Text style={GeneralStyles.title}>{t('taskDetail.title')}</Text>

            <View style={GeneralStyles.formContainer}>
              <InputField
                label={t('taskDetail.labelName')}
                value={name}
                onChangeText={setName}
                editable={true}
              />

              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#CDF8FA', marginBottom: 4, marginLeft: 4 }}>
                  Prioridad
                </Text>
                <TouchableOpacity
                  onPress={() => setShowPriorityOptions(!showPriorityOptions)}
                  style={{
                    width: 300,
                    height: 50,
                    paddingHorizontal: 10,
                    paddingVertical: 12,
                    marginVertical: 10,
                    borderWidth: 1,
                    borderColor: '#084F52',
                    borderRadius: 8,
                    backgroundColor: '#CDF8FA',
                    justifyContent: 'center'
                  }}
                >
                  <Text style={{ fontSize: 16, color: priorityId ? '#0C2527' : '#777' }}>
                    {priorityName || t('taskDetail.placeholderSelectPriority')}
                  </Text>
                </TouchableOpacity>

                {showPriorityOptions && (
                  <View
                    style={{
                      backgroundColor: '#CDF8FA',
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: '#ccc',
                      marginTop: -10,
                      marginBottom: 10,
                      overflow: 'hidden'
                    }}
                  >
                    {priorities.map((p) => (
                      <TouchableOpacity
                        key={p.id}
                        onPress={() => {
                          setPriorityName(p.name);
                          setPriorityId(p.id);
                          setShowPriorityOptions(false);
                        }}
                        style={{ paddingVertical: 10, paddingHorizontal: 12 }}
                      >
                        <Text style={{ fontSize: 16, color: p.colorHex }}>{p.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <InputField
                label={t('taskDetail.labelDateCreated')}
                value={formatDatePretty(task.dateCreated)}
                editable={false}
              />

              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <View pointerEvents="none">
                  <InputField
                    label={t('taskDetail.labelDueDate')}
                    value={formatDatePretty(dueDate)}
                    editable={false}
                  />
                </View>
              </TouchableOpacity>

              {Platform.OS === 'ios' && (
                <CustomModal
                  visible={showDatePicker}
                  title={t('taskDetail.modalSelectDate')}
                  onConfirm={confirmDate}
                  onCancel={() => setShowDatePicker(false)}
                  modalWidth="90%"
                >
                  <DateTimePicker
                    value={tempDate}
                    mode="date"
                    display="spinner"
                    onChange={onChangeDate}
                    style={{ backgroundColor: '#CDF8FA' }}
                    textColor="#084F52"
                  />
                </CustomModal>
              )}

              {Platform.OS === 'android' && showDatePicker && (
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                />
              )}

              <InputField
                label={t('taskDetail.labelDescription')}
                value={description}
                onChangeText={setDescription}
                editable={true}
              />

              <Button title={t('taskDetail.buttonSave')} onPress={handleGoBack} />
              
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GeneralTemplate>
  );
};

export default TaskDetailScreen;
