import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  useAnimatedScrollHandler,
} from "react-native-reanimated";
import { getJSON } from "../../utils/Storage";

const { width, height } = Dimensions.get("window");
const isSmallDevice = width < 375;
const HORIZONTAL_PADDING = 20;
const CARD_GAP = 16;
const CARDS_PER_ROW = 2;
const CARD_WIDTH = (width - HORIZONTAL_PADDING * 2 - CARD_GAP * (CARDS_PER_ROW - 1)) / CARDS_PER_ROW;
const FEATURED_HEIGHT = height * 0.35;

const FEATURED_COURSES = [
  {
    id: 1,
    title: "HTML Mastery",
    subtitle: "Build semantic and accessible web pages from scratch",
    gradient: ["#FF3C38", "#FF8A5B"],
    badge: "🎯 ESSENTIAL",
  },
  {
    id: 2,
    title: "CSS Mastery",
    subtitle: "Create stunning designs with modern CSS techniques",
    gradient: ["#4C6EF5", "#5AD8FF"],
    badge: "🎨 DESIGN",
  },
  {
    id: 3,
    title: "JavaScript Logics",
    subtitle: "Master programming fundamentals and problem solving",
    gradient: ["#FF9C4D", "#FCDC4D"],
    badge: "⚡ LOGIC",
  },
  {
    id: 4,
    title: "React Development",
    subtitle: "Build modern interactive UIs with React ecosystem",
    gradient: ["#0ABAB5", "#61DAFB"],
    badge: "⚛️ FRAMEWORK",
  },
  {
    id: 5,
    title: "Full Stack Development",
    subtitle: "Master modern web development with hands-on projects",
    gradient: ["#6C5CE7", "#A29BFE"],
    badge: "✨ FEATURED",
  },
];

const CATEGORIES = [
  { id: 1, title: "HTML", icon: "logo-html5", gradient: ["#FF3C38", "#FF8A5B"], lessons: 60 },
  { id: 2, title: "CSS", icon: "logo-css3", gradient: ["#4C6EF5", "#5AD8FF"], lessons: 60 },
  { id: 3, title: "JS", icon: "logo-javascript", gradient: ["#FF9C4D", "#FCDC4D"], lessons: 54 },
  { id: 4, title: "React", icon: "logo-react", gradient: ["#0ABAB5", "#61DAFB"], lessons: 51 },
  { id: 5, title: "Nextjs", icon: "rocket-outline", gradient: ["#2D3436", "#6C5CE7"], lessons: 22 },
  { id: 6, title: "Nodejs", icon: "leaf-outline", gradient: ["#00FF9D", "#00B894"], lessons: 15 },
  { id: 7, title: "Expressjs", icon: "code-slash-outline", gradient: ["#303030", "#000000"], lessons: 16 },
  { id: 8, title: "MongoDB", icon: "server-outline", gradient: ["#00B894", "#13EAC9"], lessons: 16 },
  { id: 9, title: "Redis", icon: "cloud-outline", gradient: ["#FF4E50", "#FFAA00"], lessons: 12 },
  { id: 10, title: "Projects", icon: "sparkles-outline", gradient: ["#8E2DE2", "#4A00E0"], lessons: 5, route: "Projects" },
];

const getBadgeInfo = (progressRatio) => {
  const progress = progressRatio * 100;
  if (progress < 100) return { emoji: "🔥", color: "#F87171" };
  return { emoji: "🏆", color: "#8B5CF6" };
};

// Animated Featured Card
const FeaturedCard = React.memo(({ course, index, scrollX }) => {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.9, 1, 0.9],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.5, 1, 0.5],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.featuredWrapper, animatedStyle]}>
      <LinearGradient
        colors={course.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.featuredCard}
      >
        <View style={styles.featuredContent}>
          <View style={styles.featuredBadge}>
            <Text style={styles.badgeText}>{course.badge}</Text>
          </View>
          <Text style={styles.featuredTitle}>{course.title}</Text>
          <Text style={styles.featuredSubtitle}>{course.subtitle}</Text>
        </View>
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        <View style={styles.decorativeCircle3} />
      </LinearGradient>
    </Animated.View>
  );
});

