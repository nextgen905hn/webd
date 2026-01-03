import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from "react-native-linear-gradient";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useCoursesStore } from "../../utils/store";
import { clearAll, getJSON, setJSON } from '../../utils/Storage';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

export default function ProgressScreen() {
  const navigation=useNavigation();
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Fetch progress function
  const fetchProgress = useCallback(() => {
    try {
      const stored = getJSON('courseProgress') || {};

      setProgress(stored);

      console.log('📊 Fetched course progress:', stored);
      console.log('📊 Progress keys:', Object.keys(stored));

      // Debug: Log each course name
      Object.entries(stored).forEach(([key, course]) => {
        console.log(`✅ Key: ${key}, Course Name: ${course.name}, Completed: ${course.completed}, Total: ${course.total}`);
      });
    } catch (error) {
      console.error('❌ Error fetching course progress:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
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
    ]).start();
  }, []);

  // Refresh progress whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 Screen focused - refreshing progress...');
      fetchProgress();
    }, [fetchProgress])
  );

  const getTotalStats = () => {
    const courses = Object.values(progress);
    const totalCompleted = courses.reduce((sum, c) => sum + (c.completed || 0), 0);
    const totalLessons = courses.reduce((sum, c) => sum + (c.total || 0), 0);
    const totalCourses = courses.length;
    const completedCourses = courses.filter(c => c.completed === c.total && c.total > 0).length;
    
    return {
      totalCompleted,
      totalLessons,
      totalCourses,
      completedCourses,
      overallPercent: totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0,
    };
  };

  const stats = getTotalStats();

  const getCourseIcon = (courseName) => {
    if (!courseName) return 'code-slash';
    const name = courseName.toLowerCase().trim();
    
    // Check specific technologies first (before generic checks)
    if (name.includes('html')) return 'logo-html5';
    if (name.includes('css')) return 'logo-css3';
    if (name.includes('react')) return 'logo-react';
    if (name.includes('next')) return 'rocket-outline';
    if (name.includes('node')) return 'logo-nodejs';
    if (name.includes('mongo')) return 'server-outline';
    if (name.includes('redis')) return 'cloud-outline';
    if (name.includes('express')) return 'layers-outline';
    if (name.includes('javascript') || name === 'js') return 'logo-javascript';

    return 'code-slash';
  };

  const getCourseColor = (courseName) => {
    if (!courseName) return '#6C5CE7';
    const name = courseName.toLowerCase().trim();
    
    // Check specific technologies first (most specific to least specific)
    if (name.includes('html')) return '#E34F26';
    if (name.includes('css')) return '#1572B6';
    if (name.includes('react')) return '#61DAFB';
    if (name.includes('next')) return '#000000';
    if (name.includes('node')) return '#68A063';
    if (name.includes('mongo')) return '#47A248';
    if (name.includes('redis')) return '#DC382D';
    if (name.includes('express')) return '#259DFF';
    if (name.includes('javascript') || name === 'js') return '#F7DF1E';

    return '#6C5CE7';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#0A0118', '#1A0B2E', '#2D1B4E']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Progress</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={fetchProgress}
          >
            <Ionicons name="refresh" size={22} color="#FFFFFF" />
          </TouchableOpacity>
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
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Overall Stats Card */}
            {!loading && Object.keys(progress).length > 0 && (
              <View style={styles.overallCard}>
                <LinearGradient
                  colors={['rgba(56, 189, 248, 0.15)', 'rgba(139, 92, 246, 0.15)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.overallGradient}
                >
                  <View style={styles.overallHeader}>
                    <View style={styles.overallIconContainer}>
                      <LinearGradient
                        colors={['#38BDF8', '#8B5CF6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.overallIconGradient}
                      >
                        <Ionicons name="trophy" size={32} color="#FFFFFF" />
                      </LinearGradient>
                    </View>
                    <View style={styles.overallTextContainer}>
                      <Text style={styles.overallTitle}>Overall Progress</Text>
                      <Text style={styles.overallPercent}>{stats.overallPercent}%</Text>
                    </View>
                  </View>

                  <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                      <Text style={styles.statValue}>{stats.totalCompleted}</Text>
                      <Text style={styles.statLabel}>Completed</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statValue}>{stats.totalLessons}</Text>
                      <Text style={styles.statLabel}>Total Lessons</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statValue}>{stats.completedCourses}</Text>
                      <Text style={styles.statLabel}>Courses Done</Text>
                    </View>
                  </View>

                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBackground}>
                      <LinearGradient
                        colors={['#38BDF8', '#8B5CF6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.progressBarFill, { width: `${stats.overallPercent}%` }]}
                      />
                    </View>
                  </View>
                </LinearGradient>
              </View>
            )}

            {/* Section Title */}
            {!loading && Object.keys(progress).length > 0 && (
              <Text style={styles.sectionTitle}>Course Progress</Text>
            )}

            {/* Empty State */}
            {!loading && Object.keys(progress).length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <LinearGradient
                    colors={['rgba(56, 189, 248, 0.2)', 'rgba(139, 92, 246, 0.2)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.emptyIconGradient}
                  >
                    <Ionicons name="book-outline" size={48} color="#38BDF8" />
                  </LinearGradient>
                </View>
                <Text style={styles.emptyTitle}>No Progress Yet</Text>
                <Text style={styles.emptyText}>
                  Start learning to track your progress here
                </Text>
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={() => navigation.navigate("Home")}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#38BDF8', '#8B5CF6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.startGradient}
                  >
                    <Ionicons name="rocket" size={20} color="#FFFFFF" />
                    <Text style={styles.startButtonText}>Start Learning</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              // Course Cards
              Object.entries(progress).map(([key, course]) => {
                // Safety check
                if (!course || !course.name || typeof course.completed === 'undefined' || typeof course.total === 'undefined') {
                  console.log(`⚠️ Skipping invalid course data for key: ${key}`, course);
                  return null;
                }

                const percent = course.total > 0 ? Math.round((course.completed / course.total) * 100) : 0;
                const courseColor = getCourseColor(course.name);
                const courseIcon = getCourseIcon(course.name);
                
                console.log(`🎨 Rendering: ${course.name} - Icon: ${courseIcon}, Color: ${courseColor}, Progress: ${course.completed}/${course.total}`);
                
                return (
                  <TouchableOpacity
                    key={key}
                    style={styles.courseCard}
                    activeOpacity={0.7}
                  >
                    <View style={styles.courseHeader}>
                      <View style={[styles.courseIconContainer, { backgroundColor: courseColor+'20'}]}>
                        <Ionicons name={courseIcon} size={28} color={courseColor} />
                      </View>
                      <View style={styles.courseInfo}>
                        <Text style={styles.courseName}>{course.name}</Text>
                        <Text style={styles.courseProgress}>
                          {course.completed} of {course.total} lessons
                        </Text>
                      </View>
                      <View style={styles.percentBadge}>
                        <Text style={styles.percentText}>{percent}%</Text>
                      </View>
                    </View>

                    <View style={styles.progressBarContainer}>
                      <View style={styles.progressBarBackground}>
                        <View
                          style={[
                            styles.progressBarFill,
                            { width: `${percent}%`, backgroundColor: courseColor },
                          ]}
                        />
                      </View>
                    </View>

                    {percent === 100 && (
                      <View style={styles.completedBadge}>
                        <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                        <Text style={styles.completedText}>Completed</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }).filter(Boolean) // Remove null entries
            )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
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
  overallCard: {
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  overallGradient: {
    padding: 20,
  },
  overallHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  overallIconContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 16,
  },
  overallIconGradient: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overallTextContainer: {
    flex: 1,
  },
  overallTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A5B4FC',
    marginBottom: 4,
  },
  overallPercent: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#38BDF8',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#A5B4FC',
    fontWeight: '600',
  },
  progressBarContainer: {
    marginTop: 4,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  courseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  courseIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  courseInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  courseProgress: {
    fontSize: 13,
    color: '#A5B4FC',
  },
  percentBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  percentText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#38BDF8',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  completedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    borderRadius: 32,
    overflow: 'hidden',
    marginBottom: 20,
  },
  emptyIconGradient: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  emptyText: {
    fontSize: 15,
    color: '#C7D2FE',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  startButton: {
    borderRadius: 40,
    overflow: 'hidden',
    shadowColor: '#38BDF8',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  startGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    gap: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});