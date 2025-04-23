import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Image, ScrollView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { BASE_URL } from '../config';
import GeneralTemplate from '../components/GeneralTemplate';
import InputField from '../components/InputField';
import CustomModal from '../components/CustomModal';
import useValidation from '../hooks/useValidation';
import Button from '../components/Button';
import axios from 'axios';
import GeneralStyles from '../styles/GeneralStyles';
import { useTranslation } from 'react-i18next';

const RegisterScreen = ({ navigation }) => {
  const [ t ] = useTranslation();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [nickname, setNickname] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [password, setPassword] = useState('');
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [images, setImages] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Obtener la lista de imágenes desde el backend
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/images/list/USER`);
        setImages(response.data);
      } catch (error) {
        console.error(t('register.errorImage'), error);
      }
    };

    fetchImages();
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const userData = {
    name,
    surname,
    nickname,
    email,
    password,
    imageId: selectedImageId,
  };


  const handleRegister = async () => {
    try {
      if (password !== confirmPassword) {
        throw new Error(t('register.errorPasswordMismatch'));
      }
  
      if (!selectedImageId) {
        throw new Error(t('register.errorSelectImage'));
      }
  
      if (!name || !surname || !nickname || !email || !password || !confirmPassword) {
        throw new Error(t('register.errorFillFields'));
      }

      if(emailError || passwordError || confirmPasswordError){
        throw new Error(t('register.errorCorrectErrors'));
      }
  
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        // Si el backend devuelve una lista de errores, mostramos el primero o todos
        if (data.errors && Array.isArray(data.errors)) {
          throw new Error(data.errors.join('\n')); // Muestra todos los errores separados por saltos de línea
        }
        throw new Error(data.message || t('register.errorGeneric'));
      }
  
      Alert.alert(t('register.success'), t('register.successMessage'));
      navigation.navigate('Login');
    } catch (error) {
      console.error(t('register.errorRegister'), error);
      Alert.alert('Error', error.message || t('register.errorGeneric'));
    }
  };

  const { emailError, passwordError, confirmPasswordError } = useValidation(password, confirmPassword, email);
  
  return (
    <GeneralTemplate>
      <TouchableWithoutFeedback onPress={() => { if (!isKeyboardVisible) Keyboard.dismiss(); }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
          style={GeneralStyles.keyboardAvoiding}
        >
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1 }} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >            
          <View style={GeneralStyles.innerContainer}>
              <Text style={GeneralStyles.title}>{t('register.title')}</Text>
              {/* Círculo con la imagen seleccionada y botón de selección */}
              <View style={styles.imageSelectionContainer}>
                <View style={styles.imageCircle}>
                  {selectedImageUrl ? (
                    <Image source={{ uri: `${BASE_URL}/api/images/${selectedImageUrl}` }} style={styles.imageCircle} />
                  ) : (
                    <Text style={styles.imagePlaceholder}>?</Text>
                  )}
                </View>
                <TouchableOpacity style={styles.selectImageButton} onPress={() => setModalVisible(true)}>
                  <Text style={styles.selectImageText}>{t('register.selectImage')}</Text>
                </TouchableOpacity>
              </View>
              <View style={GeneralStyles.formContainer}>
                <InputField placeholder={t('register.firstName')} value={name} onChangeText={setName} />
                <InputField placeholder={t('register.surname')} value={surname} onChangeText={setSurname} />
                <InputField placeholder={t('register.nickname')} value={nickname} onChangeText={setNickname} />

                <InputField placeholder="Correo Electrónico" value={email} onChangeText={setEmail} keyboardType="email-address" />
                {emailError ? <Text style={GeneralStyles.errorText}>{emailError}</Text> : null}

                <InputField placeholder={t('register.email')} value={password} onChangeText={setPassword} secureTextEntry />
                {passwordError ? <Text style={GeneralStyles.errorText}>{passwordError}</Text> : null}

                <InputField placeholder={t('register.password')} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
                {confirmPasswordError ? <Text style={GeneralStyles.errorText}>{confirmPasswordError}</Text> : null}

                <Button title={t('register.registerButton')} onPress={handleRegister} />
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={GeneralStyles.link}>{t('register.haveAccount')}</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* Usamos el modal reutilizable */}
            <CustomModal
          visible={modalVisible}
          title={t('register.modalTitle')}
          onConfirm={() => setModalVisible(false)}
          onCancel={() => setModalVisible(false)}
          showCancel={false}
          >
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
            {images.map((image) => (
              <TouchableOpacity
                key={image.id}
                onPress={() => {
                  setSelectedImageId(image.id);
                  setSelectedImageUrl(image.imageUrl);
                }}
                style={[
                  styles.imageOption,
                  selectedImageId === image.id ? styles.selectedImage : {},
                ]}
              >
                <Image
                  source={{ uri: `${BASE_URL}/api/images/${image.imageUrl}` }}
                  style={styles.image}
                />
              </TouchableOpacity>
            ))}
          </View>
        </CustomModal>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </GeneralTemplate>
  );
};

const styles = StyleSheet.create({
  imageSelectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  imageCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(12, 37, 39, 1)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imagePlaceholder: {
    fontSize: 24,
    color: '#666',
  },
  selectImageButton: {
    marginLeft: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  selectImageText: {
    color: 'white',
    fontWeight: 'bold',
  },
  imageOption: {
    marginHorizontal: 5,
    padding: 5,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedImage: {
    borderColor: 'blue',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
});

export default RegisterScreen;