import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Mainstack from './app/navigation/Mainstack';
import './app/utils/googleConfig';
import "react-native-reanimated"
export default function App() {
  return (
    <NavigationContainer>
      <Mainstack />
    </NavigationContainer>
  );
}

