import React, { memo, useMemo, useCallback, useEffect } from "react";
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useState } from "react";
import { useCoursesStore } from "../../utils/store";
import { getJSON, setJSON } from '../../utils/Storage';

const { width } = Dimensions.get("window");

const COURSE_CONFIG = {
  html: {
    gradient: ["#E44D26", "#FF6B4A"],
    icon: "logo-html5",
    bgColor: "#FFF5F5",
    accentColor: "#E44D26",
  },
  css: {
    gradient: ["#2965F1", "#5B9BFF"],
    icon: "logo-css3",
    bgColor: "#F0F7FF",
    accentColor: "#2965F1",
  },
  js: {
    gradient: ["#F2DF2E", "#FFE34D"],
    icon: "logo-javascript",
    bgColor: "#FFFBEB",
    accentColor: "#F0DB4F",
  },
  react: {
    gradient: ["#0ABAB5", "#61DAFB"],
    icon: "logo-react",
    bgColor: "#F0FDFF",
    accentColor: "#61DAFB",
  },
  nextjs: {
    gradient: ["#2D3436", "#6C5CE7"],
    icon: "rocket-outline",
    bgColor: "#F0FDFF",
    accentColor: "#6C5CE7",
  },
  nodejs: {
    icon: "leaf-outline",
    gradient: ["#00FF9D", "#00B894"],
    bgColor: "#F0FDFF",
    accentColor: "#00B894",
  },
  expressjs: {
    icon: "code-slash-outline",
    gradient: ["#303030", "#000000"],
    bgColor: "#F0FDFF",
    accentColor: "#00B894",
  },
  mongodb: {
    icon: "server-outline",
    gradient: ["#00B894", "#13EAC9"],
    bgColor: "#F0FDFF",
    accentColor: "#00B894",
  },
  redis: {
    icon: "cloud-outline",
    gradient: ["#FF4E50", "#FFAA00"],
    bgColor: "#F0FDFF",
    accentColor: "#00B894",
  },
};

// Header Component
const CourseHeader = memo(({ onBack, config }) => (
  <View style={s.header}>
    <TouchableOpacity onPress={onBack} style={s.backButton}>
      <Ionicons name="arrow-back" size={24} color="#1A1D2E" />
    </TouchableOpacity>
    <TouchableOpacity style={s.menuButton}>
      <Ionicons name="ellipsis-horizontal" size={24} color="#1A1D2E" />
    </TouchableOpacity>
  </View>
));

// Hero Section Component
const HeroSection = memo(({ course, config, totalLessons, completedLessons, progress }) => (
  <View style={s.heroSection}>
    <LinearGradient colors={config.gradient} style={s.iconContainer}>
      <Ionicons name={config.icon} size={48} color="#fff" />
    </LinearGradient>
    <Text style={s.courseTitle}>{course.course}</Text>
    <Text style={s.lessonCount}>
      {totalLessons} Lessons • {Math.ceil(totalLessons * 15)} min
    </Text>

    <View style={s.progressCard}>
      <View style={s.progressHeader}>
        <Text style={s.progressTitle}>Your Progress</Text>
        <Text style={s.progressPercent}>{Math.round(progress)}%</Text>
      </View>
      <View style={s.progressBarBg}>
        <LinearGradient
          colors={config.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[s.progressBarFill, { width: `${progress}%` }]}
        />
      </View>
      <Text style={s.progressSubtext}>
        {completedLessons} of {totalLessons} lessons completed
      </Text>
    </View>
  </View>
));

// Section Title Component
const SectionTitleHeader = memo(({ sectionsCount }) => (
  <View style={s.courseTitleContainer}>
    <Text style={s.sectionTitle}>Course Content</Text>
    <View style={s.sectionBadge}>
      <Text style={s.sectionBadgeText}>{sectionsCount} Sections</Text>
    </View>
  </View>
));

