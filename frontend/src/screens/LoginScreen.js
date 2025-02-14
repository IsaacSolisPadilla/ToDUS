import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import GeneralTemplate from '../components/GeneralTemplate';
import InputField from '../components/InputField';
import Button from '../components/Button';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://192.168.0.17:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'No se pudo iniciar sesión');
        
      }
      Alert.alert('Inicio de sesión exitoso', 'Bienvenido');
      //navigation.navigate('Home');
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
    }
  };

  return (
    <GeneralTemplate>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={styles.keyboardAvoiding}
      >
    
          <View style={styles.innerContainer}>
            <Text style={styles.title}>Iniciar Sesión</Text>
            <View style={styles.formContainer}>
              <InputField placeholder="Correo Electrónico" value={email} onChangeText={setEmail} />
              <InputField placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />
              <Button title="Ingresar" onPress={handleLogin} />
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
              </TouchableOpacity>
            </View>
          </View>
      </KeyboardAvoidingView>
    </GeneralTemplate>
  );
};

const styles = StyleSheet.create({
  keyboardAvoiding: {
    flex: 1,
    width: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default LoginScreen;