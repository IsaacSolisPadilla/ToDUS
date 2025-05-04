import React, { useState, useRef, useEffect } from 'react';
import { 
  Text, 
  View, 
  ImageBackground, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Animated, 
  Image, 
  Alert, 
  ScrollView, 
  TouchableWithoutFeedback,
  Keyboard,
  Easing,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomModal from '../components/CustomModal';
import axios from 'axios';
import { BASE_URL } from '../config';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

const GeneralTemplate = ({ children }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [userImage, setUserImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const navWidth = useRef(new Animated.Value(50)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  const bottomNavAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    checkAuthStatus();
  }, [isLoggedIn]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      Animated.timing(bottomNavAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(bottomNavAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      setIsLoggedIn(!!token);

      if (token) {
        const response = await axios.get(`${BASE_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const imageUrl = response.data.imageUrl;
        setUserImage(imageUrl ? `${BASE_URL}/api/images/${imageUrl}` : null);

        const catRes = await axios.get(`${BASE_URL}/api/categories/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(catRes.data);
      }
    } catch (error) {
      console.error('Error obteniendo datos del usuario/categorías:', error);
    }
  };

  const handleLogout = () => setIsLogoutModalVisible(true);

  const handleConfirmLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setIsLoggedIn(false);
      setUserImage(null);
      setIsLogoutModalVisible(false);
      Alert.alert(t('general.logoutModal.logout2'), t('general.logoutModal.logoutMessage'));
      navigation.replace('Login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Alert.alert('Error', t('general.logoutModal.logoutError'));
    }
  };

  const toggleNavbar = () => {
    Animated.timing(navWidth, {
      toValue: isNavOpen ? 50 : 200,
      duration: 300,
      useNativeDriver: false,
    }).start();

    Animated.timing(textOpacity, {
      toValue: isNavOpen ? 0 : 1,
      duration: 150,
      useNativeDriver: false,
    }).start();

    setIsNavOpen(!isNavOpen);
  };

  const handleOutsidePress = () => {
    if (isNavOpen) {
      toggleNavbar();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <View style={styles.container}>
        <StatusBar style="light" backgroundColor="transparent" translucent />
        <Animated.View style={[styles.navbar, { width: navWidth }]}>
          <TouchableOpacity style={styles.navItem} onPress={toggleNavbar}>
            <Feather name="menu" size={30} color="#CDF8FA" />
            <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
              <Text style={styles.navText}>{t('general.nav.menu')}</Text>
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Tasks')}>
            <Feather name="home" size={30} color="#CDF8FA" />
            <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
              <Text style={styles.navText}>{t('general.nav.home')}</Text>
            </Animated.View>
          </TouchableOpacity>

          {isLoggedIn ? (
            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
              {userImage ? (
                <Image source={{ uri: userImage }} style={styles.profileImage} />
              ) : (
                <Feather name="user" size={30} color="#CDF8FA" />
              )}
              <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
                <Text style={styles.navText}>{t('general.nav.profile')}</Text>
              </Animated.View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Login')}>
              <Image source={require('../../assets/logo_defecto.jpg')} style={styles.avatar} />
              <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
                <Text style={styles.navText}>{t('general.nav.login')}</Text>
              </Animated.View>
            </TouchableOpacity>
          )}

          {isLoggedIn && (
            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Categories')}>
              <Feather name="layers" size={30} color="#CDF8FA" />
              <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
                <Text style={styles.navText}>{t('general.nav.categories')}</Text>
              </Animated.View>
            </TouchableOpacity>
          )}

          {isLoggedIn && categories.length > 0 && (
            <ScrollView style={styles.categoryScroll} contentContainerStyle={{ paddingVertical: 10 }} showsVerticalScrollIndicator={false}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryIconWrapper}
                  onPress={() => navigation.navigate('Tasks', { category: cat })}
                >
                  <Image
                    source={{ uri: `${BASE_URL}/api/images/${cat.image.imageUrl}` }}
                    style={styles.categoryIconImage}
                  />
                  <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
                    <Text style={styles.navText}>{cat.name}</Text>
                  </Animated.View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {isLoggedIn && (
            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Settings')}>
              <Feather name="settings" size={30} color="#CDF8FA" />
              <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
                <Text style={styles.navText}>{t('general.nav.settings')}</Text>
              </Animated.View>
            </TouchableOpacity>
          )}

          {isLoggedIn && (
            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Stats')}>
              <Feather name="bar-chart-2" size={30} color="#CDF8FA" />
              <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
                <Text style={styles.navText}>{t('general.nav.stats')}</Text>
              </Animated.View>
            </TouchableOpacity>
          )}
                
          <Animated.View
            style={[
              styles.bottomNav,
              { 
                bottom: isLoggedIn ? 40 : 20,
                opacity: bottomNavAnim, // controla la visibilidad
                transform: [{ translateY: bottomNavAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                }) }]
              },
            ]}
          >
            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('About')}>
              <Feather name="info" size={25} color="#CDF8FA" />
              <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
                <Text style={styles.navText}>{t('general.nav.about')}</Text>
              </Animated.View>
            </TouchableOpacity>

            {isLoggedIn && (
              <TouchableOpacity style={[styles.navItem, { marginBottom: 20 }]} onPress={handleLogout}>
                <Feather name="log-out" size={25} color="#CDF8FA" />
                <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
                  <Text style={styles.navText}>{t('general.nav.logout')}</Text>
                </Animated.View>
              </TouchableOpacity>
            )}
          </Animated.View>
        </Animated.View>

        <ImageBackground source={require('../../assets/background.png')} style={styles.background} />
        <View style={styles.overlay}>{children}</View>

        <CustomModal
          visible={isLogoutModalVisible}
          title={t('general.logoutModal.title')}
          onConfirm={handleConfirmLogout}
          onCancel={() => setIsLogoutModalVisible(false)}
          showCancel={true}
        >
          <Text>{t('general.logoutModal.confirm')}</Text>
        </CustomModal>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#084F52',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  homeButton: {
    position: 'absolute',
    top: 80,
    right: 20,
    zIndex: 10,
  },
  navbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: 'rgba(12, 37, 39, 1)',
    paddingTop: 60,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowRadius: 5,
    elevation: 5,
    zIndex: 20,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    width: '80%',
    paddingLeft: 8,
    height: 30,
  },
  textContainer: {
    marginLeft: 15,
  },
  navText: {
    color: '#CDF8FA',
    fontSize: 18,
  },
  profileImage: {
    width: 35,
    height: 35,
    right: 1,
    borderRadius: 15,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 20,
  },
  background: {
    marginTop: 240,
    width: width,
    height: height * 0.5,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
  overlay: {
    display: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    left: 20,
  },
  bottomNav: {
    position: 'absolute',
    alignItems: 'flex-start',
    paddingLeft: 5,
  },
  categoryScroll: {
    maxHeight: 180,
    width: '100%',
    paddingLeft: 5,
  },
  categoryIconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    paddingVertical: 2,
    gap: 6,
  },
  categoryIconImage: {
    width: 35,
    height: 35,
    borderRadius: 10,
  },
});

export default GeneralTemplate;
