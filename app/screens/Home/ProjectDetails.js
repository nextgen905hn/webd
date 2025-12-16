import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Dimensions,
  Animated,
  StatusBar,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../utils/firebase";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getJSON, setJSON } from '../../utils/Storage';

const { width, height } = Dimensions.get("window");
const isSmallDevice = width < 375;
const isMediumDevice = width >= 375 && width < 768;
const isTablet = width >= 768;

export default function ProjectDetailScreen() {
    const route=useRoute()
  const { id } = route.params;
  const navigation = useNavigation();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const snapshot = await getDocs(collection(db, "projectsDetail"));
        const projects = snapshot.docs.map(doc => doc.data());
        const found = projects.find(p => p.id === Number(id));
        setProject(found);
        
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]).start();
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <LinearGradient
        colors={['#0A0118', '#1A0B2E', '#2D1B4E']}
        style={styles.centered}
      >
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED']}
            style={styles.loadingIconContainer}
          >
            <ActivityIndicator size="large" color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.loadingText}>Loading Project...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!project) {
    return (
      <LinearGradient
        colors={['#0A0118', '#1A0B2E', '#2D1B4E']}
        style={styles.centered}
      >
        <StatusBar barStyle="light-content" />
        <Ionicons name="folder-open-outline" size={80} color="#64748B" />
        <Text style={styles.notFoundText}>Project not found</Text>
        <TouchableOpacity
          style={styles.goBackButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Full Body ScrollView */}
      <ScrollView
        style={styles.fullScrollView}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Header Section */}
        <LinearGradient colors={project.gradient} style={styles.headerGradient}>
          {/* Animated Background Elements */}
          <View style={styles.headerDecoration}>
            <View style={[styles.decorativeCircle, styles.circle1]} />
            <View style={[styles.decorativeCircle, styles.circle2]} />
            <View style={[styles.decorativeCircle, styles.circle3]} />
          </View>

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
              style={styles.backButtonGradient}
            >
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Header Content */}
          <Animated.View
            style={[
              styles.headerContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.iconBadge}>
              <LinearGradient
                colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.15)']}
                style={styles.iconBadgeGradient}
              >
                <Ionicons name="code-slash" size={isTablet ? 40 : 32} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={styles.title}>{project.title}</Text>
            <Text style={styles.description}>{project.description}</Text>
          </Animated.View>
        </LinearGradient>

        {/* Content Section */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Tech Stack Card */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={styles.iconGradient}
                >
                  <Ionicons name="layers" size={20} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <Text style={styles.sectionTitle}>Tech Stack</Text>
            </View>
            <View style={styles.techGrid}>
              {project.tech.map((item, index) => (
                <View key={index} style={styles.techChip}>
                  <LinearGradient
                    colors={['rgba(139, 92, 246, 0.15)', 'rgba(124, 58, 237, 0.1)']}
                    style={styles.techChipGradient}
                  >
                    <Ionicons name="checkmark-circle" size={16} color="#8B5CF6" />
                    <Text style={styles.techText}>{item}</Text>
                  </LinearGradient>
                </View>
              ))}
            </View>
          </View>

          {/* Features Card */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.iconGradient}
                >
                  <Ionicons name="rocket" size={20} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <Text style={styles.sectionTitle}>Key Features</Text>
            </View>
            {project.features.map((item, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureBullet}>
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.bulletGradient}
                  />
                </View>
                <Text style={styles.featureText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Code Snippet Card */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={['#F59E0B', '#D97706']}
                  style={styles.iconGradient}
                >
                  <Ionicons name="code-slash" size={20} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <Text style={styles.sectionTitle}>Code Preview</Text>
            </View>
            <View style={styles.codeContainer}>
              <View style={styles.codeHeader}>
                <View style={styles.codeDots}>
                  <View style={[styles.dot, { backgroundColor: '#FF5F57' }]} />
                  <View style={[styles.dot, { backgroundColor: '#FFBD2E' }]} />
                  <View style={[styles.dot, { backgroundColor: '#28CA42' }]} />
                </View>
                <Text style={styles.codeLanguage}>JavaScript</Text>
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled={true}
              >
                <Text style={styles.codeText}>{project.codeSnippet}</Text>
              </ScrollView>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => Linking.openURL(project.demoUrl)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Ionicons name="globe-outline" size={22} color="#FFFFFF" />
                <Text style={styles.buttonText}>Live Demo</Text>
                <Ionicons name="open-outline" size={16} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => Linking.openURL(project.codeUrl)}
              activeOpacity={0.8}
            >
              <View style={styles.secondaryButtonContent}>
                <Ionicons name="logo-github" size={22} color="#1E293B" />
                <Text style={styles.secondaryButtonText}>View Code</Text>
                <Ionicons name="arrow-forward" size={16} color="#1E293B" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Footer Badge */}
          <View style={styles.footerBadge}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.1)', 'rgba(124, 58, 237, 0.05)']}
              style={styles.footerBadgeGradient}
            >
              <Ionicons name="bulb" size={18} color="#8B5CF6" />
              <Text style={styles.footerText}>Built for Learning & Growth</Text>
            </LinearGradient>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  fullScrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  headerGradient: {
    paddingTop: isTablet ? 60 : 50,
    paddingBottom: isTablet ? 50 : 40,
    paddingHorizontal: isTablet ? 40 : 20,
    borderBottomLeftRadius: isTablet ? 40 : 30,
    borderBottomRightRadius: isTablet ? 40 : 30,
    overflow: 'hidden',
  },
  headerDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  circle1: {
    width: isTablet ? 200 : 150,
    height: isTablet ? 200 : 150,
    top: isTablet ? -60 : -50,
    right: isTablet ? -40 : -30,
  },
  circle2: {
    width: isTablet ? 130 : 100,
    height: isTablet ? 130 : 100,
    bottom: isTablet ? -30 : -20,
    left: isTablet ? -30 : -20,
  },
  circle3: {
    width: isTablet ? 110 : 80,
    height: isTablet ? 110 : 80,
    top: isTablet ? 120 : 100,
    right: isTablet ? 70 : 50,
  },
  backButton: {
    width: isTablet ? 50 : 44,
    height: isTablet ? 50 : 44,
    borderRadius: isTablet ? 16 : 14,
    overflow: 'hidden',
    marginBottom: isTablet ? 24 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  backButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  iconBadge: {
    width: isTablet ? 100 : 80,
    height: isTablet ? 100 : 80,
    borderRadius: isTablet ? 30 : 24,
    overflow: 'hidden',
    marginBottom: isTablet ? 24 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  iconBadgeGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  title: {
    fontSize: isTablet ? 38 : isSmallDevice ? 26 : 32,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: isTablet ? 16 : 12,
    letterSpacing: -0.5,
    paddingHorizontal: isTablet ? 40 : 20,
  },
  description: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: isTablet ? 18 : isSmallDevice ? 15 : 16,
    textAlign: 'center',
    lineHeight: isTablet ? 28 : 24,
    paddingHorizontal: isTablet ? 60 : 10,
    fontWeight: '500',
    maxWidth: isTablet ? 700 : '100%',
  },
  content: {
    paddingHorizontal: isTablet ? 40 : 20,
    paddingTop: isTablet ? 32 : 24,
    paddingBottom: 40,
    maxWidth: isTablet ? 1200 : '100%',
    width: '100%',
    alignSelf: 'center',
  },
  sectionCard: {
    backgroundColor: '#1E293B',
    borderRadius: isTablet ? 24 : 20,
    padding: isTablet ? 28 : 20,
    marginBottom: isTablet ? 24 : 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isTablet ? 20 : 16,
  },
  iconContainer: {
    width: isTablet ? 46 : 40,
    height: isTablet ? 46 : 40,
    borderRadius: isTablet ? 14 : 12,
    overflow: 'hidden',
    marginRight: isTablet ? 14 : 12,
  },
  iconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: isTablet ? 24 : isSmallDevice ? 18 : 20,
    fontWeight: '700',
    flex: 1,
  },
  techGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: isTablet ? 12 : 10,
  },
  techChip: {
    borderRadius: isTablet ? 14 : 12,
    overflow: 'hidden',
  },
  techChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isTablet ? 18 : 14,
    paddingVertical: isTablet ? 12 : 10,
    gap: isTablet ? 8 : 6,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  techText: {
    color: '#E0E7FF',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: isTablet ? 16 : 12,
  },
  featureBullet: {
    width: isTablet ? 28 : 24,
    height: isTablet ? 28 : 24,
    borderRadius: isTablet ? 10 : 8,
    overflow: 'hidden',
    marginRight: isTablet ? 14 : 12,
    marginTop: 2,
  },
  bulletGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    color: '#CBD5E1',
    fontSize: isTablet ? 17 : isSmallDevice ? 14 : 15,
    lineHeight: isTablet ? 26 : 22,
    fontWeight: '500',
  },
  codeContainer: {
    backgroundColor: '#0F172A',
    borderRadius: isTablet ? 18 : 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.2)',
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: isTablet ? 16 : 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  codeDots: {
    flexDirection: 'row',
    gap: isTablet ? 8 : 6,
  },
  dot: {
    width: isTablet ? 14 : 12,
    height: isTablet ? 14 : 12,
    borderRadius: isTablet ? 7 : 6,
  },
  codeLanguage: {
    color: '#94A3B8',
    fontSize: isTablet ? 14 : 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  codeText: {
    color: '#E2E8F0',
    fontFamily: 'monospace',
    fontSize: isTablet ? 15 : 13,
    lineHeight: isTablet ? 24 : 20,
    padding: isTablet ? 20 : 16,
  },
  buttonContainer: {
    gap: isTablet ? 16 : 12,
    marginTop: isTablet ? 12 : 8,
    marginBottom: isTablet ? 32 : 24,
    flexDirection: isTablet ? 'row' : 'column',
  },
  primaryButton: {
    borderRadius: isTablet ? 18 : 16,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    flex: isTablet ? 1 : undefined,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isTablet ? 18 : 16,
    gap: isTablet ? 12 : 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    borderRadius: isTablet ? 18 : 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    flex: isTablet ? 1 : undefined,
  },
  secondaryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isTablet ? 18 : 16,
    gap: isTablet ? 12 : 10,
  },
  secondaryButtonText: {
    color: '#1E293B',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footerBadge: {
    borderRadius: isTablet ? 18 : 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  footerBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isTablet ? 16 : 14,
    gap: isTablet ? 10 : 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  footerText: {
    color: '#8B5CF6',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingIconContainer: {
    width: isTablet ? 100 : 80,
    height: isTablet ? 100 : 80,
    borderRadius: isTablet ? 30 : 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    marginTop: 12,
  },
  notFoundText: {
    color: '#94A3B8',
    fontSize: isTablet ? 22 : 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 30,
  },
  goBackButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: isTablet ? 36 : 28,
    paddingVertical: isTablet ? 16 : 14,
    borderRadius: isTablet ? 14 : 12,
  },
  goBackText: {
    color: '#FFFFFF',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
  },
});