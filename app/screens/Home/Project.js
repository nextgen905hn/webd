import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../utils/firebase";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
const { width } = Dimensions.get('window');

export default function ProjectsScreen() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation=useNavigation();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const snapshot = await getDocs(collection(db, "pojects"));
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setProjects(data);
        console.log("Fetched projects:", data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <LinearGradient colors={["#0A0118", "#1A0B2E", "#2D1B4E"]} style={styles.gradient}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingSpinner}>
            <ActivityIndicator size="large" color="#a78bfa" />
          </View>
          <Text style={styles.loadingText}>Loading Projects...</Text>
          <Text style={styles.loadingSubText}>Preparing amazing content for you</Text>
        </View>
      </LinearGradient>
    );
  }

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return '#10b981';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#ef4444';
      default: return '#10b981';
    }
  };

  const getLevelIcon = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'leaf-outline';
      case 'intermediate': return 'flame-outline';
      case 'advanced': return 'rocket-outline';
      default: return 'leaf-outline';
    }
  };

  return (
    <LinearGradient colors={["#0A0118", "#1A0B2E", "#2D1B4E"]} style={styles.gradient}>
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTop}>
            <View style={styles.iconWrapper}>
              <LinearGradient colors={["#a78bfa", "#6366f1"]} style={styles.iconGradient}>
                <Ionicons name="rocket" size={28} color="#fff" />
              </LinearGradient>
            </View>
            <View style={styles.statsContainer}>
              <Text style={styles.statsNumber}>{projects.length}</Text>
              <Text style={styles.statsLabel}>Projects</Text>
            </View>
          </View>
          
          <Text style={styles.header}>Developer Projects</Text>
          <Text style={styles.subText}>
            Build real-world applications to strengthen your coding skills and portfolio
          </Text>
        </View>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={64} color="#64748b" />
            <Text style={styles.emptyText}>No projects available</Text>
            <Text style={styles.emptySubText}>Check back soon for new challenges</Text>
          </View>
        ) : (
          <View style={styles.projectsGrid}>
            {projects.map((p, index) => (
              <TouchableOpacity
                key={p.id}
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate(
                     "ProjectDetails",
                     { id: p.id },
                  )
                }
                style={[
                  styles.cardWrapper,
                  { animationDelay: `${index * 100}ms` }
                ]}
              >
                <LinearGradient 
                  colors={p.gradient || ["#8E2DE2", "#4A00E0"]} 
                  style={styles.card}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {/* Decorative elements */}
                  <View style={styles.decorCircle1} />
                  <View style={styles.decorCircle2} />
                  
                  <View style={styles.cardContent}>
                    {/* Card Header */}
                    <View style={styles.cardHeader}>
                      <View style={styles.iconBadge}>
                        <Ionicons name="code-slash" size={20} color="#fff" />
                      </View>
                      <View style={[styles.levelBadge, { backgroundColor: getLevelColor(p.level) }]}>
                        <Ionicons name={getLevelIcon(p.level)} size={12} color="#fff" />
                        <Text style={styles.levelText}>{p.level || "Beginner"}</Text>
                      </View>
                    </View>

                    {/* Title & Description */}
                    <View style={styles.cardBody}>
                      <Text style={styles.title} numberOfLines={2}>
                        {p.title}
                      </Text>
                      <Text style={styles.desc} numberOfLines={3}>
                        {p.desc}
                      </Text>
                    </View>

                    {/* Tech Stack */}
                    {p.tech && p.tech.length > 0 && (
                      <View style={styles.techSection}>
                        <View style={styles.techDivider} />
                        <ScrollView 
                          horizontal 
                          showsHorizontalScrollIndicator={false}
                          style={styles.techRow}
                        >
                          {p.tech.map((t, i) => (
                            <View key={i} style={styles.techTag}>
                              <View style={styles.techDot} />
                              <Text style={styles.techText}>{t}</Text>
                            </View>
                          ))}
                        </ScrollView>
                      </View>
                    )}

                    {/* Arrow indicator */}
                    <View style={styles.arrowContainer}>
                      <Ionicons name="arrow-forward" size={18} color="#fff" />
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { 
    flex: 1 
  },
  container: { 
    flex: 1 
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  
  // Header Styles
  headerContainer: {
    marginBottom: 32,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  iconWrapper: {
    shadowColor: "#a78bfa",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  iconGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    alignItems: 'flex-end',
  },
  statsNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
  },
  statsLabel: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: -4,
  },
  header: { 
    fontSize: 32, 
    color: "#fff", 
    fontWeight: "800",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subText: { 
    color: "#94a3b8", 
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },

  // Loading Styles
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    padding: 20,
  },
  loadingSpinner: {
    marginBottom: 20,
  },
  loadingText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 10,
  },
  loadingSubText: {
    color: "#94a3b8",
    fontSize: 14,
    marginTop: 6,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 20,
    color: '#cbd5e1',
    fontWeight: '700',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
  },

  // Projects Grid
  projectsGrid: {
    gap: 16,
  },
  cardWrapper: {
    marginBottom: 0,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  
  // Decorative elements
  decorCircle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -40,
    right: -40,
  },
  decorCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: -20,
    left: -20,
  },
  
  cardContent: {
    position: 'relative',
    zIndex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  levelText: { 
    color: "#fff", 
    fontWeight: "700", 
    fontSize: 12,
    textTransform: 'capitalize',
  },
  
  // Card Body
  cardBody: {
    marginBottom: 16,
  },
  title: { 
    fontSize: 22, 
    color: "#fff", 
    fontWeight: "800",
    marginBottom: 8,
    lineHeight: 28,
  },
  desc: { 
    color: "#e2e8f0", 
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
  
  // Tech Section
  techSection: {
    marginTop: 4,
  },
  techDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 12,
  },
  techRow: { 
    flexDirection: "row",
    marginHorizontal: -2,
  },
  techTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  techDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
    marginRight: 6,
  },
  techText: { 
    color: "#fff", 
    fontSize: 12, 
    fontWeight: "600",
  },
  
  // Arrow
  arrowContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});