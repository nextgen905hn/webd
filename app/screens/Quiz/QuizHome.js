import React, { useEffect, useMemo, useCallback, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Dimensions,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useState } from "react";
import { getJSON, setJSON } from '../../utils/Storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

// Quiz Categories Data - Static constant outside component
const CATEGORIES = [
  {
    id: 1,
    name: "HTML",
    firebaseName: "html",
    icon: "code-slash",
    color: "#E34F26",
    gradient: ["#E34F26", "#F06529"],
    questions: 25,
    difficulty: "Beginner",
  },
  {
    id: 2,
    name: "CSS",
    firebaseName: "css",
    icon: "color-palette",
    color: "#1572B6",
    gradient: ["#1572B6", "#33A9DC"],
    questions: 30,
    difficulty: "Beginner",
  },
  {
    id: 3,
    name: "JavaScript",
    firebaseName: "js",
    icon: "logo-javascript",
    color: "#F7DF1E",
    gradient: ["#F7DF1E", "#F0DB4F"],
    questions: 40,
    difficulty: "Intermediate",
  },
  {
    id: 4,
    name: "React",
    firebaseName: "react",
    icon: "logo-react",
    color: "#61DAFB",
    gradient: ["#61DAFB", "#00D8FF"],
    questions: 35,
    difficulty: "Intermediate",
  },
  {
    id: 5,
    name: "Nodejs",
    firebaseName: "nodejs",
    icon: "logo-nodejs",
    color: "#339933",
    gradient: ["#339933", "#68A063"],
    questions: 28,
    difficulty: "Advanced",
  },
  {
    id: 6,
    name: "Nextjs",
    firebaseName: "nextjs",
    icon: "layers",
    color: "#000000",
    gradient: ["#000000", "#1a1a1a"],
    questions: 22,
    difficulty: "Advanced",
  },
  {
    id: 7,
    name: "MongoDB",
    firebaseName: "mongodb",
    icon: "leaf",
    color: "#47A248",
    gradient: ["#47A248", "#4DB33D"],
    questions: 20,
    difficulty: "Intermediate",
  },
  {
    id: 8,
    name: "Expressjs",
    firebaseName: "expressjs",
    icon: "flash",
    color: "#000000",
    gradient: ["#404040", "#000000"],
    questions: 18,
    difficulty: "Intermediate",
  },
  {
    id: 9,
    name: "Redis",
    firebaseName: "redis",
    icon: "server",
    color: "#DC382D",
    gradient: ["#DC382D", "#D82C20"],
    questions: 10,
    difficulty: "Advanced",
  },
  {
    id: 10,
    name: "Quiz Mix",
    firebaseName: "mix",
    icon: "shuffle",
    color: "#8B5CF6",
    gradient: ["#8B5CF6", "#EC4899"],
    questions: 50,
    difficulty: "All Levels",
  },
];

// Difficulty color mapping - Static constant
const DIFFICULTY_COLORS = {
  Beginner: "#10B981",
  Intermediate: "#F59E0B",
  Advanced: "#EF4444",
  default: "#8B5CF6",
};

// Memoized Floating Background Particle
const FloatingParticle = memo(({ index }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  
  // Memoize random position
  const position = useMemo(() => ({
    left: Math.random() * width,
    top: Math.random() * 800 + 200,
  }), []);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-150, { duration: 4000 + index * 200 }),
        withTiming(0, { duration: 0 })
      ),
      -1
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1
    );
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.particle, animatedStyle, position]}>
      <View style={styles.particleDot} />
    </Animated.View>
  );
});

// Memoized Category Card Component
const CategoryCard = memo(({ category, onPress }) => {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  // Memoize difficulty color
  const difficultyColor = useMemo(
    () => DIFFICULTY_COLORS[category.difficulty] || DIFFICULTY_COLORS.default,
    [category.difficulty]
  );

  // Memoize gradient colors
  const gradientColors = useMemo(
    () => [...category.gradient, category.gradient[0]],
    [category.gradient]
  );

  // Memoize background styles
  const difficultyBadgeBg = useMemo(
    () => ({ backgroundColor: `${difficultyColor}30` }),
    [difficultyColor]
  );

  const difficultyDotBg = useMemo(
    () => ({ backgroundColor: difficultyColor }),
    [difficultyColor]
  );

  const difficultyTextColor = useMemo(
    () => ({ color: difficultyColor }),
    [difficultyColor]
  );

  useEffect(() => {
    // Entrance animation
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 90,
    });

    // Floating animation
    rotate.value = withRepeat(
      withSequence(
        withTiming(2, { duration: 2000 }),
        withTiming(-2, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1);
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.cardTouchable}
    >
      <Animated.View style={[styles.cardWrapper, animatedStyle]}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Shine Effect */}
          <View style={styles.shineOverlay} />

          {/* Icon Container */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name={category.icon} size={48} color="#FFFFFF" />
            </View>
          </View>

          {/* Content */}
          <View style={styles.cardContent}>
            <Text style={styles.categoryName}>{category.name}</Text>
            
            <View style={styles.infoRow}>
              <View style={styles.questionsContainer}>
                <Ionicons name="help-circle-outline" size={14} color="rgba(255,255,255,0.9)" />
                <Text style={styles.questionsText}>{category.questions} Questions</Text>
              </View>
            </View>

            <View style={[styles.difficultyBadge, difficultyBadgeBg]}>
              <View style={[styles.difficultyDot, difficultyDotBg]} />
              <Text style={[styles.difficultyText, difficultyTextColor]}>
                {category.difficulty}
              </Text>
            </View>
          </View>

          {/* Decorative Corner */}
          <View style={styles.cornerDecoration}>
            <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.6)" />
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
});

