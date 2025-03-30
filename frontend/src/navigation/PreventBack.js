// PreventBack.js
import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const PreventBack = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Aquí se puede realizar una verificación adicional si es necesario
      e.preventDefault(); // Evita que el usuario regrese a la pantalla anterior

      // Mostrar un alert antes de permitir el retroceso
      Alert.alert(
        '¿Seguro que quieres salir?',
        'Tus cambios no se han guardado. ¿Estás seguro?',
        [
          { text: 'Cancelar', onPress: () => null, style: 'cancel' },
          {
            text: 'Salir',
            onPress: () => navigation.replace('Tasks'), // Reemplaza con la pantalla principal
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation]);

  return <></>; // Este componente no necesita renderizar nada
};

export default PreventBack;
