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

const TaskDetailScreen = ({ route, navigation }) => {
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

  useEffect(() => {
    fetchPriorities();
  }, []);

  const fetchPriorities = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/priorities/all`);
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
      Alert.alert('Error', 'No se pudo guardar la tarea');
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
      setDueDate(selectedDate.toISOString()); // aquí actualizamos directamente
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
            <Text style={GeneralStyles.title}>Tarea</Text>

            <View style={GeneralStyles.formContainer}>
              <InputField
                label="Nombre de la tarea"
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
                    {priorityName || 'Selecciona prioridad'}
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
                label="Fecha de creación"
                value={formatDatePretty(task.dateCreated)}
                editable={false}
              />

              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <View pointerEvents="none">
                  <InputField
                    label="Fecha de vencimiento"
                    value={formatDatePretty(dueDate)}
                    editable={false}
                  />
                </View>
              </TouchableOpacity>

              {Platform.OS === 'ios' && (
                <CustomModal
                  visible={showDatePicker}
                  title="Seleccionar Fecha"
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
                label="Descripción"
                value={description}
                onChangeText={setDescription}
                editable={true}
              />

              <Button title="Guardar" onPress={handleGoBack} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GeneralTemplate>
  );
};

export default TaskDetailScreen;
