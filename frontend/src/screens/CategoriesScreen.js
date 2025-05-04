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
import { useTranslation } from 'react-i18next';
import LoadingOverlay from '../components/LoadingOverlay';
import logo from '../../assets/icono.png';

const CategoriesScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const swipeableRefs = useRef({});
  const screenWidth = Dimensions.get('window').width;
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const response = await axios.get(`${BASE_URL}/api/categories/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data);
    } catch (error) {
      console.error(t('categories.alertFetchError'), error);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        await fetchCategories();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  // Refrescar al ganar foco
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
      console.error(t('categories.alertFetchError'), error);
      Alert.alert(t('categories.alertDeleteError'));    
  }
  };

  const renderLeftActions = () => (
    <View style={styles.leftAction}>
      <Text style={styles.actionText}>{t('categories.action.edit')}</Text>
    </View>
  );

  const renderRightActions = () => (
    <View style={styles.rightAction}>
      <Text style={styles.actionText}>{t('categories.action.delete')}</Text>
    </View>
  );

  if (loading) {
    return (
      <LoadingOverlay
        visible
        text={t('statsScreen.loading')}
        logoSource={logo}
      />
    );
  }

  return (
    <GeneralTemplate>
      <View>
        <Text style={GeneralStyles.title}>{t('categories.title')}</Text>
      </View>
      <View style={{ flex: 1, width: screenWidth * 0.8 }}>
        <FlatList
          data={categories}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
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
                    {/* Fondo extra que se muestra detrás de la imagen */}
                    <View style={styles.enlargedBackground} />
                    <Image
                      source={{ uri: `${BASE_URL}/api/images/${item.image.imageUrl}` }}
                      style={styles.image}
                      resizeMode="contain"
                    />
                  </View>
                  <View>
                    <Text
                      style={[styles.categoryName, { width: screenWidth * 0.6 }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[styles.categoryDescription, { width: screenWidth * 0.6 }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.description}
                    </Text>
                  </View>
                </View>
              </View>
            </Swipeable>
          )}
        />

        <View style={{ marginTop: 10, marginBottom: 20, alignItems: 'center' }}>
          <Button title={t('categories.newCategory')} onPress={() => navigation.navigate('Category')} />
        </View>

        <CustomModal
          visible={deleteModalVisible}
          title={t('categories.deleteModalTitle')}
          onConfirm={handleDeleteCategory}
          onCancel={() => setDeleteModalVisible(false)}
        >
          <Text>{t('categories.deleteModalMessage')}</Text>
        </CustomModal>
      </View>
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
    width: 48,
    height: 48,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  enlargedBackground: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(12, 37, 39, 1)',
    top: -6,
    left: -6,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 8,
    zIndex: 1,
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
};

export default CategoriesScreen;
