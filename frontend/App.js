// App.js
import React, { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Calendar from 'expo-calendar';
import AppNavigator from './src/navigation/AppNavigator';

// Show notifications even when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  useEffect(() => {
    (async () => {
      // ————— Notifications —————
      const { status: notifStatus } = await Notifications.requestPermissionsAsync();
      if (notifStatus !== 'granted') {
        Alert.alert('Permiso denegado para notificaciones');
      } else if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      // ————— Calendar integration —————
      const { status: calStatus } = await Calendar.requestCalendarPermissionsAsync();
      if (calStatus !== 'granted') {
        Alert.alert('Permiso denegado para calendario');
        return;
      }

      // find or create our “Todus Tasks” calendar
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      let taskCal = calendars.find(c => c.title === 'Todus Tasks');
      if (!taskCal) {
        const defaultSource =
          Platform.OS === 'ios'
            ? await Calendar.getDefaultCalendarAsync()
            : { isLocalAccount: true, name: 'Expo Calendar' };

        taskCal = await Calendar.createCalendarAsync({
          title: 'Todus Tasks',
          color: '#084F52',
          entityType: Calendar.EntityTypes.EVENT,
          sourceId: defaultSource.id,
          source: defaultSource,
          name: 'Todus Tasks',
          ownerAccount: 'personal',
          accessLevel: Calendar.CalendarAccessLevel.OWNER,
        });
      }
      // you can now use taskCal.id when scheduling events from your TaskScreen
    })();
  }, []);

  return <AppNavigator />;
}
