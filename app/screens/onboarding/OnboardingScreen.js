import React, { useRef, useState, useEffect, memo, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
  Alert,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { removeKey, getJSON, setJSON, getString, setString, clearAll,getBoolean, setBoolean } from '../../utils/Storage';

const { width, height } = Dimensions.get("window");
const isSmallDevice = width < 375;

const STORAGE_KEYS = {
  USER_DATA: '@user_data',
  HAS_COMPLETED_ONBOARDING: '@has_completed_onboarding',
  LAST_LOGIN: '@last_login',
  USERNAME: 'username',
};

// Optimized: Memoized particle component
const AnimatedParticle = memo(({ index }) => {
  const animValue = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;
  
  const particleConfig = useMemo(() => ({
    size: 3 + Math.random() * 4,
    left: Math.random() * width,
    top: height * 0.3 + Math.random() * (height * 0.6),
    duration1: 4000 + Math.random() * 3000,
    duration2: 2000 + Math.random() * 2000,
  }), []);
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration: particleConfig.duration1,
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: 0,
          duration: particleConfig.duration1,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.5,
          duration: particleConfig.duration2,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.5,
          duration: particleConfig.duration2,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [particleConfig.duration1, particleConfig.duration2, animValue, scale]);

  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -200],
  });

  const translateX = animValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, Math.random() * 30 - 15, 0],
  });

  const opacity = animValue.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 1, 1, 0],
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: particleConfig.left,
          top: particleConfig.top,
          transform: [{ translateY }, { translateX }, { scale }],
          opacity,
        },
      ]}
    >
      <Svg width={particleConfig.size * 2} height={particleConfig.size * 2} viewBox={`0 0 ${particleConfig.size * 2} ${particleConfig.size * 2}`}>
        <Defs>
          <RadialGradient id={`grad${index}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="rgba(56, 189, 248, 0.9)" stopOpacity="1" />
            <Stop offset="100%" stopColor="rgba(139, 92, 246, 0.3)" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={particleConfig.size} cy={particleConfig.size} r={particleConfig.size} fill={`url(#grad${index})`} />
      </Svg>
    </Animated.View>
  );
});

// Optimized: Memoized particles container with reduced count
const FloatingParticles = memo(() => {
  const particleIndices = useMemo(() => Array.from({ length: 25 }, (_, i) => i), []);
  
  return (
    <View style={styles.particlesContainer}>
      {particleIndices.map((i) => (
        <AnimatedParticle key={i} index={i} />
      ))}
    </View>
  );
});

// Optimized: Memoized Google Logo SVG
const GoogleLogo = memo(() => (
  <Svg width="24" height="24" viewBox="0 0 20 20">
    <Path
      d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z"
      fill="#4285F4"
    />
    <Path
      d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z"
      fill="#34A853"
    />
    <Path
      d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z"
      fill="#FBBC05"
    />
    <Path
      d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z"
      fill="#EA4335"
    />
  </Svg>
));

