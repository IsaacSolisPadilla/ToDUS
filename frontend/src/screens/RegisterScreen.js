import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Image, Modal, ScrollView } from 'react-native';
import GeneralTemplate from '../components/GeneralTemplate';
import InputField from '../components/InputField';
import Button from '../components/Button';
import axios from 'axios';

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
      const response = await fetch('http://192.168.0.12:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'No se pudo completar el registro');
      }
      if (password !== confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      if(!selectedImageId) {
        throw new Error('Debes seleccionar una imagen');
      }
      if(!name || !surname || !nickname || !email || !password || !confirmPassword) {
        throw new Error('Debes completar todos los campos');
      }
  
      Alert.alert('Registro exitoso', 'Tu cuenta ha sido creada con éxito. Inicia sesión para continuar.');
      navigation.navigate('Login'); // Redirigir a la pantalla de inicio de sesión
    } catch (error) {
      console.error('Error en el registro:', error);
      Alert.alert('Error', error.message || 'No se pudo completar el registro');
    }
  };

  return (
    <GeneralTemplate>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={styles.keyboardAvoiding}
      >
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Registrate</Text>
          <View style={styles.formContainer}>
            <InputField placeholder="Nombre" value={name} onChangeText={setName} />
            <InputField placeholder="Apellido" value={surname} onChangeText={setSurname} />
            <InputField placeholder="Nombre de Usuario" value={nickname} onChangeText={setNickname} />
            <InputField placeholder="Correo Electrónico" value={email} onChangeText={setEmail} />
            <InputField placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />
            <InputField placeholder="Confirmar Contraseña" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

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

            <Button title="Ingresar" onPress={handleRegister} />
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>Tienes cuenta, Iniciar Sesión</Text>
            </TouchableOpacity>
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
                    console.log(image.imageUrl)
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

export default RegisterScreen;
