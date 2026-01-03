import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Svg, Path } from "react-native-svg";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import LinearGradient from "react-native-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getJSON, setJSON, removeKey } from '../../utils/Storage';
import { auth } from "../../utils/firebase";

const { width } = Dimensions.get('window');

// Storage Keys
const STORAGE_KEYS = {
  USER_DATA: '@user_data',
  HAS_COMPLETED_ONBOARDING: '@has_completed_onboarding',
  LAST_LOGIN: '@last_login',
};



export default function UserProfileScreen() {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    loadUserData();
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Check if user is already signed in
  const checkSignInStatus = async () => {
    try {
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (isSignedIn) {
        const userInfo = await GoogleSignin.signInSilently();
        if (userInfo?.user) {
          const userData = {
            uid: userInfo.user.id,
            name: userInfo.user.name,
            email: userInfo.user.email,
            imageUrl: userInfo.user.photo,
            createdAt: new Date().toISOString(),
          };
          setUser(userData);
          await saveUserData(userData);
        }
      }
    } catch (error) {
      console.log('Not signed in:', error);
    }
  };

  // Load user data from storage
  const loadUserData = async () => {
    try {
      console.log('📱 Loading user data...');
      
      const userData = await getJSON(STORAGE_KEYS.USER_DATA);
      
      if (userData) {
        console.log('✅ User data loaded:', userData.name);
        setUser(userData);
      } else {
        console.log('⚠️ No user data found');
        await checkSignInStatus();
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save user data to storage
  const saveUserData = async (userData) => {
    try {
      console.log('💾 Saving user data...');
      await setJSON(STORAGE_KEYS.USER_DATA, userData);
      await setJSON(STORAGE_KEYS.LAST_LOGIN, new Date().toISOString());
      console.log('✅ User data saved');
    } catch (error) {
      console.error('❌ Error saving user data:', error);
    }
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    if (signingIn) return;
    
    setSigningIn(true);
    
    try {
      console.log('🔐 Starting Google Sign-In...');

      // Check Play Services (Android only)
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });
      }

      // Sign out first to force account picker
      try {
        await GoogleSignin.signOut();
      } catch (e) {
        // Ignore if not signed in
      }

      console.log('📱 Opening sign-in prompt...');
      const response = await GoogleSignin.signIn();
      console.log('✅ Sign-in response:', response);

      // Handle different response structures
      const userInfo = response.data || response;
      const idToken = userInfo.idToken;

      if (!idToken) {
        throw new Error('No ID token received from Google Sign-In');
      }

      console.log('🔑 ID Token received, authenticating with Firebase...');

      // Create Firebase credential
      const googleCredential = GoogleAuthProvider.credential(idToken);

      // Sign in with Firebase
      const userCredential = await signInWithCredential(auth, googleCredential);
      const firebaseUser = userCredential.user;

      console.log('✅ Firebase authentication successful');

      // Create user data object
      const userData = {
        uid: firebaseUser.uid,
        id: firebaseUser.uid,
        name: firebaseUser.displayName || userInfo.user?.name || 'User',
        email: firebaseUser.email || userInfo.user?.email,
        imageUrl: firebaseUser.photoURL || userInfo.user?.photo,
        createdAt: new Date().toISOString(),
      };

      console.log('👤 User data:', userData);

      // Save and set user
      setUser(userData);
      await saveUserData(userData);

      Alert.alert(
        'Welcome! 🎉',
        `Signed in as ${userData.name}`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('❌ Sign-in error:', error);
      
      let errorMessage = 'Failed to sign in. Please try again.';

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMessage = 'Sign-in was cancelled';
        console.log('User cancelled sign-in');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        errorMessage = 'Sign-in already in progress';
        console.log('Sign-in already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessage = 'Play Services not available or outdated';
        console.log('Play services not available');
      } else if (error.message?.includes('DEVELOPER_ERROR')) {
        errorMessage = 'Configuration error. Please check SHA-1 certificate and Firebase setup.';
        console.error('DEVELOPER_ERROR: Check SHA-1 fingerprint in Firebase Console');
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection.';
      }

      // Only show alert for actual errors (not cancellations)
      if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('Sign-In Error', errorMessage, [{ text: 'OK' }]);
      }
    } finally {
      setSigningIn(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🚪 Logging out...');

              // Sign out from Google
              await GoogleSignin.signOut();

              // Sign out from Firebase
              await auth.signOut();

              // Clear all user-related data
              await removeKey(STORAGE_KEYS.USER_DATA);
              await removeKey(STORAGE_KEYS.LAST_LOGIN);
              await removeKey(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING);

              console.log('✅ User data cleared');
              setUser(null);
              
              Alert.alert('Logged Out', 'You have been successfully logged out.', [
                { 
                  text: 'OK',
                  onPress: () => navigation.navigate("Onboarding")
                }
              ]);
            } catch (error) {
              console.error('❌ Error logging out:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    { icon: "settings-outline", title: "Settings", route: "Settings", color: "#8B5CF6" },
    { icon: "help-circle-outline", title: "Help & Support", route: "Support", color: "#10B981" },
  ];

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={["#0A0118", "#1A0B2E", "#2D1B4E"]}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#38BDF8" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Not logged in view
  if (!user) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        <LinearGradient
          colors={["#0A0118", "#1A0B2E", "#2D1B4E"]}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile</Text>
            <View style={styles.placeholder} />
          </View>

          <Animated.View 
            style={[
              styles.notLoggedInContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
              }
            ]}
          >
            <View style={styles.emptyStateIcon}>
              <LinearGradient
                colors={["#38BDF8", "#8B5CF6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.emptyStateGradient}
              >
                <Ionicons name="person-outline" size={48} color="#FFFFFF" />
              </LinearGradient>
            </View>

            <Text style={styles.emptyTitle}>Start Your Journey</Text>
            <Text style={styles.emptySubtitle}>
              Sign in to unlock personalized learning and track your progress
            </Text>

            <TouchableOpacity
              style={styles.signInButton}
              onPress={handleGoogleSignIn}
              activeOpacity={0.8}
              disabled={signingIn}
            >
              <LinearGradient
                colors={["#38BDF8", "#8B5CF6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.signInGradient}
              >
                {signingIn ? (
                  <>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.signInText}>Signing in...</Text>
                  </>
                ) : (
                  <>
                    <Svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <Path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#FFFFFF"/>
                      <Path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#FFFFFF"/>
                      <Path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FFFFFF"/>
                      <Path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#FFFFFF"/>
                    </Svg>
                    <Text style={styles.signInText}>Continue with Google</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </LinearGradient>
      </View>
    );
  }

  // Logged in view
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={["#0A0118", "#1A0B2E", "#2D1B4E"]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
              }
            ]}
          >
            {/* Profile Header */}
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ 
                    uri: user?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=38BDF8&color=fff&size=200`
                  }}
                  style={styles.avatar}
                />
                <View style={styles.onlineBadge} />
              </View>

              <Text style={styles.userName}>{user?.name || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'No email'}</Text>

              {/* User ID Badge */}
              {user?.uid && (
                <View style={styles.idBadge}>
                  <Ionicons name="finger-print" size={14} color="#8B5CF6" />
                  <Text style={styles.idText}>ID: {user.uid.slice(0, 8)}...</Text>
                </View>
              )}

              {/* Quick Stats */}
              <View style={styles.quickStats}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>0</Text>
                  <Text style={styles.statLabel}>Courses</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>0</Text>
                  <Text style={styles.statLabel}>Certificates</Text>
                </View>
              </View>

              {/* Member Since */}
              {user?.createdAt && (
                <View style={styles.memberSince}>
                  <Ionicons name="calendar-outline" size={14} color="#A5B4FC" />
                  <Text style={styles.memberSinceText}>
                    Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </Text>
                </View>
              )}
            </View>

            {/* Menu Grid */}
            <View style={styles.menuGrid}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuCard}
                  onPress={() => navigation.navigate(item.route)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIconWrapper, { backgroundColor: item.color + '20' }]}>
                    <Ionicons name={item.icon} size={24} color={item.color} />
                  </View>
                  <Text style={styles.menuCardTitle}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Logout Button */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

// Import status codes
const statusCodes = GoogleSignin.statusCodes || {
  SIGN_IN_CANCELLED: '0',
  IN_PROGRESS: '1',
  PLAY_SERVICES_NOT_AVAILABLE: '2',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#A5B4FC',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholder: {
    width: 40,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
    marginRight: 37,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  content: {
    paddingHorizontal: 20,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#38BDF8",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#10B981",
    borderWidth: 3,
    borderColor: "#1A0B2E",
  },
  userName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  userEmail: {
    fontSize: 14,
    color: "#A5B4FC",
    marginBottom: 12,
  },
  idBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 20,
  },
  idText: {
    fontSize: 11,
    color: '#C7D2FE',
    fontWeight: '600',
  },
  memberSince: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  memberSinceText: {
    fontSize: 12,
    color: '#A5B4FC',
    fontWeight: '500',
  },
  quickStats: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(56, 189, 248, 0.1)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.2)",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#38BDF8",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#A5B4FC",
    fontWeight: "600",
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  menuCard: {
    width: (width - 52) / 2,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  menuIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  menuCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
    gap: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#EF4444",
  },
  notLoggedInContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyStateIcon: {
    marginBottom: 24,
    borderRadius: 32,
    overflow: "hidden",
  },
  emptyStateGradient: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#C7D2FE",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  signInButton: {
    borderRadius: 40,
    overflow: "hidden",
    shadowColor: "#38BDF8",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  signInGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 10,
  },
  signInText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});