// Section Header Component
const SectionHeader = memo(
  ({ section, sectionIndex, config, completedInSection, sectionLessons }) => (
    <View style={s.sectionHeader}>
      <View style={s.sectionHeaderLeft}>
        <LinearGradient
          colors={[config.accentColor + "15", config.accentColor + "05"]}
          style={s.sectionIconContainer}
        >
          <View
            style={[
              s.sectionNumberBadge,
              { backgroundColor: config.accentColor },
            ]}
          >
            <Text style={s.sectionNumberText}>{sectionIndex + 1}</Text>
          </View>
        </LinearGradient>
        <View style={s.sectionTitleContainer}>
          <Text style={s.sectionTitleText}>{section.title}</Text>
          <View style={s.sectionMetaRow}>
            <View style={s.sectionMetaItem}>
              <Ionicons name="book-outline" size={12} color="#8B90A0" />
              <Text style={s.sectionMetaText}>{sectionLessons} lessons</Text>
            </View>
            <View style={s.sectionDot} />
            <View style={s.sectionMetaItem}>
              <Ionicons name="time-outline" size={12} color="#8B90A0" />
              <Text style={s.sectionMetaText}>{sectionLessons * 15} min</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={s.sectionProgressContainer}>
        <Text
          style={[
            s.sectionProgressText,
            completedInSection === sectionLessons && {
              color: config.accentColor,
              fontWeight: "800",
            },
          ]}
        >
          {completedInSection}/{sectionLessons}
        </Text>
      </View>
    </View>
  )
);

// Lesson Card Component
const LessonCard = memo(
  ({ lesson, isCompleted, isActive, config, onPress, isDark }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[s.lessonCard, isActive && s.lessonCardActive]}
    >
      <View style={s.lessonLeft}>
        <View
          style={[
            s.lessonNumber,
            isCompleted && s.lessonNumberCompleted,
            isActive && {
              backgroundColor: config.gradient[0],
              borderColor: config.gradient[0],
            },
          ]}
        >
          {isCompleted ? (
            <Ionicons name="checkmark" size={18} color="#fff" />
          ) : (
            <Text
              style={[s.lessonNumberText, isActive && s.lessonNumberTextActive]}
            >
              {lesson.id}
            </Text>
          )}
        </View>
        <View style={s.lessonInfo}>
          <Text style={s.lessonTitle} numberOfLines={2}>
            {lesson.title}
          </Text>
          <View style={s.lessonMeta}>
            <Ionicons name="time-outline" size={14} color="#8B90A0" />
            <Text style={s.lessonDuration}>~15 min</Text>
            {isCompleted && (
              <>
                <View style={s.dot} />
                <Text style={s.completedTag}>Completed</Text>
              </>
            )}
          </View>
        </View>
      </View>
      <View
        style={[
          s.lessonArrow,
          isActive && { backgroundColor: config.gradient[0] + "15" },
        ]}
      >
        <Ionicons
          name="chevron-forward"
          size={20}
          color={isActive ? config.gradient[0] : "#8B90A0"}
        />
      </View>
    </TouchableOpacity>
  )
);

// Test Card Component
const TestCard = memo(({ 
  isUnlocked, 
  onPress, 
  title, 
  subtitle, 
  badge, 
  icon, 
  colors 
}) => (
  <TouchableOpacity
    activeOpacity={isUnlocked ? 0.7 : 1}
    disabled={!isUnlocked}
    onPress={onPress}
    style={[s.testCard, !isUnlocked && s.testCardDisabled]}
  >
    <LinearGradient colors={colors} style={s.testCardGradient}>
      <View style={s.testCardContent}>
        <View style={s.testIconContainer}>
          <Ionicons name={icon} size={32} color="#FFFFFF" />
        </View>
        <View style={s.testInfo}>
          <Text style={s.testTitle}>{title}</Text>
          <Text style={s.testSubtitle}>{subtitle}</Text>
          {isUnlocked && badge && (
            <View style={s.testBadge}>
              <Ionicons
                name={badge.icon}
                size={14}
                color="#FCD34D"
                style={{ marginRight: 4 }}
              />
              <Text style={s.testBadgeText}>{badge.text}</Text>
            </View>
          )}
        </View>
        <View
          style={[
            s.testArrow,
            !isUnlocked && s.testArrowDisabled,
          ]}
        >
          <Ionicons
            name="arrow-forward"
            size={24}
            color={isUnlocked ? "#FFFFFF" : "#64748B"}
          />
        </View>
      </View>
    </LinearGradient>
  </TouchableOpacity>
));

