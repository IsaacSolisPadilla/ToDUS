import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Image, Modal, ScrollView } from 'react-native';
import GeneralTemplate from '../components/GeneralTemplate';
import InputField from '../components/InputField';
import CustomModal from '../components/CustomModal';
import useValidation from '../hooks/useValidation';
import Button from '../components/Button';
import axios from 'axios';
import GeneralStyles from '../styles/GeneralStyles';

const RegisterScreen = ({ navigation }) => {
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
  const [error, setError] = useState('');

  // Obtener la lista de imágenes desde el backend
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get('http://192.168.0.12:8080/api/images/list');
        setImages(response.data);
      } catch (error) {
        console.error('Error al obtener imágenes', error);
      }
    };

    fetchImages();
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
        throw new Error('Las contraseñas no coinciden');
      }
  
      if (!selectedImageId) {
        throw new Error('Debes seleccionar una imagen');
      }
  
      if (!name || !surname || !nickname || !email || !password || !confirmPassword) {
        throw new Error('Debes completar todos los campos');
      }

      if(emailError || passwordError || confirmPasswordError){
        throw new Error('Corrige los errores antes de continuar.');
      }
  
      const response = await fetch('http://192.168.0.12:8080/api/auth/register', {
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
        throw new Error(data.message || 'No se pudo completar el registro');
      }
  
      Alert.alert('Registro exitoso', 'Tu cuenta ha sido creada con éxito. Inicia sesión para continuar.');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error en el registro:', error);
      Alert.alert('Error', error.message || 'No se pudo completar el registro');
    }
  };

  const { emailError, passwordError, confirmPasswordError } = useValidation(password, confirmPassword, email);
  
  return (
    <GeneralTemplate>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={GeneralStyles.keyboardAvoiding}
      >
        <View style={GeneralStyles.innerContainer}>
          <Text style={GeneralStyles.title}>Registrate</Text>
          {/* Círculo con la imagen seleccionada y botón de selección */}
          <View style={styles.imageSelectionContainer}>
              <View style={styles.imageCircle}>
                {selectedImageUrl ? (
                  <Image source={{ uri: `http://192.168.0.12:8080/api/images/${selectedImageUrl}` }} style={styles.imageCircle} />
                ) : (
                  <Text style={styles.imagePlaceholder}>?</Text>
                )}
              </View>
              <TouchableOpacity style={styles.selectImageButton} onPress={() => setModalVisible(true)}>
                <Text style={styles.selectImageText}>Seleccionar Imagen</Text>
              </TouchableOpacity>
            </View>
          <View style={GeneralStyles.formContainer}>
            <InputField placeholder="Nombre" value={name} onChangeText={setName} />
            <InputField placeholder="Apellido" value={surname} onChangeText={setSurname} />
            <InputField placeholder="Nombre de Usuario" value={nickname} onChangeText={setNickname} />

            <InputField placeholder="Correo Electrónico" value={email} onChangeText={setEmail}  keyboardType="email-address"/>
            {emailError ? <Text style={GeneralStyles.errorText}>{emailError}</Text> : null}

            <InputField placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />
            {passwordError ? <Text style={GeneralStyles.errorText}>{passwordError}</Text> : null}

            <InputField placeholder="Confirmar Contraseña" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
            {confirmPasswordError ? <Text style={GeneralStyles.errorText}>{confirmPasswordError}</Text> : null}

            <Button title="Ingresar" onPress={handleRegister} />
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={GeneralStyles.link}>Tienes cuenta, Iniciar Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
          {/* Usamos el modal reutilizable */}
        <CustomModal
          visible={modalVisible}
          title="Elige un icono"
          onConfirm={() => setModalVisible(false)}
          onCancel={() => setModalVisible(false)}
          showCancel={false}
          >
          <View horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
            {images.map((image) => (
              <TouchableOpacity
                key={image.id}
                onPress={() => {
                  setSelectedImageId(image.id)
                  setSelectedImageUrl(image.imageUrl)
                }}
                style={[
                  styles.imageOption,
                  selectedImageId === image.id ? styles.selectedImage : {},
                ]}
                >
                <Image source={{ uri: `http://192.168.0.12:8080/api/images/${image.imageUrl}` }} style={styles.image} />
              </TouchableOpacity>
            ))}
          </View>
        </CustomModal>
      </KeyboardAvoidingView>
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
    backgroundColor: '#ccc',
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
