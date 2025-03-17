import React, { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Alert, FlatList, Dimensions, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler';
import axios from 'axios';
import GeneralTemplate from '../components/GeneralTemplate';
import GeneralStyles from '../styles/GeneralStyles';
import CustomModal from '../components/CustomModal';
import { BASE_URL } from '../config';
import Button from '../components/Button';

const CategoriesScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const swipeableRefs = useRef({});
  const screenWidth = Dimensions.get('window').width;

  const fetchCategories = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const response = await axios.get(`${BASE_URL}/api/categories/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Error al obtener categorías:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [])
  );

  const handleDeleteCategory = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token || !categoryToDelete) return;
      await axios.delete(`${BASE_URL}/api/categories/delete/${categoryToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteModalVisible(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      Alert.alert('Error', 'No se pudo eliminar la categoría');
    }
  };

  const renderLeftActions = () => (
    <View style={styles.leftAction}>
      <Text style={styles.actionText}>Editar</Text>
    </View>
  );

  const renderRightActions = () => (
    <View style={styles.rightAction}>
      <Text style={styles.actionText}>Eliminar</Text>
    </View>
  );

  return (
    <GeneralTemplate>
      <View>
        <Text style={GeneralStyles.title}>Tus Categorías</Text>
      </View>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: screenWidth * 0.1 }}
        renderItem={({ item }) => (
          <Swipeable
            ref={(ref) => {
              if (ref && item.id) swipeableRefs.current[item.id] = ref;
            }}
            renderLeftActions={renderLeftActions}
            renderRightActions={renderRightActions}
            onSwipeableOpen={(direction) => {
              swipeableRefs.current[item.id]?.close();
              if (direction === 'left') {
                navigation.navigate('Category', { category: item });
              } else if (direction === 'right') {
                setCategoryToDelete(item);
                setDeleteModalVisible(true);
              }
            }}
          >
            <View style={styles.categoryItemContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.imageBox}>
                  <Image
                    source={{ uri: `${BASE_URL}/api/images/${item.image.imageUrl}` }}
                    style={styles.image}
                    resizeMode="contain"
                  />
                </View>
                <View>
                  <Text style={styles.categoryName}>{item.name}</Text>
                  <Text style={styles.categoryDescription}>{item.description}</Text>
                </View>
              </View>
            </View>
          </Swipeable>
        )}
        
      />

      <Button title="Nueva Categoría" onPress={() => navigation.navigate('Category')} />

      

      <CustomModal
        visible={deleteModalVisible}
        title="¿Eliminar categoría?"
        onConfirm={handleDeleteCategory}
        onCancel={() => setDeleteModalVisible(false)}
      >
        <Text>¿Estás seguro de que quieres eliminar esta categoría?</Text>
      </CustomModal>
    </GeneralTemplate>
  );
};

const styles = {
  categoryItemContainer: {
    backgroundColor: '#CDF8FA',
    padding: 20,
    marginVertical: 6,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0C2527',
  },
  categoryDescription: {
    fontSize: 14,
    color: '#084F52',
  },
  imageBox: {
    width: 40,
    height: 40,
    marginRight: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftAction: {
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    flex: 1,
    borderRadius: 8,
  },
  rightAction: {
    backgroundColor: '#FF4C4C',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    flex: 1,
    borderRadius: 8,
  },
  actionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 8,
  }
};

export default CategoriesScreen;
