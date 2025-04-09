// PreventBack.js
import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const PreventBack = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      e.preventDefault();
      Alert.alert(
        '¿Seguro que quieres salir?',
        'Tus cambios no se han guardado. ¿Estás seguro?',
        [
          { text: 'Cancelar', onPress: () => null, style: 'cancel' },
          {
            text: 'Salir',
            onPress: () => navigation.replace('Tasks'),
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation]);

  return <></>;
};

export default PreventBack;