// Auto-scrolling Carousel with Reanimated
const FeaturedCarousel = React.memo(() => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const flatListRef = useRef(null);
  const autoScrollTimer = useRef(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
    onEndDrag: (event) => {
      const index = Math.round(event.contentOffset.x / width);
      scrollX.value = index * width;
    },
  });

  // Update active index on scroll
  useEffect(() => {
    const interval = setInterval(() => {
      const index = Math.round(scrollX.value / width);
      if (index !== activeIndex) {
        setActiveIndex(index);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [scrollX.value, activeIndex]);

  const scrollToNext = useCallback(() => {
    if (!flatListRef.current) return;

    const nextIndex = (activeIndex + 1) % FEATURED_COURSES.length;
    flatListRef.current.scrollToOffset({
      offset: nextIndex * width,
      animated: true,
    });
  }, [activeIndex]);

  // Auto-scroll effect
  useEffect(() => {
    autoScrollTimer.current = setInterval(() => {
      scrollToNext();
    }, 3000); // Auto-scroll every 3 seconds

    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [scrollToNext]);

  // Reset timer on manual scroll
  const onScrollBeginDrag = useCallback(() => {
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
    }
  }, []);

  const onScrollEndDrag = useCallback(() => {
    autoScrollTimer.current = setInterval(() => {
      scrollToNext();
    }, 3000);
  }, [scrollToNext]);

  const keyExtractor = useCallback((item) => item.id.toString(), []);
  
  const renderItem = useCallback(
    ({ item, index }) => (
      <FeaturedCard course={item} index={index} scrollX={scrollX} />
    ),
    [scrollX]
  );

  return (
    <View style={styles.carouselContainer}>
      <Animated.FlatList
        ref={flatListRef}
        data={FEATURED_COURSES}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={width}
        snapToAlignment="center"
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
        removeClippedSubviews
        maxToRenderPerBatch={2}
        windowSize={3}
        initialNumToRender={1}
      />
      <View style={styles.paginationContainer}>
        {FEATURED_COURSES.map((_, index) => {
          const dotStyle = useAnimatedStyle(() => {
            const isActive = activeIndex === index;
            return {
              width: withSpring(isActive ? 20 : 6, { damping: 15 }),
              backgroundColor: withTiming(
                isActive ? "#FFFFFF" : "rgba(255,255,255,0.4)",
                { duration: 300 }
              ),
            };
          });

          return (
            <Animated.View
              key={index}
              style={[styles.paginationDot, dotStyle]}
            />
          );
        })}
      </View>
    </View>
  );
});

// Animated Category Card
const CategoryCard = React.memo(({ item, progress, route, onPress, index }) => {
  const progressRatio = progress?.total ? progress.completed / progress.total : 0;
  const isCompleted = progressRatio >= 1;
  const badgeInfo = getBadgeInfo(progressRatio);

  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 600, delay: index * 100 });
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={styles.categoryCard}
        activeOpacity={0.7}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <LinearGradient
          colors={item.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name={item.icon} size={isSmallDevice ? 26 : 30} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.cardInfo}>
              <View style={styles.titleRow}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                {progressRatio > 0 && (
                  <View style={[styles.badgeContainer, { backgroundColor: badgeInfo.color }]}>
                    <Text style={styles.badgeEmoji}>{badgeInfo.emoji}</Text>
                  </View>
                )}
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.lessonBadge}>
                  <Ionicons name="play-circle" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.lessonText}>
                    {progress?.total || item.lessons} {route ? "Projects" : "Lessons"}
                  </Text>
                </View>
                <View style={styles.arrowCircle}>
                  <Ionicons
                    name={isCompleted ? "checkmark-circle" : "arrow-forward"}
                    size={14}
                    color="#FFFFFF"
                  />
                </View>
              </View>

              {progressRatio > 0 && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { width: `${progressRatio * 100}%` }]} />
                  </View>
                  <Text style={styles.progressText}>{Math.round(progressRatio * 100)}%</Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
});

