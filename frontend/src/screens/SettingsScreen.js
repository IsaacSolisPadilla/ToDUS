import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Switch, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback,
  Keyboard,
  TextInput,
  TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import GeneralTemplate from '../components/GeneralTemplate';
import { BASE_URL } from '../config';
import GeneralStyles from '../styles/GeneralStyles';
import { Swipeable } from 'react-native-gesture-handler';
import CustomModal from '../components/CustomModal';

// Simulamos el enum de Java en un arreglo
const COLORS = [
  { name: 'BLUE', hex: '#0000FF' },
  { name: 'YELLOW', hex: '#FFFF00' },
  { name: 'PINK', hex: '#FFC0CB' },
  { name: 'PURPLE', hex: '#800080' },
  { name: 'RED', hex: '#FF0000' },
  { name: 'ORANGE', hex: '#FFA500' },
  { name: 'BLACK', hex: '#000000' },
  { name: 'WHITE', hex: '#FFFFFF' },
];

const SettingsScreen = ({ navigation }) => {
  // Estados para Categorías (ya existentes)
  const [categorySettings, setCategorySettings] = useState([]);
  const [showCategoryList, setShowCategoryList] = useState(false);

  // Estados para Prioridades
  const [prioritiesList, setPrioritiesList] = useState([]);
  const [newPriorityName, setNewPriorityName] = useState('');
  const [newPriorityColor, setNewPriorityColor] = useState(COLORS[0].hex);
  const [editingPriority, setEditingPriority] = useState(null);
  
  // ---------------------------
  // CONFIGURACIÓN DE CATEGORÍAS
  // ---------------------------
  const fetchShowCategoryList = async () => {
    try {
      const stored = await AsyncStorage.getItem('showCategoryList');
      setShowCategoryList(stored !== null ? stored === 'true' : false);
    } catch (error) {
      console.error('Error al obtener showCategoryList:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/categories/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const categoriesWithSettings = await Promise.all(
        response.data.map(async (cat) => {
          const stored = await AsyncStorage.getItem(`showCategory_${cat.id}`);
          return { ...cat, show: stored !== null ? stored === 'true' : false };
        })
      );
      setCategorySettings(categoriesWithSettings);
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      Alert.alert('Error', 'No se pudieron cargar las categorías para configuración.');
    }
  };

  const toggleShowCategoryList = async (value) => {
    try {
      await AsyncStorage.setItem('showCategoryList', value.toString());
      setShowCategoryList(value);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la configuración');
    }
  };

  const toggleCategoryOption = async (categoryId, value) => {
    try {
      await AsyncStorage.setItem(`showCategory_${categoryId}`, value.toString());
      setCategorySettings(prev =>
        prev.map(cat =>
          cat.id === categoryId ? { ...cat, show: value } : cat
        )
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la configuración');
    }
  };

  // ---------------------------
  // GESTIÓN DE PRIORIDADES
  // ---------------------------
  const fetchPriorities = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/priorities/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPrioritiesList(response.data);
    } catch (error) {
      console.error('Error al obtener prioridades:', error);
      Alert.alert('Error', 'No se pudieron obtener las prioridades');
    }
  };

  const createPriority = async () => {
    if (!newPriorityName.trim()) {
      Alert.alert('Error', 'Debes ingresar un nombre para la prioridad');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      const requestData = { name: newPriorityName, colorHex: newPriorityColor };
      await axios.post(`${BASE_URL}/api/priorities/create`, requestData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      setNewPriorityName('');
      setNewPriorityColor(COLORS[0].hex);
      fetchPriorities();
    } catch (error) {
      console.error('Error al crear prioridad:', error);
      Alert.alert('Error', 'No se pudo crear la prioridad');
    }
  };

  const updatePriority = async () => {
    if (!newPriorityName.trim()) {
      Alert.alert('Error', 'Debes ingresar un nombre');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      const requestData = { name: newPriorityName, colorHex: newPriorityColor };
      await axios.put(`${BASE_URL}/api/priorities/update/${editingPriority.id}`, requestData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      setEditingPriority(null);
      setNewPriorityName('');
      setNewPriorityColor(COLORS[0].hex);
      fetchPriorities();
    } catch (error) {
      console.error('Error al actualizar prioridad:', error);
      Alert.alert('Error', 'No se pudo actualizar la prioridad');
    }
  };

  const canDeletePriority = async (priorityId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/tasks/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const tasksWithPriority = response.data.filter(
        task => task.priority && task.priority.id === priorityId
      );
      return tasksWithPriority.length === 0;
    } catch (error) {
      console.error('Error al comprobar tareas de prioridad:', error);
      return false;
    }
  };

  const deletePriority = async (priorityId) => {
    if (!(await canDeletePriority(priorityId))) {
      Alert.alert('Error', 'No se puede eliminar. Esta prioridad tiene tareas asociadas.');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(`${BASE_URL}/api/priorities/${priorityId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPriorities();
    } catch (error) {
      console.error('Error al eliminar prioridad:', error);
      Alert.alert('Error', 'No se pudo eliminar la prioridad');
    }
  };

  useEffect(() => {
    fetchShowCategoryList();
    fetchCategories();
    fetchPriorities();
  }, []);

  return (
    <GeneralTemplate>
      <ScrollView 
            contentContainerStyle={ styles.container } 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[GeneralStyles.keyboardAvoiding, { flex: 1 }]}
        >
          
            <Text style={GeneralStyles.title}>Configuración</Text>
            <Text style={styles.subheader}>
              Configura qué elementos se muestran en la pantalla principal.
            </Text>

            {/* Sección de Categorías */}
            <View style={styles.optionsContainer}>
              <View style={styles.optionRow}>
                <Text style={styles.optionLabel}>Mostrar listado de categorías</Text>
                <Switch
                  value={showCategoryList}
                  onValueChange={toggleShowCategoryList}
                  thumbColor={'#084F52'}
                  trackColor={{ false: '#ccc', true: '#16CDD6' }}
                />
              </View>
              {categorySettings.map((cat) => (
                <View key={cat.id} style={styles.optionRow}>
                  <Text style={styles.optionLabel}>{cat.name}</Text>
                  <Switch
                    value={cat.show}
                    onValueChange={(value) => toggleCategoryOption(cat.id, value)}
                    thumbColor={'#084F52'}
                    trackColor={{ false: '#ccc', true: '#16CDD6' }}
                  />
                </View>
              ))}
            </View>

            {/* Sección de Gestión de Prioridades */}
            <View style={styles.prioritiesSection}>
              <Text style={GeneralStyles.title}>Gestión de Prioridades</Text>
              {prioritiesList.map(priorityItem => (
                <Swipeable
                  key={priorityItem.id}
                  renderLeftActions={() => (
                    <View style={styles.leftAction}>
                      <Text style={styles.actionText}>Editar</Text>
                    </View>
                  )}
                  renderRightActions={() => (
                    <View style={styles.rightAction}>
                      <Text style={styles.actionText}>Eliminar</Text>
                    </View>
                  )}
                  onSwipeableOpen={(direction) => {
                    if (direction === 'left') {
                      // Al deslizar a la izquierda, inicia la edición
                      setEditingPriority(priorityItem);
                      setNewPriorityName(priorityItem.name);
                      setNewPriorityColor(priorityItem.colorHex);
                    } else if (direction === 'right') {
                      // Deslizando a la derecha se elimina, comprobando antes si es posible
                      deletePriority(priorityItem.id);
                    }
                  }}
                >
                  <View style={styles.priorityRow}>
                    <View style={[styles.priorityColorBox, { backgroundColor: priorityItem.colorHex }]} />
                    <Text style={styles.priorityName}>{priorityItem.name}</Text>
                  </View>
                </Swipeable>
              ))}

              {/* Formulario para Crear/Editar Prioridad */}
              <View style={styles.newPriorityContainer}>
                <TextInput
                  placeholder="Nombre de prioridad"
                  style={styles.newPriorityInput}
                  value={newPriorityName}
                  onChangeText={setNewPriorityName}
                />
                <View style={styles.colorsContainer}>
                  {COLORS.map(color => (
                    <TouchableOpacity
                      key={color.name}
                      style={[
                        styles.colorCircle,
                        { backgroundColor: color.hex },
                        newPriorityColor === color.hex && styles.colorSelected
                      ]}
                      onPress={() => setNewPriorityColor(color.hex)}
                    />
                  ))}
                </View>
                <TouchableOpacity
                  style={styles.savePriorityButton}
                  onPress={() => {
                    if (editingPriority) {
                      updatePriority();
                    } else {
                      createPriority();
                    }
                  }}
                >
                  <Text style={styles.savePriorityButtonText}>
                    {editingPriority ? 'Actualizar Prioridad' : 'Crear Prioridad'}
                  </Text>
                </TouchableOpacity>
                {editingPriority && (
                  <TouchableOpacity
                    onPress={() => {
                      setEditingPriority(null);
                      setNewPriorityName('');
                      setNewPriorityColor(COLORS[0].hex);
                    }}
                    style={styles.cancelEditButton}
                  >
                    <Text style={styles.cancelEditButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
      </ScrollView>
    </GeneralTemplate>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    fontSize: 22,
    color: '#0C2527',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subheader: {
    fontSize: 16,
    color: '#CDF8FA',
    textAlign: 'center',
    marginBottom: 20,
  },
  optionsContainer: {
    paddingBottom: 30,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#CDF8FA',
    borderRadius: 8,
    marginBottom: 15,
  },
  optionLabel: {
    fontSize: 16,
    color: '#084F52',
  },
  // Prioridades
  prioritiesSection: {
    marginTop: 20,
  },
  sectionHeader: {
    fontSize: 20,
    color: '#0C2527',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  priorityColorBox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  priorityName: {
    flex: 1,
    fontSize: 16,
    color: '#084F52',
  },
  leftAction: {
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    paddingHorizontal: 20,
    flex: 1,
    borderRadius: 8,
  },
  rightAction: {
    backgroundColor: '#FF4C4C',
    justifyContent: 'center',
    paddingHorizontal: 20,
    flex: 1,
    borderRadius: 8,
  },
  actionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  newPriorityContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#CDF8FA',
    borderRadius: 8,
  },
  newPriorityInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#084F52',
    marginBottom: 10,
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  colorCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  colorSelected: {
    borderColor: '#000',
    borderWidth: 2,
  },
  savePriorityButton: {
    backgroundColor: '#084F52',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  savePriorityButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  cancelEditButton: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  cancelEditButtonText: {
    color: '#FF4C4C',
    fontSize: 16,
  },
});

export default SettingsScreen;
