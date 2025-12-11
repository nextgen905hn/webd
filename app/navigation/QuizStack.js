import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import QuizHome from '../screens/Quiz/QuizHome';
import QuizPlay from '../screens/Quiz/QuizPlay';

const Stack = createNativeStackNavigator();

export default function QuizStack() {
  return (
    <Stack.Navigator  screenOptions={{ headerShown: false }}>
      <Stack.Screen name="QuizHome" component={QuizHome} options={{ title: 'Quiz' }} />
      <Stack.Screen name="QuizPlay" component={QuizPlay} options={{ title: 'Play Quiz' }} />
    </Stack.Navigator>
  );
}
