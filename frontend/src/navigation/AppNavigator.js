import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import TasksScreen from '../screens/TasksScreen';
import TaskDetailsScreen from '../screens/TaskDetailsScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import CategoryScreen from '../screens/CategoryScreen';
import TrashTasksScreen from '../screens/TrashTasksScreen';
import SubTasksScreen from '../screens/SubTasksScreen';
import PreventBack from './PreventBack'; // Importa el componente de prevención

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Tasks" screenOptions={{ headerShown: false }} options={{ gestureEnabled: false }}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Tasks" component={TasksScreen} options={{gestureEnabled: false}}/>
        <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} options={{gestureEnabled:false}}/>
        <Stack.Screen name="Categories" component={CategoriesScreen}/>
        <Stack.Screen name="Category" component={CategoryScreen}/>
        <Stack.Screen name="TrashTasks" component={TrashTasksScreen} />
        <Stack.Screen name="SubTasks" component={SubTasksScreen} />
      </Stack.Navigator>
      <PreventBack />
    </NavigationContainer>
  );
};

export default AppNavigator;
