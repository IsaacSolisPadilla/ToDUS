import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import GeneralTemplate from '../components/GeneralTemplate';
import InputField from '../components/InputField';
import Button from '../components/Button';

const RegisterScreen = ({ navigation }) => {

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [nickname, setNickname] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
   console.log('Registro');
  };

  return (
    <GeneralTemplate>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={styles.keyboardAvoiding}
      >
    
          <View style={styles.innerContainer}>
            <Text style={styles.title}>Registrate</Text>
              <View style={styles.formContainer}>
                <InputField placeholder="Nombre" value={name} onChangeText={setName} />
                <InputField placeholder="Apellido" value={surname} onChangeText={setSurname} />
                <InputField placeholder="Nombre de Usuario" value={nickname} onChangeText={setNickname} /> 
                <InputField placeholder="Correo Electrónico" value={email} onChangeText={setEmail} />
                <InputField placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />
                <InputField placeholder="Confirmar Contraseña" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
                <Button title="Ingresar" onPress={handleLogin} />
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.link}>Tienes cuenta, Iniciar Sesión</Text>
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

export default RegisterScreen;