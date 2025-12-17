import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
  withRepeat,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../utils/firebase";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import NetInfo from "@react-native-community/netinfo";
import { getJSON, setJSON } from '../../utils/Storage';

const { width, height } = Dimensions.get("window");

// Constants
const TIMER_DURATION = 30;
const BASE_POINTS = 10;
const STREAK_BONUS = 5;
const MIN_STREAK_FOR_BONUS = 2;
const TIME_BONUS_DIVISOR = 3;
const PASSING_PERCENTAGE = 70;
const MAX_LIVES = 3;
const CACHE_EXPIRY = 3600000; // 1 hour in milliseconds

// Utility Functions
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const calculatePoints = (streak, timeLeft) => {
  const streakBonus = streak >= MIN_STREAK_FOR_BONUS ? STREAK_BONUS : 0;
  const timeBonus = Math.floor(timeLeft / TIME_BONUS_DIVISOR);
  return BASE_POINTS + streakBonus + timeBonus;
};

// Cache Management
const CACHE_KEYS = {
  QUESTIONS: (category) => `quiz_questions_${category}`,
  TIMESTAMP: (category) => `quiz_timestamp_${category}`,
};

const getCachedQuestions = async (category) => {
  try {
    const questions = await getJSON(CACHE_KEYS.QUESTIONS(category));
    const timestamp = await getJSON(CACHE_KEYS.TIMESTAMP(category));
    
    if (questions && timestamp) {
      const age = Date.now() - timestamp;
      if (age < CACHE_EXPIRY) {
        console.log(`📦 Using cached questions for ${category} (${Math.round(age / 60000)}m old)`);
        return questions;
      }
    }
    return null;
  } catch (error) {
    console.warn("Cache read error:", error);
    return null;
  }
};

const cacheQuestions = async (category, questions) => {
  try {
    await setJSON(CACHE_KEYS.QUESTIONS(category), questions);
    await setJSON(CACHE_KEYS.TIMESTAMP(category), Date.now());
    console.log(`💾 Cached ${questions.length} questions for ${category}`);
  } catch (error) {
    console.warn("Cache write error:", error);
  }
};

// Network Status Hook
const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
      setIsInternetReachable(state.isInternetReachable ?? false);
    });

    return () => unsubscribe();
  }, []);

  return { isConnected, isInternetReachable };
};

// Quiz Questions Fetcher with Error Handling
class QuizFetchError extends Error {
  constructor(message, type) {
    super(message);
    this.type = type; // 'network', 'firebase', 'empty', 'unknown'
    this.name = 'QuizFetchError';
  }
}

const fetchQuizQuestions = async (category) => {
  try {
    // Check network first
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      throw new QuizFetchError('No internet connection', 'network');
    }

    // Try cache first
    const cached = await getCachedQuestions(category);
    if (cached) {
      return cached;
    }

    // Fetch from Firebase
    if (category.toLowerCase() === "mix") {
      return await fetchMixedQuestions();
    }
    
    const questionsSnapshot = await getDocs(
      collection(db, `quizzes/${category}/questions`)
    );
    
    if (questionsSnapshot.empty) {
      throw new QuizFetchError('No questions available', 'empty');
    }

    const questions = questionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      category: category,
      ...doc.data(),
    }));
    
    const shuffled = shuffleArray(questions);
    
    // Cache the questions
    await cacheQuestions(category, shuffled);
    
    return shuffled;
  } catch (error) {
    if (error instanceof QuizFetchError) {
      throw error;
    }
    
    if (error.code === 'unavailable' || error.message.includes('network')) {
      throw new QuizFetchError('Network error. Please check your connection.', 'network');
    }
    
    console.error("Quiz fetch error:", error);
    throw new QuizFetchError('Failed to load questions. Please try again.', 'firebase');
  }
};

