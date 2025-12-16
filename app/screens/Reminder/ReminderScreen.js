import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Alert,
  StatusBar,
  Dimensions,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import notifee, { 
  TimestampTrigger, 
  TriggerType, 
  RepeatFrequency,
  AndroidNotificationSetting 
} from '@notifee/react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");
const isSmallDevice = width < 375;

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function ReminderScreen() {
  const navigation = useNavigation();
  const [date, setDate] = useState(() => {
    const defaultTime = new Date();
    defaultTime.setHours(20, 0, 0, 0); // Default to 8:00 PM
    return defaultTime;
  });
  const [showPicker, setShowPicker] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(false);
  const [alarmPermission, setAlarmPermission] = useState(true); // Track alarm permission separately
  const [isLoading, setIsLoading] = useState(false);

  // Animations
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(30);
  const pulseAnim = useSharedValue(1);
  const iconRotate = useSharedValue(0);
  const cardScale = useSharedValue(0.9);

  useEffect(() => {
    // Entry animations
    fadeAnim.value = withTiming(1, { duration: 600 });
    slideAnim.value = withSpring(0, { damping: 15, stiffness: 80 });
    cardScale.value = withDelay(200, withSpring(1, { damping: 12 }));

    // Continuous pulse animation
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 2000 }),
        withTiming(1, { duration: 2000 })
      ),
      -1,
      false
    );

    // Rotating bell icon
    iconRotate.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 0 }),
        withDelay(3000, withTiming(15, { duration: 150 })),
        withTiming(-15, { duration: 150 }),
        withTiming(15, { duration: 150 }),
        withTiming(0, { duration: 150 })
      ),
      -1,
      false
    );
  }, [fadeAnim, slideAnim, cardScale, pulseAnim, iconRotate]);

  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  async function requestNotificationPermissions() {
    try {
      const settings = await notifee.requestPermission();

      if (settings.authorizationStatus >= 1) {
        console.log('Notification permission granted');
        setNotificationPermission(true);
        
        // Check alarm permission for Android 12+ (API 31+)
        if (Platform.OS === 'android' && Platform.Version >= 31) {
          if (settings.android.alarm === AndroidNotificationSetting.DISABLED) {
            console.log('Alarm permission NOT granted');
            setAlarmPermission(false);
          } else if (settings.android.alarm === AndroidNotificationSetting.ENABLED) {
            console.log('Alarm permission granted');
            setAlarmPermission(true);
          }
        }
      } else {
        console.log('Notification permission denied');
        setNotificationPermission(false);
      }

      // Create Android notification channel
      if (Platform.OS === 'android') {
        await notifee.createChannel({
          id: 'daily-reminder',
          name: 'Daily Reminder',
          sound: 'default',
          importance: 4, // HIGH importance
          vibration: true,
        });
        console.log('Android channel created');
      }
    } catch (err) {
      console.log('Permission error:', err);
    }
  }

  const onChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  async function scheduleDailyNotification() {
    try {
      // Step 1: Check notification permission
      const settings = await notifee.getNotificationSettings();
      
      if (settings.authorizationStatus < 1) {
        Alert.alert(
          'Enable Notifications',
          'Please allow notifications to set reminders.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => notifee.openNotificationSettings()
            }
          ]
        );
        return;
      }

      // Step 2: Check alarm permission for Android 12+ (API 31+)
      if (Platform.OS === 'android' && Platform.Version >= 31) {
        if (settings.android.alarm === AndroidNotificationSetting.DISABLED) {
          Alert.alert(
            'Alarm Permission Required',
            'To schedule exact daily reminders, you need to allow "Alarms & reminders" permission. This ensures notifications arrive at the exact time you set.\n\nWithout this permission, notifications may be delayed.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: async () => {
                  await notifee.openAlarmPermissionSettings();
                  // Re-check permission after user returns
                  setTimeout(async () => {
                    const updatedSettings = await notifee.getNotificationSettings();
                    if (updatedSettings.android.alarm === AndroidNotificationSetting.ENABLED) {
                      setAlarmPermission(true);
                      scheduleDailyNotification(); // Retry scheduling
                    }
                  }, 1000);
                },
              },
            ]
          );
          return;
        }
      }

      setIsLoading(true);

      // Cancel previous notifications and triggers
      await notifee.cancelAllNotifications();
      await notifee.cancelTriggerNotifications();
      console.log('Previous notifications cancelled');

      // Ensure channel exists (redundant but safe)
      if (Platform.OS === 'android') {
        await notifee.createChannel({
          id: 'daily-reminder',
          name: 'Daily Reminder',
          sound: 'default',
          importance: 4,
          vibration: true,
        });
      }

      // Calculate next trigger time
      const now = new Date();
      const selected = new Date(date);
      selected.setSeconds(0);
      selected.setMilliseconds(0);

      // If time has passed today, schedule for tomorrow
      if (selected <= now) {
        selected.setDate(selected.getDate() + 1);
      }

      console.log('Scheduling notification for:', selected.toLocaleString());

      // Create trigger configuration
      const trigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: selected.getTime(),
        repeatFrequency: RepeatFrequency.DAILY,
      };

      // Add alarmManager only if we have permission (Android 12+)
      let usingAlarmManager = false;
      if (Platform.OS === 'android') {
        if (Platform.Version >= 31) {
          // Android 12+: Only use alarmManager if permission granted
          const currentSettings = await notifee.getNotificationSettings();
          if (currentSettings.android.alarm === AndroidNotificationSetting.ENABLED) {
            trigger.alarmManager = true;
            usingAlarmManager = true;
            console.log('Using AlarmManager (Android 12+)');
          } else {
            console.log('AlarmManager not available, using standard trigger');
          }
        } else {
          // Android < 12: alarmManager doesn't require permission
          trigger.alarmManager = true;
          usingAlarmManager = true;
          console.log('Using AlarmManager (Android < 12)');
        }
      }

      // Schedule the notification
      const notificationId = await notifee.createTriggerNotification(
        {
          id: 'daily-learning-reminder',
          title: '📚 Time to Learn!',
          body: 'Your daily learning session is ready! Stay consistent 🚀',
          android: {
            channelId: 'daily-reminder',
            pressAction: { id: 'default' },
            importance: 4,
            sound: 'default',
            vibrationPattern: [300, 500],
            smallIcon: 'ic_notification', // Make sure you have this icon
            color: '#8B5CF6',
          },
          ios: {
            sound: 'default',
            critical: false,
            foregroundPresentationOptions: {
              badge: true,
              sound: true,
              banner: true,
              list: true,
            },
          },
        },
        trigger
      );

      console.log('Notification scheduled successfully:', notificationId);

      setIsLoading(false);

      // Show success message
      const timeString = selected.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      let message = `Daily reminder scheduled for ${timeString}`;
      if (Platform.OS === 'android' && Platform.Version >= 31 && !usingAlarmManager) {
        message += '\n\n⚠️ Note: For exact timing, enable "Alarms & reminders" in settings.';
      }

      Alert.alert(
        'Reminder Set! ✅',
        message,
        [
          {
            text: 'OK',
            onPress: () =>
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
              }),
          },
        ]
      );

    } catch (error) {
      console.log('Schedule error:', error);
      setIsLoading(false);
      Alert.alert('Error', `Could not schedule reminder: ${error.message}`);
    }
  }

  const handleSkip = () => {
    Alert.alert(
      "Skip Reminder?",
      "You can always set up reminders later from the settings.",
      [
        { text: "Go Back", style: "cancel" },
        {
          text: "Skip",
          style: "destructive",
          onPress: () => {
            setTimeout(() => {
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
            }, 100);
          },
        },
      ]
    );
  };

  const containerStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: pulseAnim.value },
      { rotate: `${iconRotate.value}deg` },
    ],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const timeFormatted = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Determine permission status text
  const getPermissionStatus = () => {
    if (!notificationPermission) {
      return "⚠️ Notification Permission Required";
    }
    if (Platform.OS === 'android' && Platform.Version >= 31 && !alarmPermission) {
      return "⚠️ Alarm Permission Recommended";
    }
    return "✓ Notifications Enabled";
  };

  const isPermissionIssue = !notificationPermission || 
    (Platform.OS === 'android' && Platform.Version >= 31 && !alarmPermission);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <LinearGradient
        colors={["#0F0A1E", "#1A0B2E", "#2D1549", "#4A1E6B"]}
        locations={[0, 0.3, 0.7, 1]}
        style={styles.gradient}
      >
        {/* Background decorative elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        <View style={styles.decorativeCircle3} />

        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.7}>
          <Text style={styles.skipText}>Skip for now</Text>
          <Ionicons name="arrow-forward" size={16} color="#A5B4FC" />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Animated.View style={[styles.content, containerStyle]}>
            {/* Animated Icon */}
            <Animated.View style={[styles.iconContainer, iconStyle]}>
              <LinearGradient
                colors={["rgba(56, 189, 248, 0.25)", "rgba(139, 92, 246, 0.25)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconGradient}
              >
                <View style={styles.iconInner}>
                  <LinearGradient
                    colors={["#38BDF8", "#8B5CF6"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.iconBackground}
                  >
                    <Ionicons name="notifications-outline" size={56} color="#FFFFFF" />
                    <View style={styles.notificationBadge}>
                      <View style={styles.badgePulse} />
                    </View>
                  </LinearGradient>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Header */}
            <Text style={styles.title}>Set Your Daily Reminder</Text>
            <Text style={styles.subtitle}>
              Build a consistent learning habit with daily notifications
            </Text>

            {/* Time Card */}
            <Animated.View style={[styles.timeCard, cardStyle]}>
              <LinearGradient
                colors={[
                  "rgba(56, 189, 248, 0.15)",
                  "rgba(139, 92, 246, 0.15)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.timeCardGradient}
              >
                <Text style={styles.timeLabel}>⏰ REMINDER TIME</Text>

                <TouchableOpacity
                  style={styles.timeDisplay}
                  onPress={() => setShowPicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.timeText}>{timeFormatted}</Text>
                  <View style={styles.editIconContainer}>
                    <LinearGradient
                      colors={["#38BDF8", "#8B5CF6"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.editIconGradient}
                    >
                      <Ionicons name="pencil-outline" size={18} color="#FFFFFF" />
                    </LinearGradient>
                  </View>
                </TouchableOpacity>

                <Text style={styles.tapHint}>Tap to customize your time</Text>

                {showPicker && (
                  <View style={styles.pickerContainer}>
                    <DateTimePicker
                      value={date}
                      mode="time"
                      is24Hour={false}
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={onChange}
                      textColor="#ffffff"
                      themeVariant="dark"
                    />
                  </View>
                )}

                {/* Status */}
                <View style={styles.statusContainer}>
                  <View style={styles.statusBadge}>
                    <View
                      style={[
                        styles.statusDot,
                        !isPermissionIssue && styles.statusDotActive,
                      ]}
                    />
                    <Text style={styles.statusText}>
                      {getPermissionStatus()}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Benefits List */}
            <View style={styles.benefits}>
              <Text style={styles.benefitsTitle}>Why daily reminders work:</Text>
              
              {[
                { icon: "flame-outline", text: "Build a consistent learning streak", color: "#F59E0B" },
                { icon: "trending-up-outline", text: "Track your progress over time", color: "#10B981" },
                { icon: "trophy-outline", text: "Achieve your coding goals faster", color: "#8B5CF6" },
              ].map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <View style={[styles.benefitIcon, { backgroundColor: benefit.color + "20" }]}>
                    <Ionicons name={benefit.icon} size={20} color={benefit.color} />
                  </View>
                  <Text style={styles.benefitText}>{benefit.text}</Text>
                </View>
              ))}
            </View>

            {/* Action Button */}
            <AnimatedTouchable
              style={styles.primaryButton}
              onPress={scheduleDailyNotification}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              <LinearGradient
                colors={["#38BDF8", "#8B5CF6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryGradient}
              >
                {isLoading ? (
                  <Text style={styles.primaryButtonText}>Setting up...</Text>
                ) : (
                  <>
                    <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
                    <Text style={styles.primaryButtonText}>Set Daily Reminder</Text>
                    <Ionicons name="arrow-forward-circle-outline" size={22} color="#FFFFFF" />
                  </>
                )}
              </LinearGradient>
            </AnimatedTouchable>

            {/* Footer Note */}
            <Text style={styles.footerNote}>
              You can change this anytime in settings
            </Text>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  decorativeCircle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(56, 189, 248, 0.05)",
    top: -100,
    right: -100,
  },
  decorativeCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(139, 92, 246, 0.05)",
    bottom: -50,
    left: -50,
  },
  decorativeCircle3: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(56, 189, 248, 0.03)",
    top: height * 0.3,
    left: -75,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconGradient: {
    borderRadius: 40,
    padding: 6,
    borderWidth: 2,
    borderColor: "rgba(56, 189, 248, 0.3)",
    shadowColor: "#38BDF8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  iconInner: {
    borderRadius: 34,
    overflow: "hidden",
  },
  iconBackground: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#EF4444",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  badgePulse: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#EF4444",
    opacity: 0.6,
  },
  title: {
    fontSize: isSmallDevice ? 28 : 32,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: isSmallDevice ? 15 : 16,
    color: "#C7D2FE",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  timeCard: {
    width: "100%",
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(56, 189, 248, 0.25)",
    marginBottom: 32,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  timeCardGradient: {
    padding: 28,
    alignItems: "center",
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#A5B4FC",
    letterSpacing: 1.5,
    marginBottom: 20,
  },
  timeDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 12,
  },
  timeText: {
    fontSize: isSmallDevice ? 48 : 56,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -2,
  },
  editIconContainer: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#38BDF8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  editIconGradient: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  tapHint: {
    fontSize: 14,
    color: "#94A3B8",
    marginBottom: 20,
    fontWeight: "500",
  },
  pickerContainer: {
    marginVertical: 16,
  },
  statusContainer: {
    width: "100%",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#EF4444",
    marginRight: 10,
  },
  statusDotActive: {
    backgroundColor: "#10B981",
  },
  statusText: {
    fontSize: 14,
    color: "#E2E8F0",
    fontWeight: "600",
  },
  benefits: {
    width: "100%",
    marginBottom: 32,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#E2E8F0",
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  benefitText: {
    fontSize: 15,
    color: "#E2E8F0",
    fontWeight: "600",
    flex: 1,
    lineHeight: 20,
  },
  primaryButton: {
    width: "100%",
    borderRadius: 50,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#38BDF8",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  primaryGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 10,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  footerNote: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    fontWeight: "500",
  },
  skipButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 40,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: "rgba(165, 180, 252, 0.15)",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(165, 180, 252, 0.3)",
    zIndex: 100,
  },
  skipText: {
    color: "#A5B4FC",
    fontSize: 14,
    fontWeight: "600",
  },
});