export default function CourseDetail() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params || {};

  if (!id) {
    return (
      <SafeAreaView style={s.safeArea}>
        <Text>Loading course...</Text>
      </SafeAreaView>
    );
  }

  const config = COURSE_CONFIG[id] || COURSE_CONFIG["html"];
  const [completedLessons, setcompletedLessons] = useState(0);
  const [lessons, setlessons] = useState({});
  const [testScore, setTestScore] = useState(0);

  const { lessonsdata, loadCourse } = useCoursesStore();

  useEffect(() => {
    if (!lessonsdata[id]) {
      loadCourse(id);
    }
  }, [id, lessonsdata]);

  const course = lessonsdata[id];

  const totalLessons = useMemo(
    () => course?.sections.reduce((sum, s) => sum + s.lessons.length, 0) || 0,
    [course]
  );

  const allLessons = useMemo(
    () => course?.sections.flatMap((s) => s.lessons) || [],
    [course]
  );

  const progress = useMemo(
    () => (completedLessons / totalLessons) * 100,
    [completedLessons, totalLessons]
  );

  const isAllLessonsCompleted = completedLessons === totalLessons;
  const isCertificateUnlocked = testScore >= 50;
  const isDark = id === "js";

  // Flatten data structure for FlatList
  const flatListData = useMemo(() => {
    if (!course) return [];
    
    const items = [];
    
    // Add header item
    items.push({ type: 'header', key: 'header' });
    
    // Add hero section
    items.push({ type: 'hero', key: 'hero' });
    
    // Add section title
    items.push({ type: 'sectionTitle', key: 'sectionTitle' });
    
    // Add all sections and lessons
    course.sections.forEach((section, sectionIndex) => {
      items.push({
        type: 'sectionHeader',
        key: `section-${sectionIndex}`,
        section,
        sectionIndex,
      });
      
      section.lessons.forEach((lesson, lessonIndex) => {
        items.push({
          type: 'lesson',
          key: `lesson-${sectionIndex}-${lesson.id}`,
          lesson,
          sectionIndex,
        });
      });
    });
    
    // Add test card
    items.push({ type: 'test', key: 'test' });
    
    // Add certificate card
    items.push({ type: 'certificate', key: 'certificate' });
    
    // Add footer spacer
    items.push({ type: 'footer', key: 'footer' });
    
    return items;
  }, [course]);

  useFocusEffect(
    useCallback(() => {
      const initializeAndLoadProgress = () => {
        if (!course) return;

        try {
          let progress = getJSON("courseProgress") || {};
          
          if (!progress[id]) {
            progress[id] = {
              name: course.course,
              completed: 0,
              total: totalLessons,
              lessonsDone: [],
              lastVisit: -1,
              TestScore: 0,
              userAnswers: [],
              certId: null,
            };
            
            setJSON("courseProgress", progress);
          }

          const courseProgress = progress[id] || {};
          
          setcompletedLessons(courseProgress.completed || 0);
          setlessons(courseProgress);
          setTestScore(courseProgress.TestScore || 0);
        } catch (error) {
          console.error("Error with progress:", error);
          setcompletedLessons(0);
          setlessons({});
          setTestScore(0);
        }
      };

      initializeAndLoadProgress();
    }, [course, id, totalLessons])
  );

  const handleBack = useCallback(() => navigation.goBack(), [navigation]);

  const handleLessonPress = useCallback(
    (lessonId) => {
      navigation.navigate("LessonDetails", {
        lessonId,
        courseId: id,
        gradient1: config.gradient[0],
        gradient2: config.gradient[1],
      });
    },
    [navigation, id, config.gradient]
  );

  const handleContinue = useCallback(() => {
    const lastVisit = lessons?.lastVisit ?? -1;
    const nextLessonIndex =
      lastVisit === -1 || lastVisit >= allLessons.length ? 1 : lastVisit + 1;
    handleLessonPress(nextLessonIndex);
  }, [lessons, allLessons, handleLessonPress]);

  const handleTestPress = useCallback(() => {
    if (isAllLessonsCompleted) {
      navigation.navigate("FinalTest", { courseId: id });
    }
  }, [isAllLessonsCompleted, navigation, id]);

  const handleCertificatePress = useCallback(() => {
    if (isCertificateUnlocked) {
      navigation.navigate("Certificate", { courseId: id });
    }
  }, [isCertificateUnlocked, navigation, id]);

  const renderItem = useCallback(({ item }) => {
    switch (item.type) {
      case 'header':
        return <CourseHeader onBack={handleBack} config={config} />;
      
      case 'hero':
        return (
          <HeroSection
            course={course}
            config={config}
            totalLessons={totalLessons}
            completedLessons={completedLessons}
            progress={progress}
          />
        );
      
      case 'sectionTitle':
        return <SectionTitleHeader sectionsCount={course.sections.length} />;
      
      case 'sectionHeader':
        const sectionLessons = item.section.lessons.length;
        const completedInSection = item.section.lessons.filter((l) =>
          lessons?.lessonsDone?.includes(l.id)
        ).length;
        
        return (
          <SectionHeader
            section={item.section}
            sectionIndex={item.sectionIndex}
            config={config}
            completedInSection={completedInSection}
            sectionLessons={sectionLessons}
          />
        );
      
      case 'lesson':
        return (
          <View style={s.lessonsContainer}>
            <LessonCard
              lesson={item.lesson}
              isCompleted={lessons?.lessonsDone?.includes(item.lesson.id)}
              isActive={lessons?.lastVisit === item.lesson.id}
              config={config}
              onPress={() => handleLessonPress(item.lesson.id)}
              isDark={isDark}
            />
          </View>
        );
      
      case 'test':
        return (
          <TestCard
            isUnlocked={isAllLessonsCompleted}
            onPress={handleTestPress}
            title="Final Test"
            subtitle={
              isAllLessonsCompleted
                ? "Test your knowledge and earn certificate"
                : "Complete all lessons to unlock"
            }
            badge={
              isAllLessonsCompleted
                ? { icon: "flash", text: "Ready to take test" }
                : null
            }
            icon={isAllLessonsCompleted ? "trophy-outline" : "lock-closed"}
            colors={
              isAllLessonsCompleted
                ? ["#8B5CF6", "#A78BFA"]
                : ["#98A3B9", "#CBD589"]
            }
          />
        );
      
      case 'certificate':
        return (
          <TestCard
            isUnlocked={isCertificateUnlocked}
            onPress={handleCertificatePress}
            title="Certificate"
            subtitle={
              isCertificateUnlocked
                ? "Download your course completion certificate"
                : `Score at least 50% on the final test (Current: ${testScore}%)`
            }
            badge={
              isCertificateUnlocked
                ? { icon: "checkmark-circle", text: "Certificate Unlocked" }
                : null
            }
            icon={isCertificateUnlocked ? "ribbon-outline" : "lock-closed"}
            colors={
              isCertificateUnlocked
                ? ["#10B981", "#34D399"]
                : ["#98A3B9", "#CBD589"]
            }
          />
        );
      
      case 'footer':
        return <View style={{ height: 100 }} />;
      
      default:
        return null;
    }
  }, [
    course,
    config,
    totalLessons,
    completedLessons,
    progress,
    lessons,
    isAllLessonsCompleted,
    isCertificateUnlocked,
    testScore,
    isDark,
    handleBack,
    handleLessonPress,
    handleTestPress,
    handleCertificatePress,
  ]);

  const getItemLayout = useCallback((data, index) => ({
    length: 100, // Approximate height
    offset: 100 * index,
    index,
  }), []);

  if (!course) {
    return (
      <SafeAreaView style={s.safeArea}>
        <View style={s.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#8B90A0" />
          <Text style={s.errorText}>Course not found</Text>
          <TouchableOpacity style={s.errorButton} onPress={handleBack}>
            <Text style={s.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={[s.safeArea, { backgroundColor: config.bgColor }]}>
        <FlatList
          data={flatListData}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={10}
          contentContainerStyle={s.flatListContent}
        />

        <View style={s.fabContainer}>
          <TouchableOpacity activeOpacity={0.9} onPress={handleContinue}>
            <LinearGradient colors={config.gradient} style={s.fab}>
              <Text style={[s.fabText, { color: isDark ? "#000" : "#fff" }]}>
                Continue Learning
              </Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={isDark ? "#000" : "#fff"}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1 },
  flatListContent: { paddingBottom: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  heroSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  courseTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#1A1D2E",
    marginBottom: 8,
    textAlign: "center",
  },
  lessonCount: {
    fontSize: 15,
    color: "#8B90A0",
    fontWeight: "600",
    marginBottom: 24,
  },
  progressCard: {
    width: width - 40,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressTitle: { fontSize: 16, fontWeight: "700", color: "#1A1D2E" },
  progressPercent: { fontSize: 20, fontWeight: "800", color: "#1A1D2E" },
  progressBarBg: {
    width: "100%",
    height: 8,
    backgroundColor: "#F1F3F9",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: { height: "100%", borderRadius: 4 },
  progressSubtext: { fontSize: 13, color: "#8B90A0", fontWeight: "600" },
  courseTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: { fontSize: 22, fontWeight: "800", color: "#1A1D2E" },
  sectionBadge: {
    backgroundColor: "#F1F3F9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sectionBadgeText: { fontSize: 12, fontWeight: "700", color: "#5B6B7F" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginHorizontal: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  sectionHeaderLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  sectionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  sectionNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionNumberText: { fontSize: 14, fontWeight: "800", color: "#fff" },
  sectionTitleContainer: { flex: 1 },
  sectionTitleText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1A1D2E",
    marginBottom: 6,
    lineHeight: 22,
  },
  sectionMetaRow: { flexDirection: "row", alignItems: "center" },
  sectionMetaItem: { flexDirection: "row", alignItems: "center" },
  sectionMetaText: {
    fontSize: 12,
    color: "#8B90A0",
    fontWeight: "600",
    marginLeft: 4,
  },
  sectionDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 8,
  },
  sectionProgressContainer: {
    backgroundColor: "#F8F9FC",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 12,
  },
  sectionProgressText: { fontSize: 13, fontWeight: "700", color: "#64748B" },
  lessonsContainer: { paddingHorizontal: 20, paddingLeft: 28 },
  lessonCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  lessonCardActive: {
    borderWidth: 2,
    borderColor: "#E8F0FE",
    shadowOpacity: 0.06,
  },
  lessonLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  lessonNumber: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#F8F9FC",
    borderWidth: 2,
    borderColor: "#E8EBF4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  lessonNumberCompleted: { backgroundColor: "#10B981", borderColor: "#10B981" },
  lessonNumberText: { fontSize: 15, fontWeight: "700", color: "#8B90A0" },
  lessonNumberTextActive: { color: "#fff" },
  lessonInfo: { flex: 1 },
  lessonTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1D2E",
    marginBottom: 5,
    lineHeight: 20,
  },
  lessonMeta: { flexDirection: "row", alignItems: "center" },
  lessonDuration: {
    fontSize: 12,
    color: "#8B90A0",
    fontWeight: "600",
    marginLeft: 4,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#8B90A0",
    marginHorizontal: 8,
  },
  completedTag: { fontSize: 11, color: "#10B981", fontWeight: "700" },
  lessonArrow: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "#F8F9FC",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  testCard: {
    marginTop: 12,
    marginBottom: 16,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  testCardDisabled: { opacity: 0.7 },
  testCardGradient: { padding: 20 },
  testCardContent: { flexDirection: "row", alignItems: "center" },
  testIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  testInfo: { flex: 1 },
  testTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  testSubtitle: {
    fontSize: 13,
    color: "#FFFFFF",
    opacity: 0.9,
    fontWeight: "500",
    lineHeight: 18,
  },
  testBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginTop: 10,
  },
  testBadgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  testArrow: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  testArrowDisabled: { backgroundColor: "rgba(255,255,255,0.1)" },
  fabContainer: { position: "absolute", bottom: 20, left: 20, right: 20 },
  fab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  fabText: { fontSize: 17, fontWeight: "800", marginRight: 8 },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#8B90A0",
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: "#667eea",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  errorButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});