// Optimized: Slide data moved outside component
const SLIDES = [
  {
    title: "Learn by Building",
    subtitle: "Master web development with hands-on projects and real-world tutorials that make coding fun.",
    icon: "code-slash-outline",
    iconColor: "#38BDF8",
    iconSecondary: "#8B5CF6",
    gradient: ["#050014", "#0A0828", "#182A50", "#1E3A8A"],
  },
  {
    title: "Track Your Progress",
    subtitle: "Stay motivated by tracking completed lessons, building streaks, and unlocking achievements.",
    icon: "stats-chart-outline",
    iconColor: "#8B5CF6",
    iconSecondary: "#EC4899",
    gradient: ["#050014", "#1A0B2E", "#2D1B4E", "#4C1D95"],
  },
  {
    title: "Start Learning Today",
    subtitle: "Join thousands of developers worldwide and begin your coding journey with expert guidance.",
    icon: "rocket-outline",
    iconColor: "#10B981",
    iconSecondary: "#38BDF8",
    gradient: ["#050014", "#0A1F1A", "#1B2E28", "#064E3B"],
    isLast: true,
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const iconScaleAnim = useRef(new Animated.Value(0.7)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const flatListRef = useRef();
  const scrollX = useRef(new Animated.Value(0)).current;

  // Load user data from MMKV (synchronous)
  const loadUserData = useCallback(() => {
    try {
      const userData = getJSON(STORAGE_KEYS.USER_DATA);
      if (userData) {
        setUserInfo(userData);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      try {
        removeKey(STORAGE_KEYS.USER_DATA);
      } catch (clearError) {
        console.error("Error clearing corrupted data:", clearError);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Save user data to MMKV (synchronous)
  const saveUserData = useCallback((userData) => {
    try {
      setJSON(STORAGE_KEYS.USER_DATA, userData);
      setString(STORAGE_KEYS.USERNAME, userData.name);
      setString(STORAGE_KEYS.LAST_LOGIN, new Date().toISOString());
    } catch (error) {
      console.error('Error saving user data:', error);
      Alert.alert(
        'Storage Error',
        'Failed to save user data. Please check app permissions.',
        [{ text: 'OK' }]
      );
    }
  }, []);

  // Mark onboarding as complete (synchronous)
  const markOnboardingComplete = useCallback(() => {
    try {
      setBoolean(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING, true);
    } catch (error) {
      console.error('Error marking onboarding complete:', error);
    }
  }, []);

  // Check onboarding status on mount (synchronous)
 useEffect(() => {
  const checkOnboarding = async () => {
    try {
      const hasCompleted = await getBoolean(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING);
      if (hasCompleted === true) {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: "Tabnavigator",
              state: {
                index: 0,
                routes: [{ name: "Home" }],
              },
            },
          ],
        });
      } else {
        loadUserData();
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      setLoading(false);
    }
  };

  checkOnboarding();
}, [navigation, loadUserData]);


  useEffect(() => {
    fadeAnim.setValue(0);
    slideUpAnim.setValue(50);
    iconScaleAnim.setValue(0.7);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(slideUpAnim, {
        toValue: 0,
        tension: 35,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(iconScaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentSlide, fadeAnim, slideUpAnim, iconScaleAnim]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [glowAnim, pulseAnim]);

  const handleGoogleSignIn = useCallback(async () => {
    try {
      setIsLoading(true);

      await GoogleSignin.hasPlayServices();
      const userInfoGoogle = await GoogleSignin.signIn();

      const userDataToSave = {
        id: userInfoGoogle.user.id,
        name: userInfoGoogle.user.name,
        email: userInfoGoogle.user.email,
        imageUrl: userInfoGoogle.user.photo,
        createdAt: new Date().toISOString(),
      };

      saveUserData(userDataToSave);
      setUserInfo(userDataToSave);

      markOnboardingComplete();
      navigation.replace("Reminder");

    } catch (error) {
      console.log("Google SignIn Error: ", error);
      Alert.alert("Sign-In Failed", "Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [saveUserData, markOnboardingComplete, navigation]);

  const handleNext = useCallback(() => {
    if (currentSlide < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentSlide + 1, animated: true });
    }
  }, [currentSlide]);

  const handleSkip = useCallback(() => {
    markOnboardingComplete();
    navigation.replace("Username");
  }, [navigation, markOnboardingComplete]);

  const handleContinue = useCallback(() => {
    markOnboardingComplete();
    navigation.replace("Username");
  }, [navigation, markOnboardingComplete]);

  const onScrollEnd = useCallback((event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlide(index);
  }, []);

  const glowOpacity = useMemo(() => glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.9],
  }), [glowAnim]);

  const keyExtractor = useCallback((_, index) => index.toString(), []);

  const getItemLayout = useCallback((_, index) => ({
    length: width,
    offset: width * index,
    index,
  }), []);

  // Optimized: Memoized render item - MUST be defined before conditional return
  const renderItem = useCallback(({ item }) => (
    <View style={[styles.slide, { width }]}>
      <Animated.View
        style={[
          styles.iconContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: Animated.multiply(iconScaleAnim, pulseAnim) }
            ],
          },
        ]}
      >
        <View style={[styles.iconOuterRing, { borderColor: item.iconColor + '30' }]} />
        <View style={[styles.iconMiddleRing, { borderColor: item.iconColor + '20' }]} />
        <LinearGradient
          colors={[item.iconColor + '25', item.iconSecondary + '15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconCircle}
        >
          <LinearGradient
            colors={[item.iconColor, item.iconSecondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <Ionicons name={item.icon} size={isSmallDevice ? 68 : 80} color="#FFFFFF" />
          </LinearGradient>
        </LinearGradient>
      </Animated.View>

      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }],
          },
        ]}
      >
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.actionContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }],
          },
        ]}
      >
        {item.isLast ? (
          userInfo ? (
            <View style={styles.welcomeContainer}>
              <View style={styles.checkmarkCircle}>
                <Ionicons name="checkmark-circle" size={48} color="#10B981" />
              </View>
              <Text style={styles.welcomeText}>Welcome back, {userInfo.name}!</Text>
              <Text style={styles.welcomeEmail}>{userInfo.email}</Text>
              <TouchableOpacity 
                style={styles.continueButton}
                onPress={handleContinue}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Animated.View
                style={[
                  styles.googleButtonWrapper,
                  {
                    shadowOpacity: glowOpacity,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.googleButton}
                  onPress={handleGoogleSignIn}
                  activeOpacity={0.8}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Text style={styles.googleText}>Connecting...</Text>
                  ) : (
                    <>
                      <GoogleLogo />
                      <Text style={styles.googleText}>Continue with Google</Text>
                    </>
                  )}
                </TouchableOpacity>
              </Animated.View>

              <TouchableOpacity style={styles.skipLinkContainer} onPress={handleSkip}>
                <Text style={styles.skipLinkText}>Skip for now</Text>
              </TouchableOpacity>
            </>
          )
        ) : (
          <Animated.View
            style={[
              styles.nextButtonWrapper,
              {
                shadowOpacity: glowOpacity,
              },
            ]}
          >
            <TouchableOpacity onPress={handleNext} style={styles.nextButton} activeOpacity={0.8}>
              <LinearGradient
                colors={[item.iconColor, item.iconSecondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.nextGradient}
              >
                <Text style={styles.nextText}>Next</Text>
                <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  ), [fadeAnim, slideUpAnim, iconScaleAnim, pulseAnim, glowOpacity, userInfo, isLoading, handleNext, handleSkip, handleContinue, handleGoogleSignIn]);

  const currentSlideData = SLIDES[currentSlide];

  // Show loading screen while checking onboarding status
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <LinearGradient colors={["#050014", "#0A0828"]} style={StyleSheet.absoluteFill} />
        <Text style={{ color: '#FFF', fontSize: 18 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <LinearGradient 
        colors={currentSlideData.gradient} 
        style={styles.gradientBackground}
        locations={[0, 0.3, 0.6, 1]}
      >
        <FloatingParticles />

        <View style={[styles.decorativeOrb, styles.orb1, { backgroundColor: currentSlideData.iconColor + '15' }]} />
        <View style={[styles.decorativeOrb, styles.orb2, { backgroundColor: currentSlideData.iconSecondary + '10' }]} />
        <View style={[styles.decorativeOrb, styles.orb3, { backgroundColor: currentSlideData.iconColor + '08' }]} />

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
          <Ionicons name="arrow-forward" size={16} color="#A5B4FC" />
        </TouchableOpacity>

        <FlatList
          ref={flatListRef}
          data={SLIDES}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          scrollEventThrottle={16}
          getItemLayout={getItemLayout}
          removeClippedSubviews={true}
          maxToRenderPerBatch={2}
          windowSize={3}
          initialNumToRender={1}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onMomentumScrollEnd={onScrollEnd}
        />

        <View style={styles.pagination}>
          {SLIDES.map((_, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 32, 8],
              extrapolate: "clamp",
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });

            const scale = scrollX.interpolate({
              inputRange,
              outputRange: [1, 1.2, 1],
              extrapolate: "clamp",
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity,
                    transform: [{ scale }],
                    backgroundColor: index === currentSlide 
                      ? currentSlideData.iconColor 
                      : "#FFFFFF",
                  },
                ]}
              />
            );
          })}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  particlesContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 0,
  },
  particle: {
    position: "absolute",
  },
  decorativeOrb: {
    position: "absolute",
    borderRadius: 999,
  },
  orb1: {
    width: 350,
    height: 350,
    top: -150,
    right: -120,
    opacity: 0.6,
  },
  orb2: {
    width: 250,
    height: 250,
    bottom: height * 0.15,
    left: -100,
    opacity: 0.5,
  },
  orb3: {
    width: 180,
    height: 180,
    top: height * 0.25,
    left: -60,
    opacity: 0.4,
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    zIndex: 1,
  },
  skipButton: {
    position: "absolute",
    top: 50,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: "rgba(165, 180, 252, 0.12)",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(165, 180, 252, 0.25)",
    zIndex: 100,
  },
  skipText: {
    color: "#A5B4FC",
    fontSize: 14,
    fontWeight: "600",
  },
  iconContainer: {
    marginBottom: 48,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  iconOuterRing: {
    position: "absolute",
    width: isSmallDevice ? 200 : 230,
    height: isSmallDevice ? 200 : 230,
    borderRadius: 115,
    borderWidth: 1,
    opacity: 0.3,
  },
  iconMiddleRing: {
    position: "absolute",
    width: isSmallDevice ? 170 : 195,
    height: isSmallDevice ? 170 : 195,
    borderRadius: 97.5,
    borderWidth: 1,
    opacity: 0.2,
  },
  iconCircle: {
    padding: 28,
    borderRadius: 100,
  },
  iconGradient: {
    width: isSmallDevice ? 120 : 140,
    height: isSmallDevice ? 120 : 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 56,
  },
  title: {
    color: "#FFFFFF",
    fontSize: isSmallDevice ? 32 : 38,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 18,
    letterSpacing: -1,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    color: "#C7D2FE",
    fontSize: isSmallDevice ? 15 : 17,
    textAlign: "center",
    lineHeight: 26,
    paddingHorizontal: 10,
    maxWidth: 360,
    opacity: 0.95,
  },
  actionContainer: {
    width: "100%",
    alignItems: "center",
  },
  nextButtonWrapper: {
    borderRadius: 50,
    shadowColor: "#38BDF8",
    shadowOffset: { width: 0, height: 14 },
    shadowRadius: 24,
    elevation: 15,
  },
  nextButton: {
    borderRadius: 50,
    overflow: "hidden",
  },
  nextGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 52,
    gap: 12,
  },
  nextText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 18,
    letterSpacing: 0.5,
  },
  googleButtonWrapper: {
    borderRadius: 50,
    shadowColor: "#38BDF8",
    shadowOffset: { width: 0, height: 14 },
    shadowRadius: 24,
    elevation: 15,
    marginBottom: 18,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: isSmallDevice ? 16 : 19,
    paddingHorizontal: isSmallDevice ? 34 : 40,
    borderRadius: 50,
    gap: 14,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
  },
  googleText: {
    color: "#1F2937",
    fontWeight: "700",
    fontSize: 17,
  },
  welcomeContainer: {
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    paddingVertical: 36,
    paddingHorizontal: 44,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  checkmarkCircle: {
    marginBottom: 16,
  },
  welcomeText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  welcomeEmail: {
    color: "#C7D2FE",
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: "#10B981",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginTop: 8,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  skipLinkContainer: {
    paddingVertical: 12,
  },
  skipLinkText: {
    color: "#A5B4FC",
    fontSize: 16,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  pagination: {
    flexDirection: "row",
    position: "absolute",
    bottom: 70,
    alignSelf: "center",
    gap: 10,
    zIndex: 100,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});