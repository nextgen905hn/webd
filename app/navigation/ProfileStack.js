import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileMain from '../screens/Profile/ProfileMain';
import Support from '../screens/Profile/Support';
import Settings from '../screens/Profile/Settings';

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator  screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileMain} options={{ title: 'Profile' }} />
         <Stack.Screen name="Support" component={Support} options={{ title: 'Support' }} />
      <Stack.Screen name="Settings" component={Settings} options={{ title: 'Settings' }} />

    </Stack.Navigator>
  );
}
