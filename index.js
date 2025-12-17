/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import notifee, { EventType } from '@notifee/react-native';

// Register background handler BEFORE AppRegistry
notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification, pressAction } = detail;
  
  // User pressed notification
  if (type === EventType.PRESS) {
    console.log('User pressed notification', notification.id);
    // You can navigate or perform actions here
  }
  
  // Notification was delivered
  if (type === EventType.DELIVERED) {
    console.log('Notification delivered', notification.id);
  }
});
AppRegistry.registerComponent(appName, () => App);
