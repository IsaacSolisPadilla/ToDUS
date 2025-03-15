import React, { useState, useRef, useEffect } from 'react';
import { Text, View, ImageBackground, StyleSheet, Dimensions, TouchableOpacity, Animated, Image, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomModal from '../components/CustomModal';
import axios from 'axios'; // Para obtener la imagen del usuario
import { BASE_URL } from '../config';

const { width, height } = Dimensions.get('window');

const GeneralTemplate = ({ children }) => {
  const navigation = useNavigation();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [userImage, setUserImage] = useState(null); // Estado para la imagen del usuario
  const navWidth = useRef(new Animated.Value(50)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkAuthStatus();
  }, [isLoggedIn]);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      setIsLoggedIn(!!token);

      if (token) {
        // Obtener información del usuario incluyendo la imagen
        const response = await axios.get(`${BASE_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const imageUrl = response.data.imageUrl;
        setUserImage(imageUrl ? `${BASE_URL}/api/images/${imageUrl}` : null);
      }
    } catch (error) {
      console.error('Error obteniendo datos del usuario:', error);
    }
  };

  const handleLogout = () => {
    setIsLogoutModalVisible(true);
  };

  const handleConfirmLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setIsLoggedIn(false);
      setUserImage(null); // Resetear la imagen al cerrar sesión
      setIsLogoutModalVisible(false);
      Alert.alert('Cierre de sesión', 'Has cerrado sesión correctamente.');
      navigation.replace('Login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Alert.alert('Error', 'No se pudo cerrar sesión.');
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

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      {/* Navbar animada */}
      <Animated.View style={[styles.navbar, { width: navWidth }]}>
        <TouchableOpacity style={styles.navItem} onPress={toggleNavbar}>
          <Feather name="menu" size={30} color="#CDF8FA" />
          <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
            <Text style={styles.navText}>Menú</Text>
          </Animated.View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <Feather name="home" size={30} color="#CDF8FA" />
          <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
            <Text style={styles.navText}>Inicio</Text>
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
              <Text style={styles.navText}>Perfil</Text>
            </Animated.View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Login')}>
            <Image source={require('../../assets/logo_defecto.jpg')} style={styles.avatar} />
            <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
              <Text style={styles.navText}>Iniciar sesión</Text>
            </Animated.View>
          </TouchableOpacity>
        )}

        {/* Botones en la parte inferior */}
        <View style={[styles.bottomNav, { bottom: isLoggedIn ? 40 : 20 }]}>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('About')}>
            <Feather name="info" size={25} color="#CDF8FA" />
            <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
              <Text style={styles.navText}>About</Text>
            </Animated.View>
          </TouchableOpacity>

          {isLoggedIn && (
            <TouchableOpacity style={[styles.navItem, isLoggedIn ? { marginBottom: 20 } : {}]} onPress={handleLogout}>
              <Feather name="log-out" size={25} color="#CDF8FA" />
              <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
                <Text style={styles.navText}>Logout</Text>
              </Animated.View>
            </TouchableOpacity>
          )}
        </View>

      </Animated.View>

      {/* Botón de inicio en la parte superior derecha */}
      <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Tasks')}>
        <Feather name="home" size={35} color="#CDF8FA" />
      </TouchableOpacity>

      {/* Fondo y contenido */}
      <ImageBackground source={require('../../assets/background.png')} style={styles.background} />
      <View style={styles.overlay}>{children}</View>

      {/* Modal de confirmación de logout */}
      <CustomModal
        visible={isLogoutModalVisible}
        title="Cerrar Sesión"
        onConfirm={handleConfirmLogout}
        onCancel={() => setIsLogoutModalVisible(false)}
        showCancel={true}
      >
        <Text>¿Estás seguro de que quieres cerrar sesión?</Text>
      </CustomModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#084F52',
    justifyContent: 'center',
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
    color: 'white',
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
});

export default GeneralTemplate;
