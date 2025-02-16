import React from 'react';
import { Text, View, ImageBackground, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const GeneralTemplate = ({ children }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Home')}>
        <Feather name="home" size={35} color="white" />
      </TouchableOpacity>
      <View style={styles.backgroundContainer}>
        <ImageBackground source={require('../../assets/background.png')} style={styles.background} />
      </View>
      <View style={styles.overlay}>{children}</View>
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
    top: 40,
    right: 20,
    zIndex: 10,
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.3, // Aplica la opacidad solo a la vista que contiene la imagen
  },
  background: {
    position: 'absolute',
    width: width * 0.8,
    height: height * 0.4,
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GeneralTemplate;
