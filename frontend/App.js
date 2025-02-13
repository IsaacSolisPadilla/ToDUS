import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import TaskScreen from './src/screens/TaskScreen';
import 'react-native-gesture-handler';
import GeneralTemplate from './src/components/GeneralTemplate';
import { Text } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

const Stack = createStackNavigator();

export default function App() {
  return <AppNavigator />;
}
