import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import GeneralTemplate from '../components/GeneralTemplate';
import InputField from '../components/InputField';
import CustomModal from '../components/CustomModal';
import Button from '../components/Button';
import ButtonCancel from '../components/ButtonCancel';
import GeneralStyles from '../styles/GeneralStyles';
import axios from 'axios';
import useValidation from '../hooks/useValidation';

const ChangePasswordScreen = ({ navigation }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Estado de autenticación
  

  // Validar antes de abrir el modal de confirmación
  const handleSave = () => {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }
    
    if (passwordError || confirmPasswordError) {
        Alert.alert('Error', 'Corrige los errores antes de continuar.');
        return;
      }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    setModalVisible(true);
  };

  // Confirmar el cambio de contraseña
  const confirmChange = async () => {
    setModalVisible(false);

    try {
      const token = await AsyncStorage.getItem('token');
      setIsLoggedIn(!!token);
      if (!token) {
        Alert.alert("Error", "No estás autenticado. Inicia sesión de nuevo.");
        return;
      }

      console.log("Enviando petición con token:", token);

      const response = await axios.post(
        'http://192.168.0.12:8080/api/auth/change-password',
        {
          oldPassword,
          newPassword,
          confirmNewPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      Alert.alert('Éxito', 'Contraseña cambiada correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);

    } catch (error) {
      console.log("Error completo:", error.response ? error.response.data : error);

      const errorMessage = error.response?.data?.error || "No se pudo cambiar la contraseña";
      Alert.alert("Error", errorMessage);
    }
  };

  const {passwordError, confirmPasswordError } = useValidation(newPassword, confirmNewPassword);

  return (
    <GeneralTemplate>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={GeneralStyles.keyboardAvoiding}
      >
        <View style={GeneralStyles.innerContainer}>
          <Text style={GeneralStyles.title}>Cambiar Contraseña</Text>
          <View style={GeneralStyles.formContainer}>
            <InputField 
              placeholder="Contraseña Actual" 
              value={oldPassword} 
              onChangeText={setOldPassword} 
              secureTextEntry 
            />

            <InputField 
              placeholder="Nueva Contraseña" 
              value={newPassword} 
              onChangeText={setNewPassword} 
              secureTextEntry 
            />
            {passwordError ? <Text style={GeneralStyles.errorText}>{passwordError}</Text> : null}
            <InputField 
              placeholder="Confirmar Nueva Contraseña" 
              value={confirmNewPassword} 
              onChangeText={setConfirmNewPassword} 
              secureTextEntry 
            />
            {confirmPasswordError ? <Text style={GeneralStyles.errorText}>{confirmPasswordError}</Text> : null}
            <Button title="Guardar" onPress={handleSave} />
            <ButtonCancel title="Cancelar" onPress={() => navigation.goBack()} />
          </View>
        </View>

        <CustomModal
          visible={modalVisible}
          title="¿Estás seguro?"
          onConfirm={confirmChange}
          onCancel={() => setModalVisible(false)}
        >
          <Text>¿Estás seguro de que quieres cambiar tu contraseña?</Text>
        </CustomModal>
      </KeyboardAvoidingView>
    </GeneralTemplate>
  );
};

export default ChangePasswordScreen;
