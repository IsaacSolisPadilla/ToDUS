import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Image, ScrollView } from 'react-native';
import { BASE_URL } from '../config';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GeneralTemplate from '../components/GeneralTemplate';
import InputField from '../components/InputField';
import CustomModal from '../components/CustomModal';
import Button from '../components/Button';
import GeneralStyles from '../styles/GeneralStyles';
import useValidation from '../hooks/useValidation';
import { useTranslation } from 'react-i18next'; // Importa el hook useTranslation
import LoadingOverlay from '../components/LoadingOverlay';
import logo from '../../assets/icono.png';


const ProfileScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [surname, setSurname] = useState('');
  const [nickname, setNickname] = useState('');
  const [name, setName] = useState('');
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [images, setImages] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const {emailError} = useValidation("", "", email);


  // Obtener datos del usuario
  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/user/profile`, {
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
      console.error(err);
      Alert.alert(t('profile.errorTitle'), t('profile.loadError'));    }
  };

  // Obtener lista de imágenes disponibles
  const fetchImages = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/images/list/USER`);
      setImages(response.data);
    } catch (error) {
      console.error('Error al obtener imágenes', error);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        await fetchUserData();
        await fetchImages();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  if (loading) {
    return (
      <LoadingOverlay
        visible
        text={t('profile.loading')}
        logoSource={logo}
      />
    );
  }


  const handleProfileUpdate = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      Alert.alert(t('profile.errorTitle'), t('profile.invalidEmail'));
      return;
    }

    if(emailError) {
      Alert.alert(t('profile.errorTitle'), t('profile.correctErrors'));
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

      const response = await axios.put(`${BASE_URL}/api/user/update`, updatedUser, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.newToken) {
        await AsyncStorage.removeItem('token');
        Alert.alert(t('profile.updatedTitle'), t('profile.updatedEmailPrompt'));
        navigation.replace('Login');

        
      } else {
        Alert.alert(t('profile.updatedTitle'), t('profile.updatedSuccess'));
      }
    } catch (error) {
      console.error(t('profile.loadError'), error);

        if (error.response && error.response.data) {
          if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
            const errorMessage = error.response.data.errors.join('\n');
            Alert.alert('Error', errorMessage);
          } else if (typeof error.response.data === 'string') {
            Alert.alert('Error', error.response.data);
          } else {
            Alert.alert('Error', t('profile.updateError'));
          }
        } else {
          Alert.alert('Error', t('profile.connectionError'));
        }
      }
  };

  

  return (
    <GeneralTemplate>
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
          <Text style={GeneralStyles.title}>{t('profile.title')}</Text>
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
                <Text style={styles.selectImageText}>{t('profile.chooseIcon')}</Text>
              </TouchableOpacity>
          </View>

          <View style={GeneralStyles.formContainer}>
            <InputField label = {t('profile.firstNamePlaceholder')} placeholder={t('profile.firstNamePlaceholder')} value={name} onChangeText={setName} />
            <InputField label = {t('profile.surnamePlaceholder')} placeholder={t('profile.surnamePlaceholder')} value={surname} onChangeText={setSurname} />
            <InputField label = {t('profile.nicknamePlaceholder')} placeholder={t('profile.nicknamePlaceholder')} value={nickname} onChangeText={setNickname} />
            <InputField label = {t('profile.emailPlaceholder')} placeholder={t('profile.emailPlaceholder')} value={email} onChangeText={setEmail} keyboardType="email-address"/>
            {emailError ? <Text style={GeneralStyles.errorText}>{emailError}</Text> : null}

            <Button title={t('profile.saveChanges')} onPress={handleProfileUpdate} />
            <Button title={t('profile.changePassword')} onPress={() => navigation.navigate('ChangePassword')} />
          </View>
        </View>

        <CustomModal
          visible={modalVisible}
          title={t('profile.chooseIcon')}
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
