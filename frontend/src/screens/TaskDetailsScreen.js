import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, TouchableOpacity, StyleSheet } from 'react-native';
import GeneralTemplate from '../components/GeneralTemplate';
import GeneralStyles from '../styles/GeneralStyles';
import InputField from '../components/InputField';
import Button from '../components/Button';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomModal from '../components/CustomModal';

const TaskDetailScreen = ({ route, navigation }) => {
  const { task } = route.params;

  const [name, setName] = useState(task.name);
  const [dueDate, setDueDate] = useState(task.dueDate || new Date().toISOString());
  const [description, setDescription] = useState(task.description || '');
  const [priorityName, setPriorityName] = useState(task.priority?.name || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date(dueDate));

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
    if (Platform.OS === 'android') {
      setShowDatePicker(false); // cerrar el modal en Android
    }
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const confirmDate = () => {
    setDueDate(tempDate.toISOString());
    setShowDatePicker(false);
  };

  return (
    <GeneralTemplate>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={GeneralStyles.keyboardAvoiding}
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

            <InputField 
              label="Prioridad" 
              value={priorityName} 
              onChangeText={setPriorityName}
              editable={true}
            />

            <InputField
              label="Fecha de creación"
              value={formatDatePretty(task.dateCreated)}
              editable={false}
            />

            {/* Campo Fecha de vencimiento con selector */}
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
                modalWidth="90%" // Ajusta el ancho del modal
              >
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  onChange={onChangeDate}
                  style={{ backgroundColor: '#CDF8FA' }}
                  textColor='#084F52'
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

            <Button title="Volver" onPress={() => navigation.goBack()} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </GeneralTemplate>
  );
};


export default TaskDetailScreen;