import React, { useState, useEffect, useCallback, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { getString, setString } from '../../utils/Storage';

const { width, height } = Dimensions.get("window");

// Floating Particles Background
const FloatingParticle = memo(({ index }) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  const randomLeft = Math.random() * width;
  const randomTop = Math.random() * height;
  const randomSize = 3 + Math.random() * 4;

  useEffect(() => {
    const duration = 4000 + index * 300;
    
    translateY.value = withRepeat(
      withSequence(
        withTiming(-100 - Math.random() * 50, { duration }),
        withTiming(0, { duration: 0 })
      ),
      -1
    );

    translateX.value = withRepeat(
      withSequence(
        withTiming(20 - Math.random() * 40, { duration: duration / 2 }),
        withTiming(0, { duration: duration / 2 })
      ),
      -1,
      true
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 2000 }),
        withTiming(0.2, { duration: 2000 })
      ),
      -1,
      true
    );

    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 3000 }),
        withTiming(0.8, { duration: 3000 })
      ),
      -1,
      true
    );
  }, [index, translateY, translateX, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: randomLeft,
          top: randomTop,
          width: randomSize,
          height: randomSize,
          borderRadius: randomSize / 2,
        },
        animatedStyle,
      ]}
    />
  );
});

// Animated Background Orbs
const BackgroundOrb = memo(({ color, size, position }) => {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    rotate.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1
    );
  }, [scale, rotate]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.backgroundOrb,
        {
          width: size,
          height: size,
          backgroundColor: color,
          ...position,
        },
        animatedStyle,
      ]}
    />
  );
});

