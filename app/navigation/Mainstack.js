import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import Username from '../screens/onboarding/Username';
import ReminderScreen from '../screens/Reminder/ReminderScreen';
import Tabnavigator from './TabNavigator';
const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Username" component={Username} />
      <Stack.Screen name="Reminder" component={ReminderScreen} />

      <Stack.Screen name="Tabnavigator" component={Tabnavigator} />
    </Stack.Navigator>
  );
}
