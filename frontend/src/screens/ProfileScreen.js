import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Image, Modal, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GeneralTemplate from '../components/GeneralTemplate';
import InputField from '../components/InputField';
import Button from '../components/Button';

const ProfileScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
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
      const response = await axios.get('http://192.168.0.12:8080/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const userData = response.data;
      setName(userData.name);
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
      const response = await axios.get('http://192.168.0.12:8080/api/images/list');
      setImages(response.data);
    } catch (error) {
      console.error('Error al obtener imágenes', error);
    }
  };


  const handleProfileUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const updatedUser = { name, email, imageId: selectedImageId };
      const response = await axios.put('http://192.168.0.12:8080/api/user/update', updatedUser, {
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
      Alert.alert('Error', 'No se pudo actualizar el perfil.');
    }
  };
  

  return (
    <GeneralTemplate>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={styles.keyboardAvoiding}
      >
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Perfil</Text>
          <View style={styles.formContainer}>
            <InputField placeholder="Nombre" value={name} onChangeText={setName} />
            <InputField placeholder="Correo Electrónico" value={email} onChangeText={setEmail}/>

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

            <Button title="Guardar Cambios" onPress={handleProfileUpdate} />
          </View>
        </View>

        {/* Modal para seleccionar imagen */}
        <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Elige un icono</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                {images.map((image) => (
                  <TouchableOpacity
                    key={image.id}
                    onPress={() => {
                      setSelectedImageId(image.id);
                      setSelectedImageUrl(image.imageUrl);
                      setModalVisible(false);
                    }}
                    style={[
                      styles.imageOption,
                      selectedImageId === image.id ? styles.selectedImage : {},
                    ]}
                  >
                    <Image source={{ uri: `http://192.168.0.12:8080/api/images/${image.imageUrl}` }} style={styles.image} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </GeneralTemplate>
  );
};

const styles = StyleSheet.create({
  keyboardAvoiding: {
    flex: 1,
    width: '100%',
  },
  innerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 30,
    marginTop: 100,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 50,
    marginTop: 50,
  },
  link: {
    color: 'white',
    marginTop: 10,
  },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  imageScroll: {
    flexDirection: 'row',
    marginVertical: 10,
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
  closeButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: 'red',
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
