import React, { useEffect, useMemo, useCallback, memo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useState } from "react";
import { useCoursesStore } from "../../utils/store";
import { getJSON, setJSON } from '../../utils/Storage';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

// Memoized Animated Card - prevents re-renders
const AnimatedCard = memo(({ children, delay = 0, style }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = withTiming(1, { duration: 600 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 90 });
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
});

// Memoized Code Example Component
const CodeExample = memo(({ example, index, courseId }) => (
  <View style={styles.exampleContainer}>
    <View style={styles.exampleHeader}>
      <View style={styles.exampleNumberBadge}>
        <LinearGradient
          colors={["#8B5CF6", "#A78BFA"]}
          style={styles.exampleNumberGradient}
        >
          <Text style={styles.exampleNumberText}>{index + 1}</Text>
        </LinearGradient>
      </View>
      <Text style={styles.exampleDescription}>{example.description}</Text>
    </View>

    <View style={styles.codeBlock}>
      <View style={styles.codeBlockHeader}>
        <View style={styles.codeBlockDots}>
          <View style={[styles.dot, styles.dotRed]} />
          <View style={[styles.dot, styles.dotYellow]} />
          <View style={[styles.dot, styles.dotGreen]} />
        </View>
        <View style={styles.languageBadge}>
          <Ionicons name="logo-javascript" size={12} color="#F7DF1E" />
          <Text style={styles.languageText}>{courseId?.toUpperCase()}</Text>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.codeScrollView}
        removeClippedSubviews={true}
        nestedScrollEnabled={true}
      >
        <Text style={styles.codeText}>{example.code}</Text>
      </ScrollView>
    </View>
  </View>
));

// Memoized Tip Item
const TipItem = memo(({ tip, index }) => (
  <View style={styles.tipItem}>
    <View style={styles.tipIconBadge}>
      <Ionicons name="star" size={12} color="#F59E0B" />
    </View>
    <Text style={styles.tipText}>{tip}</Text>
  </View>
));

// Memoized Header Component
const LessonHeader = memo(({ 
  gradient1, 
  gradient2, 
  textColor, 
  data, 
  onBack 
}) => (
  <LinearGradient
    colors={[gradient1, gradient2]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.headerGradient}
  >
    <TouchableOpacity onPress={onBack} style={styles.headerBackButton}>
      <View style={styles.backButtonCircle}>
        <Ionicons name="arrow-back" size={24} color={textColor} />
      </View>
    </TouchableOpacity>

    <View style={styles.headerContent}>
      <View style={styles.lessonBadge}>
        <Ionicons name="book" size={14} color={textColor} />
        <Text style={[styles.badgeText, { color: textColor }]}>
          LESSON {data.id}
        </Text>
      </View>

      <Text style={[styles.headerTitle, { color: textColor }]}>{data.title}</Text>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={18} color={textColor} />
          <Text style={[styles.statText, { color: textColor }]}>15 min</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: textColor }]} />
        <View style={styles.statItem}>
          <Ionicons name="code-slash-outline" size={18} color={textColor} />
          <Text style={[styles.statText, { color: textColor }]}>
            {data.examples?.length || 0} Examples
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: textColor }]} />
        <View style={styles.statItem}>
          <Ionicons name="layers-outline" size={18} color={textColor} />
          <Text style={[styles.statText, { color: textColor }]}>
            {data.quiz?.length || 0} Quiz
          </Text>
        </View>
      </View>
    </View>

    <View style={styles.waveContainer}>
      <View style={styles.wave} />
    </View>
  </LinearGradient>
));

