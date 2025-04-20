import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  StyleSheet,
  Switch,
  Keyboard,
  InputAccessoryView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../config';
import GeneralTemplate from '../components/GeneralTemplate';
import GeneralStyles from '../styles/GeneralStyles';
import CustomModal from '../components/CustomModal';
import Button from '../components/Button';
import InputField from '../components/InputField';

const CategoryScreen = ({ route, navigation }) => {
  const { category } = route.params || {};
  const isEditMode = !!category;

  // estados existentes
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [orderTasks, setOrderTasks] = useState('PRIORITY_ASC');
  const [imageId, setImageId] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [studyMethodId, setStudyMethodId] = useState(null);
  const [showComplete, setShowComplete] = useState(false);

  // nuevos estados para auto‑borrar completadas
  const [autoDeleteComplete, setAutoDeleteComplete] = useState(false);
  const [deleteCompleteDays, setDeleteCompleteDays] = useState('7');

  // imágenes y modal
  const [modalVisible, setModalVisible] = useState(false);
  const [images, setImages] = useState([]);
  const [showOrderOptions, setShowOrderOptions] = useState(false);

  // ID para InputAccessoryView
  const accessoryViewID = 'deleteDaysAccessory';

  const orderOptions = [
    { label: 'Fecha de creación', value: 'DATE_CREATED' },
    { label: 'Fecha de vencimiento', value: 'DUE_DATE' },
    { label: 'Prioridad (asc)', value: 'PRIORITY_ASC' },
    { label: 'Prioridad (desc)', value: 'PRIORITY_DES' },
    { label: 'Nombre (A-Z)', value: 'NAME_ASC' },
    { label: 'Nombre (Z-A)', value: 'NAME_DES' },
  ];

  useEffect(() => {
    fetchImages();
    if (isEditMode) {
      setName(category.name || '');
      setDescription(category.description || '');
      setOrderTasks(category.orderTasks || 'PRIORITY_ASC');
      setImageId(category.image?.id || null);
      setImageUrl(category.image?.imageUrl || null);
      setStudyMethodId(category.studyMethod?.id || null);
      setShowComplete(category.showComplete || false);

      // rellenar nuevos campos
      setAutoDeleteComplete(category.autoDeleteComplete || false);
      setDeleteCompleteDays(
        category.deleteCompleteDays != null
          ? String(category.deleteCompleteDays)
          : '7'
      );
    }
  }, []);

  const fetchImages = async () => {
    try {
      const resp = await axios.get(`${BASE_URL}/api/images/list/CATEGORY`);
      setImages(resp.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert('Error', 'El nombre es obligatorio');
    if (!imageId) return Alert.alert('Error', 'Debes seleccionar una imagen');

    // validar días
    if (autoDeleteComplete) {
      const n = parseInt(deleteCompleteDays, 10);
      if (isNaN(n) || n < 1) {
        return Alert.alert('Error', 'Introduce un número válido de días (>=1)');
      }
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const body = {
        name,
        description,
        orderTasks,
        imageId,
        studyMethodId,
        showComplete,
        autoDeleteComplete,
        deleteCompleteDays: autoDeleteComplete
          ? parseInt(deleteCompleteDays, 10)
          : null,
      };

      if (isEditMode) {
        await axios.put(`${BASE_URL}/api/categories/update/${category.id}`, body, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Alert.alert('Categoría actualizada');
      } else {
        await axios.post(`${BASE_URL}/api/categories/create`, body, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Alert.alert('Categoría creada');
      }
      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'No se pudo guardar la categoría');
    }
  };

  return (
    <GeneralTemplate>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={GeneralStyles.title}>
          {isEditMode ? 'Editar Categoría' : 'Crear Categoría'}
        </Text>

        {/* Imagen */}
        <View style={styles.imageSelectionContainer}>
          <View style={styles.imageCircle}>
            {imageUrl ? (
              <Image
                source={{ uri: `${BASE_URL}/api/images/${imageUrl}` }}
                style={styles.imageCircle}
              />
            ) : (
              <Text style={styles.imagePlaceholder}>?</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.selectImageButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.selectImageText}>Seleccionar Imagen</Text>
          </TouchableOpacity>
        </View>

        {/* Formulario */}
        <View style={styles.formContainer}>
          <InputField
            style={styles.input}
            placeholder="Nombre"
            value={name}
            onChangeText={setName}
          />
          <InputField
            style={styles.input}
            placeholder="Descripción"
            value={description}
            onChangeText={setDescription}
          />

          {/* Orden */}
          <View style={{ marginBottom: 12 }}>
            <TouchableOpacity
              onPress={() => setShowOrderOptions(!showOrderOptions)}
              style={styles.orderButton}
            >
              <Text style={{ fontSize: 16, color: '#0C2527' }}>
                {orderOptions.find((o) => o.value === orderTasks)?.label ||
                  'Selecciona orden'}
              </Text>
            </TouchableOpacity>
            {showOrderOptions && (
              <View style={styles.dropdownOptions}>
                {orderOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => {
                      setOrderTasks(opt.value);
                      setShowOrderOptions(false);
                    }}
                    style={styles.dropdownOption}
                  >
                    <Text style={styles.optionText}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Método de estudio */}
          <InputField
            style={styles.input}
            placeholder="Ej: 1"
            value={studyMethodId ? studyMethodId.toString() : ''}
            onChangeText={(t) => setStudyMethodId(t ? parseInt(t) : null)}
            keyboardType="numeric"
          />

          {/* Mostrar completadas */}
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Mostrar tareas completadas</Text>
            <Switch value={showComplete} onValueChange={setShowComplete} />
          </View>

          {/* Auto‑borrar completadas */}
          <View style={[styles.optionGroup, { marginTop: 20 }]}>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Auto‑borrar completadas</Text>
              <Switch
                value={autoDeleteComplete}
                onValueChange={setAutoDeleteComplete}
              />
            </View>
            {autoDeleteComplete && (
              <>
                <TextInput
                  style={styles.numberInput}
                  placeholder="Ej. 7"
                  value={deleteCompleteDays}
                  onChangeText={setDeleteCompleteDays}
                  keyboardType="number-pad"
                  returnKeyType="done"
                />
              </>
            )}
          </View>

          <Button
            title={isEditMode ? 'Guardar Cambios' : 'Crear Categoría'}
            onPress={handleSave}
          />
        </View>

        {/* Modal de imágenes */}
        <CustomModal
          visible={modalVisible}
          title="Elige un icono"
          onConfirm={() => setModalVisible(false)}
          onCancel={() => setModalVisible(false)}
          showCancel={false}
        >
          <ScrollView
            style={styles.modalScrollView}
            contentContainerStyle={styles.modalContent}
          >
            {images.map((img) => (
              <TouchableOpacity
                key={img.id}
                onPress={() => {
                  setImageId(img.id);
                  setImageUrl(img.imageUrl);
                }}
                style={[
                  styles.imageOption,
                  imageId === img.id && styles.selectedImage,
                ]}
              >
                <View style={styles.modalImageBox}>
                  <View style={styles.modalEnlargedBackground} />
                  <Image
                    source={{ uri: `${BASE_URL}/api/images/${img.imageUrl}` }}
                    style={styles.modalImage}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </CustomModal>
      </ScrollView>
    </GeneralTemplate>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    alignItems: 'center',
    width: '100%',
  },
  imageSelectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'center',
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
    color: '#0C2527',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
    width: '80%',
  },
  orderButton: {
    width: 300,
    height: 50,
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#084F52',
    borderRadius: 8,
    backgroundColor: '#CDF8FA',
    justifyContent: 'center',
  },
  dropdownOptions: {
    backgroundColor: '#CDF8FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: -10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#0C2527',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    backgroundColor: '#CDF8FA',
    paddingHorizontal: 7,
    borderRadius: 8,
    borderColor: '#084F52',
  },
  switchLabel: {
    fontSize: 18,
    marginRight: 10,
    color: '#084F52',
    fontWeight: 'bold',
  },
  /* NUEVOS ESTILOS */
  optionGroup: {
    backgroundColor: '#CDF8FA',
    padding: 12,
    borderRadius: 8,
  },
  retentionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  optionLabel: {
    fontSize: 16,
    color: '#084F52',
    marginRight: 10,
  },
  numberInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#084F52',
    width: 80,
    textAlign: 'center',
  },
  modalContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
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
  modalImageBox: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  modalEnlargedBackground: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(12, 37, 39, 1)',
    top: -5,
    left: -5,
  },
  modalImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    zIndex: 1,
  },
  modalScrollView: {
    maxHeight: 280,
  },
});

export default CategoryScreen;
