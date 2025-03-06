import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import TasksScreen from '../screens/TasksScreen';


const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName= "Tasks" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen}/>
        <Stack.Screen name="Profile" component={ProfileScreen}/>
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen}/>
        <Stack.Screen name="Tasks" component={TasksScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