export default function UsernameInputScreen() {
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Animation values
  const containerScale = useSharedValue(0.9);
  const containerOpacity = useSharedValue(0);
  const inputScale = useSharedValue(1);
  const buttonScale = useSharedValue(1);
  const errorShake = useSharedValue(0);

  const checkExistingUsername = useCallback(() => {
    try {
      const savedUsername = getString("username");
      if (savedUsername) {
        setUsername(savedUsername);
      }
    } catch (error) {
      console.error("Error checking username:", error);
    }
  }, []);

  useEffect(() => {
    // Entrance animation
    containerOpacity.value = withTiming(1, { duration: 800 });
    containerScale.value = withSpring(1, {
      damping: 15,
      stiffness: 100,
    });

    // Check if username already exists
    checkExistingUsername();
  }, [checkExistingUsername, containerOpacity, containerScale]);

  const handleSaveUsername = useCallback(async () => {
    if (!username.trim()) {
      setError("Please enter a username");
      errorShake.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      errorShake.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      return;
    }

    setError("");
    setIsLoading(true);
    buttonScale.value = withSpring(0.95);

    try {
      setString("username", username.trim());
      
      // Success animation
      buttonScale.value = withSequence(
        withSpring(1.1),
        withSpring(1)
      );

      // Navigate after short delay
      setTimeout(() => {
        navigation.replace("Reminder");
      }, 500);
    } catch (error) {
      console.error("Error saving username:", error);
      setError("Failed to save username");
      errorShake.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    } finally {
      setIsLoading(false);
      buttonScale.value = withSpring(1);
    }
  }, [username, navigation, errorShake, buttonScale]);

  const handleInputFocus = useCallback(() => {
    inputScale.value = withSpring(1.02);
    setError("");
  }, [inputScale]);

  const handleInputBlur = useCallback(() => {
    inputScale.value = withSpring(1);
  }, [inputScale]);

  const containerAnimStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ scale: containerScale.value }],
  }));

  const inputAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: inputScale.value }],
  }));

  const buttonAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const errorAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: errorShake.value }],
  }));

  const particles = Array.from({ length: 20 });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <LinearGradient
        colors={["#0F0420", "#1A0B2E", "#2D1B4E", "#1A0B2E", "#0F0420"]}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={styles.background}
      >
        {/* Animated Background Orbs */}
        <BackgroundOrb
          color="rgba(139, 92, 246, 0.15)"
          size={300}
          position={{ top: -100, right: -100 }}
        />
        <BackgroundOrb
          color="rgba(236, 72, 153, 0.12)"
          size={250}
          position={{ bottom: -50, left: -80 }}
        />
        <BackgroundOrb
          color="rgba(56, 189, 248, 0.1)"
          size={200}
          position={{ top: height * 0.4, left: -50 }}
        />

        {/* Floating Particles */}
        {particles.map((_, i) => (
          <FloatingParticle key={i} index={i} />
        ))}

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <Animated.View style={[styles.contentContainer, containerAnimStyle]}>
            {/* Logo/Icon Section */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <LinearGradient
                  colors={["#8B5CF6", "#EC4899", "#8B5CF6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.logoGradient}
                >
                  <Ionicons name="person-outline" size={56} color="#FFFFFF" />
                </LinearGradient>
              </View>
              
              {/* Pulse Ring */}
              <View style={styles.pulseRing} />
            </View>

            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>Welcome!</Text>
              <Text style={styles.subtitle}>Let's personalize your experience</Text>
            </View>

            {/* Glass Input Container */}
            <Animated.View style={[styles.inputWrapper, inputAnimStyle]}>
              <LinearGradient
                colors={[
                  "rgba(255, 255, 255, 0.1)",
                  "rgba(255, 255, 255, 0.05)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.inputGradientBorder}
              >
                <View style={styles.inputContainer}>
                  <View style={styles.inputIconContainer}>
                    <Ionicons name="at-outline" size={24} color="#8B5CF6" />
                  </View>
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your username"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={username}
                    onChangeText={setUsername}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={20}
                  />

                  {username.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setUsername("")}
                      style={styles.clearButton}
                    >
                      <Ionicons name="close-circle" size={20} color="rgba(255, 255, 255, 0.6)" />
                    </TouchableOpacity>
                  )}
                </View>
              </LinearGradient>

              {/* Character Counter */}
              <Text style={styles.characterCounter}>{username.length}/20</Text>
            </Animated.View>

            {/* Error Message */}
            {error ? (
              <Animated.View style={[styles.errorContainer, errorAnimStyle]}>
                <Ionicons name="alert-circle" size={16} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            ) : null}

            {/* Continue Button */}
            <Animated.View style={buttonAnimStyle}>
              <TouchableOpacity
                onPress={handleSaveUsername}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#8B5CF6", "#EC4899", "#8B5CF6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  locations={[0, 0.5, 1]}
                  style={styles.continueButton}
                >
                  <View style={styles.buttonContent}>
                    {isLoading ? (
                      <View style={styles.loadingDots}>
                        <View style={[styles.dot, styles.dot1]} />
                        <View style={[styles.dot, styles.dot2]} />
                        <View style={[styles.dot, styles.dot3]} />
                      </View>
                    ) : (
                      <>
                        <Text style={styles.buttonText}>Continue</Text>
                        <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
                      </>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Info Text */}
            <View style={styles.infoContainer}>
              <Ionicons name="information-circle-outline" size={16} color="rgba(255, 255, 255, 0.5)" />
              <Text style={styles.infoText}>
                Your username will be saved locally on your device
              </Text>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0420",
  },
  background: {
    flex: 1,
  },
  particle: {
    position: "absolute",
    backgroundColor: "rgba(139, 92, 246, 0.6)",
  },
  backgroundOrb: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.6,
  },
  keyboardView: {
    flex: 1,
    justifyContent: "center",
  },
  contentContainer: {
    paddingHorizontal: 32,
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    elevation: 20,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  logoGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: "rgba(139, 92, 246, 0.3)",
  },
  titleSection: {
    marginBottom: 48,
    alignItems: "center",
  },
  title: {
    fontSize: 42,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
    textAlign: "center",
  },
  inputWrapper: {
    width: "100%",
    marginBottom: 16,
  },
  inputGradientBorder: {
    borderRadius: 24,
    padding: 2,
    elevation: 10,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 4, 32, 0.6)",
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  inputIconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "600",
    paddingVertical: 18,
  },
  clearButton: {
    padding: 4,
  },
  characterCounter: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 8,
    marginLeft: 4,
    fontWeight: "600",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "600",
  },
  continueButton: {
    width: width - 64,
    borderRadius: 28,
    overflow: "hidden",
    elevation: 15,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 12,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  loadingDots: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 32,
    gap: 8,
    paddingHorizontal: 16,
  },
  infoText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.5)",
    fontWeight: "500",
    flex: 1,
  },
});