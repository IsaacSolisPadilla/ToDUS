import React, { useEffect } from 'react';
import { BackHandler } from 'react-native';  // Importa el BackHandler de React Native
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
import SettingsScreen from '../screens/SettingsScreen';
import AboutScreen from '../screens/AboutScreen';
import StatsScreen from '../screens/StatsScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const transitionConfig = {
    cardStyleInterpolator: ({ current, next, layouts }) => {
      return {
        cardStyle: {
          opacity: current.progress,
          transform: [
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.width, 0],
              }),
            },
          ],
        },
      };
    },
  };

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Tasks" 
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
          ...transitionConfig,
        }}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ gestureEnabled: true }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Tasks" component={TasksScreen} options={{gestureEnabled: false}}/>
        <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} options={{gestureEnabled:false}}/>
        <Stack.Screen name="Categories" component={CategoriesScreen}/>
        <Stack.Screen name="Category" component={CategoryScreen}/>
        <Stack.Screen name="TrashTasks" component={TrashTasksScreen} />
        <Stack.Screen name="SubTasks" component={SubTasksScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="Stats" component={StatsScreen}/>
      </Stack.Navigator>
      <PreventBack />
    </NavigationContainer>
  );
};

export default AppNavigator;
