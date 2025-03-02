import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Image, Modal, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GeneralTemplate from '../components/GeneralTemplate';
import InputField from '../components/InputField';
import CustomModal from '../components/CustomModal';
import Button from '../components/Button';
import GeneralStyles from '../styles/GeneralStyles';
import useValidation from '../hooks/useValidation';

const ProfileScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [surname, setSurname] = useState('');
  const [nickname, setNickname] = useState('');
  const [name, setName] = useState('');
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [images, setImages] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchImages();
  }, []);

  // Obtener datos del usuario
  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get('http://192.168.0.20:8080/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const userData = response.data;
      setName(userData.name);
      setSurname(userData.surname);
      setNickname(userData.nickname);
      setEmail(userData.email);
      setSelectedImageId(userData.imageId);
      setSelectedImageUrl(userData.imageUrl);

    } catch (error) {
      console.error('Error al obtener datos del usuario', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del perfil.');
    }
  };

  // Obtener lista de imágenes disponibles
  const fetchImages = async () => {
    try {
      const response = await axios.get('http://192.168.0.20:8080/api/images/list');
      setImages(response.data);
    } catch (error) {
      console.error('Error al obtener imágenes', error);
    }
  };


  const handleProfileUpdate = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Por favor ingresa un correo electrónico válido.');
      return;
    }

    if(emailError) {
      Alert.alert('Error', 'Corrige los errores antes de continuar.');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      const updatedUser = { 
        name, 
        surname, 
        nickname, 
        email, 
        imageId: selectedImageId };

      const response = await axios.put('http://192.168.0.20:8080/api/user/update', updatedUser, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.newToken) {
        await AsyncStorage.removeItem('token');
        Alert.alert('Perfil actualizado', 'Tu email ha cambiado, por favor inicia sesión nuevamente.');
        navigation.replace('Login');

        
      } else {
        Alert.alert('Perfil actualizado', 'Tus datos han sido actualizados correctamente.');
      }

      
  
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);

        // Verificar si el backend devuelve errores específicos en formato JSON
        if (error.response && error.response.data) {
          if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
            // Si hay múltiples errores, unirlos en un solo mensaje con saltos de línea
            const errorMessage = error.response.data.errors.join('\n');
            Alert.alert('Error', errorMessage);
          } else if (typeof error.response.data === 'string') {
            // Si el backend envía un mensaje de error como string
            Alert.alert('Error', error.response.data);
          } else {
            // Mensaje genérico si no se reconoce la estructura de la respuesta
            Alert.alert('Error', 'No se pudo actualizar el perfil.');
          }
        } else {
          // Si no hay respuesta del backend (problema de conexión)
          Alert.alert('Error', 'No se pudo conectar con el servidor.');
        }
      }
    
  };

  const {emailError} = useValidation("", "", email);
  return (
    <GeneralTemplate>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={GeneralStyles.keyboardAvoiding}
      >
        <View style={GeneralStyles.innerContainer}>
          <Text style={GeneralStyles.title}>Perfil</Text>
          {/* Círculo con la imagen seleccionada y botón de selección */}
          <View style={styles.imageSelectionContainer}>
              <View style={styles.imageCircle}>
                {selectedImageUrl ? (
                  <Image source={{ uri: `http://192.168.0.20:8080/api/images/${selectedImageUrl}` }} style={styles.imageCircle} />
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
            <InputField placeholder="Correo Electrónico" value={email} onChangeText={setEmail} keyboardType="email-address"/>
            {emailError ? <Text style={GeneralStyles.errorText}>{emailError}</Text> : null}

            <Button title="Guardar Cambios" onPress={handleProfileUpdate} />
            <Button title="Cambiar Contraseña" onPress={() => navigation.navigate('ChangePassword')} />
          </View>
        </View>

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
                <Image source={{ uri: `http://192.168.0.20:8080/api/images/${image.imageUrl}` }} 
                style={styles.image} />
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
    marginTop: 10,
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
    backgroundColor: '#16CDD6',
    borderRadius: 5,
  },
  selectImageText: {
    color: '0C2527',
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

export default ProfileScreen;
