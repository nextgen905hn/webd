/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import notifee, { TriggerType } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add these event listeners in App.js
notifee.onBackgroundEvent(async ({ type }) => {
  if (type === notifee.EventType.DELIVERED) {
    await scheduleNextDayNotification();
  }
});

notifee.onForegroundEvent(async ({ type }) => {
  if (type === notifee.EventType.DELIVERED) {
    await scheduleNextDayNotification();
  }
});

// Function to reschedule for next day
async function scheduleNextDayNotification() {
  try {
    console.log('📅 Rescheduling next day notification...');
    
    // Get saved reminder time
    const savedTime = await AsyncStorage.getItem('reminderTime');
    const { hours, minutes } = savedTime ? JSON.parse(savedTime) : { hours: 20, minutes: 0 };
    
    const next = new Date();
    next.setDate(next.getDate() + 1); // Tomorrow
    next.setHours(hours, minutes, 0, 0);
    
    await notifee.createTriggerNotification(
      {
        id: 'daily-learning-reminder',
        title: '📚 Time to Learn!',
        body: 'Your daily learning session is ready! Stay consistent 🚀',
        android: {
          channelId: 'daily-reminder',
          pressAction: { id: 'default' },
          smallIcon: 'ic_launcher',
          sound: 'default',
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: next.getTime(),
        alarmManager: { allowWhileIdle: true },
      }
    );
    
    console.log('✅ Next day scheduled:', next.toLocaleString());
  } catch (error) {
    console.error('❌ Reschedule error:', error);
  }
}
AppRegistry.registerComponent(appName, () => App);
