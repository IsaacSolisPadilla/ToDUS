import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { BASE_URL } from '../config';
import GeneralTemplate from '../components/GeneralTemplate';
import InputField from '../components/InputField';
import Button from '../components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GeneralStyles from '../styles/GeneralStyles';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
        const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'No se pudo iniciar sesión');
        }

        await AsyncStorage.setItem('token', data.token);
        navigation.navigate('Tasks');

    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        Alert.alert('Error', error.message); // Muestra el error en un Alert
    }
};

  return (
    <GeneralTemplate>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={GeneralStyles.keyboardAvoiding}
      >
    
          <View style={GeneralStyles.innerContainer}>
            <Text style={GeneralStyles.title}>Iniciar Sesión</Text>
            <View style={GeneralStyles.formContainer}>
              <InputField placeholder="Correo Electrónico" value={email} onChangeText={setEmail} keyboardType="email-address"/>
              <InputField placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />
              <Button title="Ingresar" onPress={handleLogin} />
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={GeneralStyles.link}>¿No tienes cuenta? Regístrate</Text>
              </TouchableOpacity>
            </View>
          </View>
      </KeyboardAvoidingView>
    </GeneralTemplate>
  );
};

export default LoginScreen;