const fetchMixedQuestions = async () => {
  const categories = [
    "html", "css", "js", "react", "nodejs",
    "nextjs", "mongodb", "expressjs", "redis"
  ];
  
  const allQuestions = [];
  const failedCategories = [];
  
  await Promise.allSettled(
    categories.map(async (category) => {
      try {
        const questionsSnapshot = await getDocs(
          collection(db, `quizzes/${category}/questions`)
        );
        
        const categoryQuestions = questionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          category: category,
          ...doc.data(),
        }));
        
        allQuestions.push(...categoryQuestions);
      } catch (error) {
        console.warn(`Failed to fetch ${category}:`, error);
        failedCategories.push(category);
      }
    })
  );
  
  if (allQuestions.length === 0) {
    throw new QuizFetchError('No questions available', 'empty');
  }
  
  const shuffled = shuffleArray(allQuestions);
  const questionsToReturn = shuffled.slice(0, Math.min(50, shuffled.length));
  
  console.log(`✅ Mixed quiz: ${questionsToReturn.length} questions from ${categories.length - failedCategories.length} categories`);
  
  return questionsToReturn;
};

// Floating Particle Component (Memoized)
const FloatingParticle = React.memo(({ delay = 0 }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(-30, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0, { duration: 1500 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const particleStyle = useMemo(() => ({
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#8B5CF6',
    left: Math.random() * width,
    top: Math.random() * 100,
  }), []);

  return <Animated.View style={[particleStyle, animatedStyle]} />;
});

// Timer Component (Optimized)
const TimerBar = React.memo(({ timeLeft, maxTime = TIMER_DURATION }) => {
  const progress = useSharedValue(100);

  useEffect(() => {
    progress.value = withTiming((timeLeft / maxTime) * 100, { duration: 300 });
  }, [timeLeft, maxTime]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  const timerColors = useMemo(() => {
    if (timeLeft <= 5) return ['#EF4444', '#DC2626'];
    if (timeLeft <= 10) return ['#F59E0B', '#D97706'];
    return ['#10B981', '#059669'];
  }, [timeLeft]);

  return (
    <View style={styles.timerContainer}>
      <View style={styles.timerTrack}>
        <Animated.View style={[styles.timerFill, animatedStyle]}>
          <LinearGradient
            colors={timerColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.timerGradient}
          />
        </Animated.View>
      </View>
      <View style={styles.timerBadge}>
        <Ionicons name="time" size={16} color="#FFFFFF" />
        <Text style={styles.timerText}>{timeLeft}s</Text>
      </View>
    </View>
  );
});

// Lives Component (Optimized)
const LivesDisplay = React.memo(({ lives }) => (
  <View style={styles.livesContainer}>
    {[...Array(MAX_LIVES)].map((_, i) => (
      <View
        key={i}
        style={[styles.heartContainer, { opacity: i < lives ? 1 : 0.3 }]}
      >
        <Ionicons
          name={i < lives ? "heart" : "heart-outline"}
          size={24}
          color={i < lives ? "#EF4444" : "#6B7280"}
        />
      </View>
    ))}
  </View>
));

// Streak Display Component (Optimized)
const StreakDisplay = React.memo(({ streak }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (streak > 0) {
      scale.value = withSequence(withSpring(1.2), withSpring(1));
    }
  }, [streak]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (streak === 0) return null;

  return (
    <Animated.View style={[styles.streakContainer, animatedStyle]}>
      <LinearGradient
        colors={['#F59E0B', '#EF4444']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.streakGradient}
      >
        <Ionicons name="flame" size={20} color="#FFFFFF" />
        <Text style={styles.streakText}>{streak}x Streak!</Text>
      </LinearGradient>
    </Animated.View>
  );
});

// Points Earned Animation (Optimized)
const PointsEarned = React.memo(({ points, visible }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible && points > 0) {
      translateY.value = 0;
      opacity.value = 1;
      translateY.value = withTiming(-50, { duration: 1000 });
      opacity.value = withTiming(0, { duration: 1000 });
    }
  }, [visible, points]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible || points === 0) return null;

  return (
    <Animated.View style={[styles.pointsEarnedContainer, animatedStyle]}>
      <LinearGradient colors={['#10B981', '#059669']} style={styles.pointsEarnedBadge}>
        <Text style={styles.pointsEarnedText}>+{points}</Text>
      </LinearGradient>
    </Animated.View>
  );
});

