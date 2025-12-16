import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/Home/HomeScreen';
import LessonScreen from '../screens/Home/LessonScreen';
import LessonDetailsScreen from '../screens/Home/LessonDetailsScreen';
import Projects from "../screens/Home/Project"
import FinalTest from "../screens/Home/finaltest"
import Certificate from "../screens/Home/Certificate"
import  LessonQuiz from "../screens/Home/LessonQuiz"
import  Testresult from "../screens/Home/Testresult"
import  ProjectDetails from "../screens/Home/ProjectDetails"

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Stack.Screen name="Lesson" component={LessonScreen} options={{ title: 'Lesson' }} />
      <Stack.Screen name="Projects" component={Projects} options={{ title: 'Projects' }} />
         <Stack.Screen name="ProjectDetails" component={ProjectDetails} options={{ title: 'ProjectDetails' }} />

    <Stack.Screen name="FinalTest" component={FinalTest} options={{ title: 'FinalTest' }} />
      <Stack.Screen name="Certificate" component={Certificate} options={{ title: 'Certificate' }} />
      <Stack.Screen name="LessonQuiz" component={LessonQuiz} options={{ title: 'LessonQuiz' }} />
      <Stack.Screen name="Testresult" component={Testresult} options={{ title: 'Testresult' }} />

      <Stack.Screen name="LessonDetails" component={LessonDetailsScreen} options={{ title: 'LessonDetails' }} />
    </Stack.Navigator>
  );
}
