import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
  withDelay,
} from 'react-native-reanimated';
import { getBoolean } from '../../utils/Storage';

const { width, height } = Dimensions.get('window');

const STORAGE_KEYS = {
  HAS_COMPLETED_ONBOARDING: '@has_completed_onboarding',
};

export default function LoadingScreen(){
  const navigation = useNavigation();
  
  // Shared values for animations
  const rotation = useSharedValue(0);
  const scale1 = useSharedValue(1);
  const scale2 = useSharedValue(1);
  const scale3 = useSharedValue(1);
  const opacity1 = useSharedValue(1);
  const opacity2 = useSharedValue(1);
  const opacity3 = useSharedValue(1);

  useEffect(() => {
    // Check onboarding status and navigate after a delay
    const checkOnboardingAndNavigate = async () => {
      try {
        const hasCompletedOnboarding =  getBoolean(
          STORAGE_KEYS.HAS_COMPLETED_ONBOARDING
        );

        // Wait for 2 seconds to show the loading animation
        setTimeout(() => {
          if (hasCompletedOnboarding) {
            navigation.replace('Home');
          } else {
            navigation.replace('Onboarding');
          }
        }, 2000);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // Default to onboarding if there's an error
        setTimeout(() => {
          navigation.replace('Onboarding');
        }, 2000);
      }
    };

    checkOnboardingAndNavigate();
  }, [navigation]);

  useEffect(() => {
    // Rotate the outer ring continuously
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 2000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // Pulse animation for first circle
    scale1.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    opacity1.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Pulse animation for second circle (delayed)
    scale2.value = withDelay(
      266,
      withRepeat(
        withSequence(
          withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );

    opacity2.value = withDelay(
      266,
      withRepeat(
        withSequence(
          withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );

    // Pulse animation for third circle (delayed more)
    scale3.value = withDelay(
      532,
      withRepeat(
        withSequence(
          withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );

    opacity3.value = withDelay(
      532,
      withRepeat(
        withSequence(
          withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );
  }, []);

  // Animated styles
  const outerRingStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const circle1Style = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale1.value }],
      opacity: opacity1.value,
    };
  });

  const circle2Style = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale2.value }],
      opacity: opacity2.value,
    };
  });

  const circle3Style = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale3.value }],
      opacity: opacity3.value,
    };
  });

  return (
    <View style={styles.container}>
      {/* Outer rotating ring */}
      <Animated.View style={[styles.outerRing, outerRingStyle]}>
        <View style={styles.ringSegment1} />
        <View style={styles.ringSegment2} />
        <View style={styles.ringSegment3} />
      </Animated.View>

      {/* Pulsing circles */}
      <View style={styles.circlesContainer}>
        <Animated.View style={[styles.circle, styles.circle1, circle1Style]} />
        <Animated.View style={[styles.circle, styles.circle2, circle2Style]} />
        <Animated.View style={[styles.circle, styles.circle3, circle3Style]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringSegment1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'transparent',
    borderTopColor: '#3B82F6',
    borderRightColor: '#3B82F6',
  },
  ringSegment2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'transparent',
    borderBottomColor: '#8B5CF6',
    borderLeftColor: '#8B5CF6',
  },
  ringSegment3: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: '#EC4899',
    borderBottomColor: '#EC4899',
  },
  circlesContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  circle: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  circle1: {
    backgroundColor: '#3B82F6',
  },
  circle2: {
    backgroundColor: '#8B5CF6',
  },
  circle3: {
    backgroundColor: '#EC4899',
  },
});