// Progress Bar Component (Optimized)
const ProgressBar = React.memo(({ current, total }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring((current / total) * 100, {
      damping: 20,
      stiffness: 90,
    });
  }, [current, total]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  return (
    <View style={styles.progressBarContainer}>
      <Animated.View style={[styles.progressBarFill, animatedStyle]}>
        <LinearGradient
          colors={["#38BDF8", "#8B5CF6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.progressGradient}
        />
      </Animated.View>
      <Text style={styles.progressText}>{current} / {total}</Text>
    </View>
  );
});

// Option Button Component (Optimized)
const OptionButton = React.memo(({ 
  option, 
  index, 
  isSelected, 
  isCorrect, 
  isWrong, 
  onPress, 
  disabled 
}) => {
  const scale = useSharedValue(1);
  const backgroundColor = useSharedValue(0);

  useEffect(() => {
    if (isCorrect) {
      backgroundColor.value = withTiming(1, { duration: 300 });
      scale.value = withSequence(withSpring(1.05), withSpring(1));
    } else if (isWrong) {
      backgroundColor.value = withTiming(2, { duration: 300 });
      scale.value = withSequence(withSpring(0.95), withSpring(1));
    } else if (isSelected) {
      backgroundColor.value = withTiming(0, { duration: 200 });
    }
  }, [isCorrect, isWrong, isSelected]);

  const animatedStyle = useAnimatedStyle(() => {
    const bgColor = backgroundColor.value;
    let color = "rgba(255, 255, 255, 0.08)";
    let borderColor = "rgba(255, 255, 255, 0.15)";

    if (bgColor > 1.5) {
      color = "rgba(239, 68, 68, 0.2)";
      borderColor = "rgba(239, 68, 68, 0.5)";
    } else if (bgColor > 0.5) {
      color = "rgba(16, 185, 129, 0.2)";
      borderColor = "rgba(16, 185, 129, 0.5)";
    }

    return {
      transform: [{ scale: scale.value }],
      backgroundColor: color,
      borderColor,
    };
  });

  const handlePressIn = useCallback(() => {
    if (!disabled) scale.value = withSpring(0.97);
  }, [disabled]);

  const handlePressOut = useCallback(() => {
    if (!disabled) scale.value = withSpring(1);
  }, [disabled]);

  const optionLabels = useMemo(() => ["A", "B", "C", "D"], []);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View style={[styles.optionButton, animatedStyle]}>
        <View style={[
          styles.optionLabel,
          isCorrect && styles.optionLabelCorrect,
          isWrong && styles.optionLabelWrong,
        ]}>
          <Text style={[
            styles.optionLabelText,
            (isCorrect || isWrong) && styles.optionLabelTextActive,
          ]}>
            {optionLabels[index]}
          </Text>
        </View>
        <Text style={[
          styles.optionText,
          isCorrect && styles.optionTextCorrect,
          isWrong && styles.optionTextWrong,
        ]}>
          {option}
        </Text>
        {isCorrect && <Ionicons name="checkmark-circle" size={24} color="#10B981" />}
        {isWrong && <Ionicons name="close-circle" size={24} color="#EF4444" />}
      </Animated.View>
    </TouchableOpacity>
  );
});

