import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons'; 
import { BASE_URL } from '../config';
import GeneralTemplate from '../components/GeneralTemplate';
import InputField from '../components/InputField';
import CustomModal from '../components/CustomModal';
import Button from '../components/Button';
import ButtonCancel from '../components/ButtonCancel';
import GeneralStyles from '../styles/GeneralStyles';
import axios from 'axios';
import useValidation from '../hooks/useValidation';
import { useTranslation } from 'react-i18next';

const ChangePasswordScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  // Estados para mostrar u ocultar las contraseñas
  const [isOldPasswordVisible, setIsOldPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  // Validaciones
  const { passwordError, confirmPasswordError } = useValidation(newPassword, confirmNewPassword);

  // Validar antes de abrir el modal de confirmación
  const handleSave = () => {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      Alert.alert(t('changePassword.alerts.allFieldsRequired'));
      return;
    }

    if (passwordError || confirmPasswordError) {
      Alert.alert(t('changePassword.alerts.fixErrors'));
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert(t('changePassword.alerts.passwordsDoNotMatch'));
      return;
    }

    setModalVisible(true);
  };

  // Confirmar y guardar la nueva contraseña
  const confirmChange = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert(t('changePassword.alerts.notAuthenticated'));
        return;
      }

      const response = await axios.post(
        `${BASE_URL}/api/auth/change-password`,
      { oldPassword, newPassword, confirmNewPassword },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      Alert.alert(t('changePassword.alerts.passwordChanged'), [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);

      setModalVisible(false);
    } catch (error) {
      console.error('Error al cambiar la contraseña:', error);
      const errorMessage = error.response?.data?.error || t('changePassword.alerts.errorChangingPassword');``
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <GeneralTemplate>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={GeneralStyles.keyboardAvoiding}>
        <View style={GeneralStyles.innerContainer}>
          <Text style={GeneralStyles.title}>{t('changePassword.title')}</Text>
          <View style={GeneralStyles.formContainer}>

            {/* Contraseña Actual */}
            <View style={styles.inputContainer}>
              <InputField 
                placeholder={t('changePassword.placeholder.oldPassword')}
                value={oldPassword} 
                onChangeText={setOldPassword} 
                secureTextEntry={!isOldPasswordVisible} 
              />
              <TouchableOpacity onPress={() => setIsOldPasswordVisible(!isOldPasswordVisible)} style={styles.eyeIcon}>
                <Feather name={isOldPasswordVisible ? 'eye' : 'eye-off'} size={24} color="gray" />
              </TouchableOpacity>
            </View>

            {/* Nueva Contraseña */}
            <View style={styles.inputContainer}>
              <InputField 
                placeholder={t('changePassword.placeholder.newPassword')}
                value={newPassword} 
                onChangeText={setNewPassword} 
                secureTextEntry={!isNewPasswordVisible} 
              />
              <TouchableOpacity onPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)} style={styles.eyeIcon}>
                <Feather name={isNewPasswordVisible ? 'eye' : 'eye-off'} size={24} color="gray" />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={GeneralStyles.errorText}>{passwordError}</Text> : null}

            {/* Confirmar Nueva Contraseña */}
            <View style={styles.inputContainer}>
              <InputField 
                placeholder={t('changePassword.placeholder.confirmNewPassword')}
                value={confirmNewPassword} 
                onChangeText={setConfirmNewPassword} 
                secureTextEntry={!isConfirmPasswordVisible} 
              />
              <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} style={styles.eyeIcon}>
                <Feather name={isConfirmPasswordVisible ? 'eye' : 'eye-off'} size={24} color="gray" />
              </TouchableOpacity>
            </View>
            {confirmPasswordError ? <Text style={GeneralStyles.errorText}>{confirmPasswordError}</Text> : null}

            <Button title={t('changePassword.button.save')} onPress={handleSave} />
            <ButtonCancel title={t('changePassword.button.cancel')} onPress={() => navigation.goBack()} />
          </View>
        </View>

        <CustomModal
          visible={modalVisible}
          title={t('changePassword.modal.confirmTitle')}
          onConfirm={confirmChange}
          onCancel={() => setModalVisible(false)}
        >
          <Text>{t('changePassword.modal.confirmMessage')}</Text>
        </CustomModal>
      </KeyboardAvoidingView>
    </GeneralTemplate>
  );
};

const styles = {
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#ccc',
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
  }
};

export default ChangePasswordScreen;
