import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Mainstack from './app/navigation/Mainstack';
import "react-native-reanimated"
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: '308191456185-me7jubljcn53q2g40gqqf3scbmm06r2h.apps.googleusercontent.com',
  offlineAccess: false,
});


export default function App() {
  return (
    <NavigationContainer>
      <Mainstack />
    </NavigationContainer>
  );
}

