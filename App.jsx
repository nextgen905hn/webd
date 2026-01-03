import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Mainstack from './app/navigation/Mainstack';
import "react-native-reanimated"
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// ✅ Configure Google Sign-In before app renders
GoogleSignin.configure({
  webClientId: '308191456185-me7jubljcn53q2g40gqqf3scbmm06r2h.apps.googleusercontent.com',
  offlineAccess: true, // ✅ CHANGED: Set to true for better token handling
  forceCodeForRefreshToken: true, // ✅ ADDED: Ensures refresh tokens work properly
});

export default function App() {
  return (
    <NavigationContainer>
      <Mainstack />
    </NavigationContainer>
  );
}