// Error Display Component
const ErrorDisplay = ({ error, onRetry, onGoBack }) => {
  const getErrorInfo = () => {
    switch (error.type) {
      case 'network':
        return {
          icon: 'cloud-offline',
          title: 'No Internet Connection',
          message: 'Please check your internet connection and try again.',
          actionText: 'Retry',
        };
      case 'empty':
        return {
          icon: 'document-outline',
          title: 'No Questions Available',
          message: 'There are no questions for this category yet.',
          actionText: 'Go Back',
        };
      case 'firebase':
        return {
          icon: 'warning',
          title: 'Server Error',
          message: 'Unable to load questions. Please try again later.',
          actionText: 'Retry',
        };
      default:
        return {
          icon: 'alert-circle',
          title: 'Something Went Wrong',
          message: 'An unexpected error occurred. Please try again.',
          actionText: 'Retry',
        };
    }
  };

  const errorInfo = getErrorInfo();

  return (
    <View style={styles.errorContainer}>
      <LinearGradient
        colors={["#0F0420", "#1A0B2E", "#2D1B4E"]}
        style={styles.errorGradient}
      >
        <View style={styles.errorContent}>
          <View style={styles.errorIconCircle}>
            <Ionicons name={errorInfo.icon} size={64} color="#EF4444" />
          </View>
          <Text style={styles.errorTitle}>{errorInfo.title}</Text>
          <Text style={styles.errorMessage}>{errorInfo.message}</Text>
          
          <View style={styles.errorButtons}>
            <TouchableOpacity
              style={styles.errorButton}
              onPress={error.type === 'empty' ? onGoBack : onRetry}
            >
              <LinearGradient
                colors={["#38BDF8", "#8B5CF6"]}
                style={styles.errorButtonGradient}
              >
                <Ionicons 
                  name={error.type === 'empty' ? 'arrow-back' : 'refresh'} 
                  size={20} 
                  color="#FFFFFF" 
                />
                <Text style={styles.errorButtonText}>{errorInfo.actionText}</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            {error.type !== 'empty' && (
              <TouchableOpacity style={styles.errorButtonSecondary} onPress={onGoBack}>
                <Text style={styles.errorButtonSecondaryText}>Go Back</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

// Main Quiz Screen Component
export default function QuizDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { categoryId, categoryName, categoryColor } = route.params;
  const { isConnected, isInternetReachable } = useNetworkStatus();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [lives, setLives] = useState(MAX_LIVES);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  const slideAnim = useSharedValue(0);
  const fadeAnim = useSharedValue(1);

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, []);

  // Reset animation and timer for new question
  useEffect(() => {
    slideAnim.value = 0;
    fadeAnim.value = 0;
    slideAnim.value = withSpring(1, { damping: 20, stiffness: 90 });
    fadeAnim.value = withTiming(1, { duration: 400 });
    setTimeLeft(TIMER_DURATION);
  }, [currentQuestion]);

  // Timer countdown
  useEffect(() => {
    if (!isAnswered && !showResults && !loading && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswered) {
      handleTimeOut();
    }
  }, [timeLeft, isAnswered, showResults, loading]);

  // Network status monitoring
  useEffect(() => {
    if (!isConnected && !loading) {
      Alert.alert(
        "Connection Lost",
        "Your internet connection was lost. Some features may not work properly.",
        [{ text: "OK" }]
      );
    }
  }, [isConnected]);

  const loadQuestions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const fetchedQuestions = await fetchQuizQuestions(categoryName.toLowerCase());
      
      if (fetchedQuestions.length === 0) {
        throw new QuizFetchError('No questions available', 'empty');
      }

      console.log(`✅ Loaded ${fetchedQuestions.length} questions for ${categoryName}`);
      setQuestions(fetchedQuestions);
    } catch (err) {
      console.error("Load questions error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeOut = useCallback(() => {
    setLives(prev => Math.max(0, prev - 1));
    setStreak(0);
    setIsAnswered(true);
    
    setTimeout(() => {
      if (lives > 1) {
        handleNext();
      } else {
        setShowResults(true);
      }
    }, 2000);
  }, [lives]);

  const handleOptionSelect = useCallback((index) => {
    if (isAnswered) return;

    setSelectedOption(index);
    setIsAnswered(true);

    const currentQ = questions[currentQuestion];
    const selectedOptionText = currentQ.options[index];
    const isCorrect = selectedOptionText === currentQ.answer;

    if (isCorrect) {
      const points = calculatePoints(streak, timeLeft);
      
      setScore(prev => prev + 1);
      setTotalPoints(prev => prev + points);
      setEarnedPoints(points);
      
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak(prev => Math.max(prev, newStreak));
      setShowPointsAnimation(true);
      
      setTimeout(() => setShowPointsAnimation(false), 1000);
    } else {
      setLives(prev => Math.max(0, prev - 1));
      setStreak(0);
      setEarnedPoints(0);
    }

    setTimeout(() => {
      if (lives > 0 || isCorrect) {
        handleNext();
      } else {
        setShowResults(true);
      }
    }, 2500);
  }, [isAnswered, questions, currentQuestion, streak, timeLeft, lives]);

  const handleNext = useCallback(() => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  }, [currentQuestion, questions.length]);

  const handleRestart = useCallback(() => {
    setQuestions(prev => shuffleArray(prev));
    setCurrentQuestion(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowResults(false);
    setLives(MAX_LIVES);
    setStreak(0);
    setMaxStreak(0);
    setTimeLeft(TIMER_DURATION);
    setTotalPoints(0);
  }, []);

  const handleRetry = useCallback(() => {
    loadQuestions();
  }, []);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const questionAnimStyle = useAnimatedStyle(() => ({
    transform: [{
      translateX: interpolate(slideAnim.value, [0, 1], [width, 0]),
    }],
    opacity: fadeAnim.value,
  }));

  // Render Loading State
  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={["#0F0420", "#1A0B2E", "#2D1B4E"]}
          style={styles.loadingContainer}
        >
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.loadingText}>
              {categoryName.toLowerCase() === 'mix' 
                ? 'Loading Mixed Questions...' 
                : 'Loading Questions...'}
            </Text>
            <Text style={styles.loadingSubtext}>
              {categoryName.toLowerCase() === 'mix' 
                ? 'Gathering questions from all categories' 
                : 'Preparing your quiz experience'}
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Render Error State
  if (error) {
    return (
      <ErrorDisplay 
        error={error} 
        onRetry={handleRetry}
        onGoBack={handleGoBack}
      />
    );
  }

  // Render Results Screen
  if (showResults) {
    const percentage = ((score / questions.length) * 100).toFixed(0);
    const isPerfect = percentage == 100;
    const isPassed = percentage >= PASSING_PERCENTAGE;

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={["#0F0420", "#1A0B2E", "#2D1B4E"]}
          style={styles.background}
        >
          <ScrollView contentContainerStyle={styles.resultsScrollContainer}>
            <View style={styles.resultsContainer}>
              {isPerfect && [...Array(10)].map((_, i) => (
                <FloatingParticle key={i} delay={i * 200} />
              ))}

              <View style={styles.resultIconContainer}>
                <View style={[
                  styles.resultIconCircle,
                  { 
                    backgroundColor: isPerfect 
                      ? "rgba(245, 158, 11, 0.3)" 
                      : isPassed 
                      ? "rgba(16, 185, 129, 0.2)" 
                      : "rgba(245, 158, 11, 0.2)" 
                  }
                ]}>
                  <Ionicons
                    name={isPerfect ? "trophy" : isPassed ? "ribbon" : "medal"}
                    size={64}
                    color={isPerfect ? "#F59E0B" : isPassed ? "#10B981" : "#F59E0B"}
                  />
                </View>
              </View>

              <Text style={styles.resultsTitle}>
                {isPerfect ? "Perfect Score! 🎉" : isPassed ? "Congratulations! 🎊" : "Good Effort! 💪"}
              </Text>
              <Text style={styles.resultsSubtitle}>
                {isPerfect 
                  ? "Absolutely flawless!" 
                  : isPassed 
                  ? "You passed the quiz!" 
                  : "Keep practicing to improve!"}
              </Text>

              {categoryName.toLowerCase() === 'mix' && (
                <View style={styles.mixBadge}>
                  <Ionicons name="shuffle" size={16} color="#8B5CF6" />
                  <Text style={styles.mixBadgeText}>Mixed Quiz Completed</Text>
                </View>
              )}

              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <LinearGradient
                    colors={['rgba(139, 92, 246, 0.2)', 'rgba(139, 92, 246, 0.1)']}
                    style={styles.statCardGradient}
                  >
                    <Text style={styles.statValue}>{percentage}%</Text>
                    <Text style={styles.statLabel}>Accuracy</Text>
                  </LinearGradient>
                </View>

                <View style={styles.statCard}>
                  <LinearGradient
                    colors={['rgba(56, 189, 248, 0.2)', 'rgba(56, 189, 248, 0.1)']}
                    style={styles.statCardGradient}
                  >
                    <Text style={styles.statValue}>{totalPoints}</Text>
                    <Text style={styles.statLabel}>Points</Text>
                  </LinearGradient>
                </View>

                <View style={styles.statCard}>
                  <LinearGradient
                    colors={['rgba(245, 158, 11, 0.2)', 'rgba(245, 158, 11, 0.1)']}
                    style={styles.statCardGradient}
                  >
                    <View style={styles.statValueRow}>
                      <Ionicons name="flame" size={24} color="#F59E0B" />
                      <Text style={styles.statValue}>{maxStreak}</Text>
                    </View>
                    <Text style={styles.statLabel}>Best Streak</Text>
                  </LinearGradient>
                </View>

                <View style={styles.statCard}>
                  <LinearGradient
                    colors={['rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.1)']}
                    style={styles.statCardGradient}
                  >
                    <Text style={styles.statValue}>{score}/{questions.length}</Text>
                    <Text style={styles.statLabel}>Correct</Text>
                  </LinearGradient>
                </View>
              </View>

              <View style={styles.scoreCard}>
                <Text style={styles.scorePercentage}>{percentage}%</Text>
                <Text style={styles.scoreText}>
                  {score} out of {questions.length} correct
                </Text>
                <Text style={styles.scorePoints}>
                  Total Points: {totalPoints}
                </Text>
              </View>

              <View style={styles.resultButtons}>
                <TouchableOpacity style={styles.resultButton} onPress={handleRestart}>
                  <LinearGradient
                    colors={["#38BDF8", "#8B5CF6"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.resultButtonGradient}
                  >
                    <Ionicons name="refresh" size={20} color="#FFFFFF" />
                    <Text style={styles.resultButtonText}>Try Again</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.resultButtonSecondary} onPress={handleGoBack}>
                  <Text style={styles.resultButtonSecondaryText}>Back to Categories</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#0F0420", "#1A0B2E", "#2D1B4E"]}
        style={styles.background}
      >
        <PointsEarned points={earnedPoints} visible={showPointsAnimation} />

        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <View style={styles.categoryTagContainer}>
              <Text style={styles.categoryTag}>
                {categoryName.toLowerCase() === 'mix' ? 'Quiz Mix' : categoryName}
              </Text>
              {currentQ.category && categoryName.toLowerCase() === 'mix' && (
                <View style={styles.subCategoryBadge}>
                  <Text style={styles.subCategoryText}>{currentQ.category.toUpperCase()}</Text>
                </View>
              )}
            </View>
            <View style={styles.scoreDisplayContainer}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.scoreDisplay}>{totalPoints}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <LivesDisplay lives={lives} />
          <StreakDisplay streak={streak} />
        </View>

        <TimerBar timeLeft={timeLeft} maxTime={TIMER_DURATION} />

        <ProgressBar current={currentQuestion + 1} total={questions.length} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View style={[styles.questionCard, questionAnimStyle]}>
            <View style={styles.questionHeader}>
              <View style={styles.questionNumberBadge}>
                <Text style={styles.questionNumberText}>
                  Question {currentQuestion + 1}
                </Text>
              </View>
            </View>

            <Text style={styles.questionText}>{currentQ.question}</Text>

            <View style={styles.optionsContainer}>
              {currentQ.options.map((option, index) => {
                const isCorrect = isAnswered && currentQ.options[index] === currentQ.answer;
                const isWrong = isAnswered && index === selectedOption && currentQ.options[index] !== currentQ.answer;
                const isSelected = selectedOption === index;

                return (
                  <OptionButton
                    key={index}
                    option={option}
                    index={index}
                    isSelected={isSelected}
                    isCorrect={isCorrect}
                    isWrong={isWrong}
                    onPress={() => handleOptionSelect(index)}
                    disabled={isAnswered}
                  />
                );
              })}
            </View>

            {isAnswered && currentQ.explanation && (
              <View style={styles.explanationCard}>
                <View style={styles.explanationHeader}>
                  <Ionicons name="information-circle" size={20} color="#8B5CF6" />
                  <Text style={styles.explanationTitle}>Explanation</Text>
                </View>
                <Text style={styles.explanationText}>{currentQ.explanation}</Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>

        {isAnswered && (
          <View style={styles.nextButtonContainer}>
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <LinearGradient
                colors={["#38BDF8", "#8B5CF6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.nextButtonGradient}
              >
                <Text style={styles.nextButtonText}>
                  {currentQuestion === questions.length - 1 ? "Finish" : "Next"}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  loadingSubtext: {
    color: "#C7D2FE",
    fontSize: 14,
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
  },
  errorGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
    maxWidth: 400,
  },
  errorIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: '#C7D2FE',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  errorButtons: {
    width: '100%',
    gap: 16,
  },
  errorButton: {
    borderRadius: 50,
    overflow: 'hidden',
  },
  errorButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  errorButtonSecondary: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  errorButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
    textDecorationLine: 'underline',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginLeft: 16,
  },
  categoryTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryTag: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    textTransform: 'capitalize',
  },
  subCategoryBadge: {
    backgroundColor: "rgba(139, 92, 246, 0.3)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  subCategoryText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#8B5CF6",
  },
  scoreDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  scoreDisplay: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  livesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  heartContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakContainer: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  streakGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  streakText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  timerContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  timerTrack: {
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  timerFill: {
    height: '100%',
  },
  timerGradient: {
    flex: 1,
  },
  timerBadge: {
    position: 'absolute',
    right: 8,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  pointsEarnedContainer: {
    position: 'absolute',
    top: height * 0.4,
    alignSelf: 'center',
    zIndex: 1000,
  },
  pointsEarnedBadge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  pointsEarnedText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  progressBarContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    height: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 6,
    overflow: "hidden",
    position: "relative",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 6,
  },
  progressGradient: {
    flex: 1,
  },
  progressText: {
    position: "absolute",
    right: 12,
    top: -2,
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  questionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  questionHeader: {
    marginBottom: 20,
  },
  questionNumberBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  questionNumberText: {
    color: "#8B5CF6",
    fontSize: 14,
    fontWeight: "700",
  },
  questionText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 30,
    marginBottom: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    gap: 12,
  },
  optionLabel: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabelCorrect: {
    backgroundColor: "rgba(16, 185, 129, 0.3)",
  },
  optionLabelWrong: {
    backgroundColor: "rgba(239, 68, 68, 0.3)",
  },
  optionLabelText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  optionLabelTextActive: {
    color: "#FFFFFF",
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  optionTextCorrect: {
    color: "#10B981",
  },
  optionTextWrong: {
    color: "#EF4444",
  },
  explanationCard: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
  },
  explanationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#8B5CF6",
  },
  explanationText: {
    fontSize: 14,
    color: "#C7D2FE",
    lineHeight: 22,
  },
  nextButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "rgba(15, 4, 32, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  nextButton: {
    borderRadius: 50,
    overflow: "hidden",
  },
  nextButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  resultsScrollContainer: {
    flexGrow: 1,
  },
  resultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  resultIconContainer: {
    marginBottom: 32,
  },
  resultIconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  resultsTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  resultsSubtitle: {
    fontSize: 18,
    color: "#C7D2FE",
    textAlign: "center",
    marginBottom: 16,
  },
  mixBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  mixBadgeText: {
    color: "#8B5CF6",
    fontSize: 14,
    fontWeight: "700",
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
    width: '100%',
  },
  statCard: {
    width: (width - 88) / 2,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  statCardGradient: {
    padding: 20,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C7D2FE',
  },
  scoreCard: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    marginBottom: 40,
    minWidth: 200,
  },
  scorePercentage: {
    fontSize: 64,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  scoreText: {
    fontSize: 16,
    color: "#C7D2FE",
    fontWeight: "600",
    marginBottom: 4,
  },
  scorePoints: {
    fontSize: 18,
    color: "#F59E0B",
    fontWeight: "700",
  },
  resultButtons: {
    width: "100%",
    gap: 16,
  },
  resultButton: {
    borderRadius: 50,
    overflow: "hidden",
  },
  resultButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 8,
  },
  resultButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  resultButtonSecondary: {
    paddingVertical: 18,
    alignItems: "center",
  },
  resultButtonSecondaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8B5CF6",
    textDecorationLine: "underline",
  },
});