export default function LessonDetail() {
  const navigation = useNavigation();
  const route = useRoute();
  const { courseId, gradient1, gradient2, lessonId } = route.params || {};
  
  const { coursesMeta, lessonsdata, loadCourse } = useCoursesStore();
  
  // Local state for tracking completion
  const [isMarkedComplete, setIsMarkedComplete] = useState(false);

  // Memoize course and lesson data
  const course = useMemo(() => lessonsdata[courseId], [lessonsdata, courseId]);
  const allLessons = useMemo(
    () => course?.sections?.flatMap(s => s.lessons) || [],
    [course]
  );
  const lessonIndex = useMemo(() => parseInt(lessonId, 10), [lessonId]);
  const data = useMemo(
    () => allLessons.find(lesson => lesson.id === lessonIndex) || {},
    [allLessons, lessonIndex]
  );

  const isJSCourse = useMemo(() => courseId === "js", [courseId]);
  const textColor = useMemo(() => isJSCourse ? "#000000" : "#FFFFFF", [isJSCourse]);

  // Load course data only once
  useEffect(() => {
    if (courseId) {
      loadCourse(courseId);
    }
  }, [courseId, loadCourse]);

  // Mark lesson as completed - FIXED VERSION
// Mark lesson as completed - FULLY FIXED VERSION
useEffect(() => {
  // Wait until all required data is available
  if (!courseId || !data?.id || !course || allLessons.length === 0 || isMarkedComplete) {
    return;
  }

  try {
    let progress = getJSON("courseProgress");
    
    // Initialize entire progress object if null
    if (!progress) {
      progress = {};
    }
    
    // Initialize course progress if it doesn't exist
    if (!progress[courseId]) {
      progress[courseId] = {
        name: course.course || courseId,
        completed: 0,
        total: allLessons.length,
        lessonsDone: [],
        lastVisit: -1,
        TestScore: 0,
        userAnswers: [],
        certId: null,
      };
    }

    // **CRITICAL FIX: Ensure lessonsDone array exists**
    if (!Array.isArray(progress[courseId].lessonsDone)) {
      progress[courseId].lessonsDone = [];
    }

    // **CRITICAL FIX: Ensure total is up to date**
    if (progress[courseId].total !== allLessons.length) {
      progress[courseId].total = allLessons.length;
    }

    // Now safe to check if lesson is already completed
    if (!progress[courseId].lessonsDone.includes(data.id)) {
      // Mark lesson as completed
      progress[courseId].lessonsDone.push(data.id);
      progress[courseId].completed = progress[courseId].lessonsDone.length;
      progress[courseId].lastVisit = data.id;

      // Save to storage
      setJSON("courseProgress", progress);
      
      // Mark as complete to prevent re-running
      setIsMarkedComplete(true);
      
      console.log(`✅ Lesson ${data.id} marked as completed for course ${courseId}`);
      console.log('Progress saved:', progress[courseId]);
    } else {
      // Update last visit even if already completed
      progress[courseId].lastVisit = data.id;
      setJSON("courseProgress", progress);
      setIsMarkedComplete(true);
      
      console.log(`ℹ️ Lesson ${data.id} already completed for course ${courseId}`);
    }
  } catch (error) {
    console.error("❌ Error marking lesson as completed:", error);
  }
}, [courseId, data.id, isMarkedComplete, course, allLessons.length]); // Fixed dependencies

  // Memoized callbacks
  const handleBack = useCallback(() => navigation.goBack(), [navigation]);
  
  const handleQuizPress = useCallback(() => {
    navigation.navigate("LessonQuiz", {
      lessonId: data.id,
      courseId: courseId,
      gradient1: gradient1,
      gradient2: gradient2,
    });
  }, [navigation, data.id, courseId, gradient1, gradient2]);

  // Not found view
  if (!data.title) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <View style={styles.notFound}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="document-text-outline" size={80} color="#9CA3AF" />
          </View>
          <Text style={styles.notFoundTitle}>Lesson Not Found</Text>
          <Text style={styles.notFoundSubtitle}>
            This lesson doesn't exist or has been removed
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <LinearGradient
              colors={["#4E7FFF", "#6B8FFF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.backButtonGradient}
            >
              <Text style={styles.backButtonText}>Go Back</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={50}
        windowSize={10}
        initialNumToRender={3}
      >
        <LessonHeader
          gradient1={gradient1}
          gradient2={gradient2}
          textColor={textColor}
          data={data}
          onBack={handleBack}
        />

        {/* Main Content Card */}
        <AnimatedCard delay={100}>
          <View style={styles.contentCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={styles.cardIcon}>
                  <Ionicons name="reader" size={20} color="#4E7FFF" />
                </View>
                <Text style={styles.cardTitle}>Lesson Content</Text>
              </View>
              <View style={styles.contentBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              </View>
            </View>
            <Text style={styles.contentText}>
              {data.content || "No lesson content available at the moment."}
            </Text>
          </View>
        </AnimatedCard>

        {/* Code Examples Section */}
        {data.examples?.length > 0 && (
          <AnimatedCard delay={200}>
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <LinearGradient
                  colors={["#8B5CF6", "#A78BFA"]}
                  style={styles.sectionIconContainer}
                >
                  <Ionicons name="code-slash" size={20} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.sectionTitle}>Code Examples</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{data.examples.length}</Text>
                </View>
              </View>

              {data.examples.map((example, index) => (
                <CodeExample
                  key={index}
                  example={example}
                  index={index}
                  courseId={courseId}
                />
              ))}
            </View>
          </AnimatedCard>
        )}

        {/* Tips Section */}
        {data.tips?.length > 0 && (
          <AnimatedCard delay={300}>
            <View style={styles.tipsCard}>
              <LinearGradient
                colors={["#FEF3C7", "#FDE68A"]}
                style={styles.tipsGradient}
              >
                <View style={styles.tipsHeader}>
                  <View style={styles.tipsIconContainer}>
                    <Ionicons name="bulb" size={24} color="#F59E0B" />
                  </View>
                  <View style={styles.tipsHeaderText}>
                    <Text style={styles.tipsTitle}>Pro Tips</Text>
                    <Text style={styles.tipsSubtitle}>Expert recommendations</Text>
                  </View>
                </View>

                {data.tips.map((tip, index) => (
                  <TipItem key={index} tip={tip} index={index} />
                ))}
              </LinearGradient>
            </View>
          </AnimatedCard>
        )}

        {/* Challenge Section */}
        {data.challenge && (
          <AnimatedCard delay={400}>
            <View style={styles.challengeCard}>
              <LinearGradient
                colors={["#DBEAFE", "#BFDBFE"]}
                style={styles.challengeGradient}
              >
                <View style={styles.challengeHeader}>
                  <View style={styles.challengeIconContainer}>
                    <Ionicons name="trophy" size={28} color="#3B82F6" />
                  </View>
                  <View style={styles.challengeHeaderText}>
                    <Text style={styles.challengeTitle}>Challenge Yourself</Text>
                    <Text style={styles.challengeSubtitle}>Test your knowledge</Text>
                  </View>
                </View>

                <Text style={styles.challengeText}>{data.challenge}</Text>
              </LinearGradient>
            </View>
          </AnimatedCard>
        )}

        {/* Action Buttons */}
        <AnimatedCard delay={500}>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8}>
              <View style={styles.secondaryButtonContent}>
                <Ionicons name="bookmark-outline" size={22} color="#4E7FFF" />
                <Text style={styles.secondaryButtonText}>Save for Later</Text>
              </View>
            </TouchableOpacity>

            {data.quiz?.length > 0 && (
              <TouchableOpacity
                onPress={handleQuizPress}
                activeOpacity={0.9}
                style={styles.primaryButtonContainer}
              >
                <LinearGradient
                  colors={[gradient1, gradient2]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButton}
                >
                  <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>
                    Take Quiz ({data.quiz.length})
                  </Text>
                  <Ionicons name="arrow-forward-circle" size={22} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </AnimatedCard>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 60,
    paddingHorizontal: 20,
    position: "relative",
  },
  headerBackButton: {
    marginBottom: 20,
  },
  backButtonCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  headerContent: {
    zIndex: 10,
  },
  lessonBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    alignSelf: "flex-start",
    marginBottom: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 20,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 14,
    fontWeight: "700",
    opacity: 0.95,
  },
  statDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.5,
  },
  waveContainer: {
    position: "absolute",
    bottom: -2,
    left: 0,
    right: 0,
    height: 50,
    overflow: "hidden",
  },
  wave: {
    position: "absolute",
    bottom: -2,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: "#F9FAFB",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  contentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#F3F4F6",
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
  },
  contentBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
  },
  contentText: {
    fontSize: 16,
    lineHeight: 28,
    color: "#374151",
    fontWeight: "500",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  sectionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
  },
  countBadge: {
    backgroundColor: "#F3E8FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#8B5CF6",
  },
  exampleContainer: {
    marginBottom: 20,
  },
  exampleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  exampleNumberBadge: {
    borderRadius: 14,
    overflow: "hidden",
  },
  exampleNumberGradient: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  exampleNumberText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  exampleDescription: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    lineHeight: 22,
  },
  codeBlock: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#374151",
  },
  codeBlockHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#111827",
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  codeBlockDots: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dotRed: {
    backgroundColor: "#EF4444",
  },
  dotYellow: {
    backgroundColor: "#F59E0B",
  },
  dotGreen: {
    backgroundColor: "#10B981",
  },
  languageBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#374151",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  languageText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#9CA3AF",
    letterSpacing: 0.5,
  },
  codeScrollView: {
    maxHeight: 300,
  },
  codeText: {
    fontFamily: "monospace",
    fontSize: 14,
    lineHeight: 24,
    color: "#D1D5DB",
    padding: 16,
  },
  tipsCard: {
    marginBottom: 20,
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#FDE68A",
  },
  tipsGradient: {
    padding: 24,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  tipsIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  tipsHeaderText: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#92400E",
    marginBottom: 2,
  },
  tipsSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#B45309",
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
  },
  tipIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    color: "#78350F",
    lineHeight: 24,
    fontWeight: "600",
  },
  challengeCard: {
    marginBottom: 20,
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#93C5FD",
  },
  challengeGradient: {
    padding: 24,
  },
  challengeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  challengeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  challengeHeaderText: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#1E40AF",
    marginBottom: 2,
  },
  challengeSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563EB",
  },
  challengeText: {
    fontSize: 15,
    color: "#1E3A8A",
    lineHeight: 26,
    fontWeight: "600",
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 14,
  },
  actionButtons: {
    gap: 12,
    marginHorizontal: 20,
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#4E7FFF",
    borderRadius: 20,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  secondaryButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 10,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#4E7FFF",
  },
  primaryButtonContainer: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#4E7FFF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 10,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },
  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    backgroundColor: "#F9FAFB",
  },
  errorIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    borderWidth: 4,
    borderColor: "#E5E7EB",
  },
  notFoundTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },
  notFoundSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
    fontWeight: "500",
  },
  backButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#4E7FFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  backButtonGradient: {
    paddingHorizontal: 40,
    paddingVertical: 16,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },
});