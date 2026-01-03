import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProgressScreen from '../screens/Progress/ProgressScreen';

const Stack = createNativeStackNavigator();

export default function ProgressStack() {
  return (
    <Stack.Navigator  screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProgressScreen" component={ProgressScreen} options={{ title: 'Progress' }} />
    </Stack.Navigator>
  );
}