// Memoized Header Component
const QuizHeader = memo(({ onBack, totalCategories, totalQuestions }) => {
  const headerOpacity = useSharedValue(0);
  const headerTranslate = useSharedValue(-50);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 800 });
    headerTranslate.value = withSpring(0, {
      damping: 20,
      stiffness: 90,
    });
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslate.value }],
  }));

  return (
    <Animated.View style={[styles.header, headerAnimatedStyle]}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={styles.headerContent}>
        <View style={styles.titleContainer}>
          <View style={styles.iconBadge}>
            <Ionicons name="trophy" size={28} color="#F59E0B" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Quiz Challenge</Text>
            <Text style={styles.headerSubtitle}>Test Your Knowledge</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalCategories}</Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalQuestions}</Text>
            <Text style={styles.statLabel}>Questions</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
});

// Memoized Background Component
const AnimatedBackground = memo(() => {
  // Memoize particles array
  const particles = useMemo(() => Array.from({ length: 15 }), []);

  return (
    <>
      {/* Floating Particles */}
      {particles.map((_, i) => (
        <FloatingParticle key={i} index={i} />
      ))}

      {/* Decorative Blurs */}
      <View style={[styles.decorativeBlur, styles.blur1]} />
      <View style={[styles.decorativeBlur, styles.blur2]} />
      <View style={[styles.decorativeBlur, styles.blur3]} />
    </>
  );
});

export default function QuizCategoriesScreen() {
  const navigation=useNavigation();

  // Memoize computed values
  const totalCategories = useMemo(() => CATEGORIES.length, []);
  const totalQuestions = useMemo(
    () => CATEGORIES.reduce((sum, cat) => sum + cat.questions, 0),
    []
  );

  // Memoized callbacks
  const handleBack = useCallback(() => navigation.goBack(), [navigation]);

  const handleCategoryPress = useCallback((category) => {
    console.log("Selected category:", category.name);
    navigation.navigate(
      'QuizPlay',
       {
        categoryId: category.id,
        categoryName: category.firebaseName,
        categoryColor: category.color,
      }
    );
  }, [navigation]);

  // Memoize category press handlers
  const categoryPressHandlers = useMemo(
    () => CATEGORIES.reduce((acc, category) => {
      acc[category.id] = () => handleCategoryPress(category);
      return acc;
    }, {}),
    [handleCategoryPress]
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Animated Background */}
      <LinearGradient
        colors={["#0F0420", "#1A0B2E", "#2D1B4E"]}
        style={styles.background}
      >
        <AnimatedBackground />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          removeClippedSubviews={true}
          maxToRenderPerBatch={6}
          updateCellsBatchingPeriod={50}
          windowSize={8}
          initialNumToRender={4}
        >
          {/* Header */}
          <QuizHeader 
            onBack={handleBack}
            totalCategories={totalCategories}
            totalQuestions={totalQuestions}
          />

          {/* Categories Grid */}
          <View style={styles.grid}>
            {CATEGORIES.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onPress={categoryPressHandlers[category.id]}
              />
            ))}
          </View>

          {/* Bottom Padding */}
          <View style={styles.bottomPadding} />
        </ScrollView>
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
    zIndex: 0,
  },
  particleDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(139, 92, 246, 0.6)",
  },
  decorativeBlur: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.4,
  },
  blur1: {
    width: 300,
    height: 300,
    top: -100,
    right: -100,
    backgroundColor: "rgba(139, 92, 246, 0.15)",
  },
  blur2: {
    width: 250,
    height: 250,
    top: 400,
    left: -80,
    backgroundColor: "rgba(236, 72, 153, 0.12)",
  },
  blur3: {
    width: 200,
    height: 200,
    bottom: 100,
    right: -60,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  headerContent: {
    gap: 20,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#C7D2FE",
    fontWeight: "500",
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#A5B4FC",
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "space-between",
  },
  cardTouchable: {
    width: CARD_WIDTH,
    marginBottom: 0,
  },
  cardWrapper: {
    width: "100%",
  },
  card: {
    borderRadius: 24,
    padding: 20,
    minHeight: 200,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  shineOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  cardContent: {
    gap: 10,
  },
  categoryName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  questionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  questionsText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
  },
  difficultyBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
  },
  difficultyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: "700",
  },
  cornerDecoration: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomPadding: {
    height: 40,
  },
});