export default function HomeScreen() {
  const navigation = useNavigation();
  const [courseProgress, setCourseProgress] = useState({});
  const headerOpacity = useSharedValue(1);

  const loadProgress = useCallback(() => {
    try {
      const stored = getJSON("courseProgress");
      if (stored) {
        setCourseProgress(stored);
      }
    } catch (error) {
      console.error("Error loading course progress:", error);
    }
  }, []);

  useEffect(() => {
    loadProgress();
    const unsubscribe = navigation.addListener("focus", loadProgress);
    return unsubscribe;
  }, [navigation, loadProgress]);

  const handleCategoryPress = useCallback((item) => {
    if (item.route) {
      navigation.navigate(item.route);
    } else {
      navigation.navigate("Lesson", { 
        id: item.title.toLowerCase() 
      });
    }
  }, [navigation]);

  const renderCategory = useCallback(({ item, index }) => {
    const progressKey = item.title.toLowerCase();
    return (
      <CategoryCard
        item={item}
        progress={courseProgress[progressKey]}
        route={!!item.route}
        onPress={() => handleCategoryPress(item)}
        index={index}
      />
    );
  }, [courseProgress, handleCategoryPress]);

  const keyExtractor = useCallback((item) => item.id.toString(), []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <FeaturedCarousel />

      <Animated.View style={[styles.headerOverlay, headerAnimatedStyle]}>
        <SafeAreaView edges={["top"]}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.profileButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("Profile")}
            >
              <Ionicons name="person-circle-outline" size={32} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
      >
        <View style={styles.contentSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLeft}>
              <Text style={styles.sectionTitle}>Learning Paths</Text>
              <Text style={styles.sectionSubtitle}>Choose your tech stack</Text>
            </View>
            <TouchableOpacity style={styles.seeAllButton} activeOpacity={0.7} onPress={() => navigation.navigate("Codeeditor")}>
              <Text style={styles.seeAllText}>Code Editor</Text>
              <Ionicons name="arrow-forward" size={14} color="#6C5CE7" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={CATEGORIES}
            renderItem={renderCategory}
            keyExtractor={keyExtractor}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.categoriesRow}
            contentContainerStyle={styles.categoriesContainer}
            removeClippedSubviews
            maxToRenderPerBatch={6}
            windowSize={5}
            initialNumToRender={6}
          />

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  carouselContainer: {
    height: FEATURED_HEIGHT,
    width: width,
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    flexDirection: "row",
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 8,
    paddingBottom: 16,
  },
  profileButton: {
    padding: 4,
  },
  paginationContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  paginationDot: {
    height: 6,
    borderRadius: 3,
  },
  featuredWrapper: {
    width: width,
    height: FEATURED_HEIGHT,
  },
  featuredCard: {
    flex: 1,
    padding: 24,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  featuredContent: {
    zIndex: 2,
    marginBottom: 40,
  },
  featuredBadge: {
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  featuredTitle: {
    color: "#FFFFFF",
    fontSize: isSmallDevice ? 28 : 32,
    fontWeight: "900",
    marginBottom: 8,
    letterSpacing: -0.5,
    lineHeight: isSmallDevice ? 34 : 38,
  },
  featuredSubtitle: {
    color: "#FFFFFF",
    opacity: 0.95,
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 21,
    fontWeight: "500",
    maxWidth: "90%",
  },
  decorativeCircle1: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.1)",
    top: -50,
    right: -40,
    zIndex: 1,
  },
  decorativeCircle2: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.08)",
    bottom: -30,
    right: 30,
    zIndex: 1,
  },
  decorativeCircle3: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.06)",
    top: 80,
    right: 20,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentSection: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: HORIZONTAL_PADDING,
    marginBottom: 20,
  },
  sectionLeft: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 20 : 22,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: isSmallDevice ? 13 : 14,
    color: "#64748B",
    fontWeight: "500",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  seeAllText: {
    fontSize: isSmallDevice ? 14 : 15,
    fontWeight: "700",
    color: "#6C5CE7",
  },
  categoriesContainer: {
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  categoriesRow: {
    justifyContent: "space-between",
    marginBottom: CARD_GAP,
  },
  categoryCard: {
    width: CARD_WIDTH,
    borderRadius: 20,
    overflow: "hidden",
  },
  cardGradient: {
    width: "100%",
    height: isSmallDevice ? 200 : 210,
    padding: 16,
    borderRadius: 20,
  },
  cardContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  iconContainer: {
    alignItems: "flex-start",
  },
  iconCircle: {
    width: isSmallDevice ? 52 : 56,
    height: isSmallDevice ? 52 : 56,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  cardInfo: {
    gap: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: isSmallDevice ? 16 : 17,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
    flex: 1,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginLeft: 6,
  },
  badgeEmoji: {
    fontSize: 12,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lessonBadge: {
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  lessonText: {
    fontSize: isSmallDevice ? 11 : 12,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  progressContainer: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressBarBackground: {
    flex: 1,
    height: 5,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 3,
    marginRight: 8,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
  },
  progressText: {
    color: "#FFFFFF",
    fontSize: isSmallDevice ? 10 : 11,
    fontWeight: "800",
    minWidth: 35,
    textAlign: "right",
  },
  bottomSpacer: {
    height: 40,
  },
});