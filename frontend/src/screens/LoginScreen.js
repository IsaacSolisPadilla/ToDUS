import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { BASE_URL } from '../config';
import GeneralTemplate from '../components/GeneralTemplate';
import InputField from '../components/InputField';
import Button from '../components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GeneralStyles from '../styles/GeneralStyles';
import { useTranslation } from 'react-i18next';

const LoginScreen = ({ navigation }) => {
  const  { t }  = useTranslation();
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
            throw new Error(t('login.loginErrorFallback'));
        }

        await AsyncStorage.setItem('token', data.token);
        navigation.navigate('Tasks');

    } catch (error) {
        console.error(t('login.errorTitle'), error);
        Alert.alert('Error', error.message);
    }
};

  return (
    <GeneralTemplate>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={GeneralStyles.keyboardAvoiding}
      >
    
          <View style={GeneralStyles.innerContainer}>
            <Text style={GeneralStyles.title}>{t('login.title')}</Text>
            <View style={GeneralStyles.formContainer}>
              <InputField placeholder={t('login.emailPlaceholder')} value={email} onChangeText={setEmail} keyboardType="email-address"/>
              <InputField placeholder={t('login.passwordPlaceholder')} value={password} onChangeText={setPassword} secureTextEntry />
              <Button title={t('login.loginButton')} onPress={handleLogin} />
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={GeneralStyles.link}>{t('login.noAccount')}</Text>
              </TouchableOpacity>
            </View>
          </View>
      </KeyboardAvoidingView>
    </GeneralTemplate>
  );
};

export default LoginScreen;