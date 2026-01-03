import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  Share,
  ActivityIndicator,
  Linking,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
 PermissionsAndroid, 
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ViewShot from "react-native-view-shot";
import axios from "axios";
import CertificateCard from "../../Components/Certificate";
import { db } from "../../utils/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getJSON, setJSON, getString } from '../../utils/Storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
} from "react-native-reanimated";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import RNFS from "react-native-fs";
import { PERMISSIONS, request, RESULTS, check } from 'react-native-permissions';

const courseMap = {
  html: "HTML Mastery",
  css: "CSS Mastery",
  js: "JavaScript Pro",
  react: "React Mastery",
  nextjs: "Next.js Mastery",
  nodejs: "Node.js Mastery",
  express: "Express.js Mastery",
  mongodb: "MongoDB Mastery",
  redis: "Redis Mastery",
};

export default function CertificateScreen() {
  const route = useRoute();
  const { courseId } = route.params;
  const navigation = useNavigation();
  const courseName = courseMap[courseId] || "Unknown Course";

  const viewRef = useRef();
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const [student, setStudent] = useState("Student");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  // Animation values
  const progressAnim = useSharedValue(0);
  const pulseAnim = useSharedValue(1);

  // Load username on mount
  useEffect(() => {
    const loadUserName =  () => {
      try {
        // Try to get username directly
        const username = getString("username");
        
        if (username) {
          setStudent(username);
        } else {
          // Fallback: try to get from courseProgress
          const progress =  getJSON("courseProgress");
          if (progress && progress.username) {
            setStudent(progress.username);
          } else {
            setStudent("Student");
          }
        }
      } catch (err) {
        console.error("Error loading user name:", err);
        setStudent("Student");
      }
    };

    loadUserName();
  }, []);

  useEffect(() => {
    if (isDownloading) {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        false
      );
    } else {
      pulseAnim.value = withTiming(1);
    }
  }, [isDownloading]);

  useEffect(() => {
    progressAnim.value = withSpring(downloadProgress, {
      damping: 20,
      stiffness: 90,
    });
  }, [downloadProgress]);

  const uploadToCloudinary = async (uri) => {
    try {
      const formData = new FormData();
      formData.append("file", {
        uri,
        type: "image/png",
        name: "certificate.png",
      });
      formData.append("upload_preset", "webdev");
      formData.append("folder", "certificates");

      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dc3n1nrte/image/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return res.data.secure_url;
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      throw err;
    }
  };

  const saveCertificateLocally =  (certData) => {
    try {
      const progress =  getJSON("courseProgress") || {};

      if (!progress[courseId]) progress[courseId] = {};
      progress[courseId].certId = certData.certId;

       setJSON("courseProgress", progress);
    } catch (err) {
      console.error("Error saving certificate locally:", err);
    }
  };

  const saveCertificateToFirebase = async (certData) => {
    try {
      await setDoc(doc(db, "certificates", certData.certId), certData);
    } catch (err) {
      console.error("Firebase save error:", err);
    }
  };

  const generateCertificate = async () => {
    try {
      setLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 500));

      const uri = await viewRef.current.capture({
        format: "png",
        quality: 1.0,
        result: "tmpfile",
      });

      const cloudUrl = await uploadToCloudinary(uri);
      const certId = `CERT-${Date.now()}`;

      const certData = {
        certId,
        courseId,
        courseName,
        cloudUrl,
        date: new Date().toISOString(),
      };

      await saveCertificateLocally(certData);
      await saveCertificateToFirebase(certData);

      setCertificate(certData);
      setLoading(false);
      return certData;
    } catch (err) {
      setLoading(false);
      Alert.alert("Error", err.message);
      console.error("Generate certificate error:", err);
    }
  };

  const getCertificate =  async() => {
    try {
      const progress =  getJSON("courseProgress") || {};
      const certId = progress[courseId]?.certId;

      if (certId) {
        const docSnap = await getDoc(doc(db, "certificates", certId));
        if (docSnap.exists()) return docSnap.data();
      }
      return await generateCertificate();
    } catch (err) {
      console.error("Error getting certificate:", err);
      return await generateCertificate();
    }
  };

  const handleShare = async () => {
    try {
      setLoading(true);
      const cert = await getCertificate();
      setCertificate(cert);

      await Share.share({
        message: `🎓 I completed "${cert.courseName}"! View my certificate: ${cert.cloudUrl}`,
        url: cert.cloudUrl,
      });
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Share error:", err);
    }
  };

 const requestStoragePermission = async () => {
  try {
    let permission;
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        permission = PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
      } else {
        permission = PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;
      }
    } else {
      permission = PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY; // iOS 14+
    }

    const result = await request(permission);
    return result === RESULTS.GRANTED;
  } catch (err) {
    console.error('Permission Error:', err);
    return false;
  }
};
const handleDownload = async () => {
  try {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Cannot save to gallery');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(30);

    const cert = await getCertificate();
    const imageUrl = cert?.cloudUrl;
    
    if (!imageUrl) {
      throw new Error('Certificate image URL not found');
    }

    const fileName = `certificate_${Date.now()}.png`;
    const downloadPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

    setDownloadProgress(60);

    const downloadResult = await RNFS.downloadFile({
      fromUrl: imageUrl,
      toFile: downloadPath,
    }).promise;

    if (!downloadResult || downloadResult.statusCode !== 200) {
      throw new Error('File download failed');
    }

    setDownloadProgress(90);

    await CameraRoll.save(downloadPath, { type: 'photo' });

    setDownloadProgress(100);
    setIsDownloading(false);

    Alert.alert('Saved!', 'Certificate saved to your gallery.');
  } catch (error) {
    console.error('Download error:', error);
    Alert.alert('Download Failed', error.message || 'An error occurred');
    setIsDownloading(false);
  }
};

  const handleView = async () => {
    try {
      setLoading(true);
      const cert = await getCertificate();
      setCertificate(cert);
      setLoading(false);
      Linking.openURL(cert.cloudUrl);
    } catch (err) {
      setLoading(false);
      console.error("View error:", err);
    }
  };

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value}%`,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E27" />
      <LinearGradient
        colors={["#0A0E27", "#1A1F3A", "#0F1629"]}
        style={styles.gradientBackground}
      >
        <SafeAreaView style={styles.container} edges={["top"]}>
          {/* Modern Header with Glassmorphism */}
          <View style={styles.headerContainer}>
            <LinearGradient
              colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]}
              style={styles.header}
            >
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <LinearGradient
                  colors={["rgba(99,102,241,0.3)", "rgba(139,92,246,0.3)"]}
                  style={styles.backButtonGradient}
                >
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle}>Your Certificate</Text>
                <View style={styles.headerSubtitleContainer}>
                  <View style={styles.glowDot} />
                  <Text style={styles.headerSubtitle}>
                    Achievement Unlocked
                  </Text>
                </View>
              </View>
              <View style={styles.placeholder} />
            </LinearGradient>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Floating Certificate with Glow Effect */}
            <View style={styles.certificateContainer}>
              <View style={styles.certificateGlow} />
              <ViewShot
                ref={viewRef}
                options={{
                  format: "png",
                  quality: 1.0,
                  result: "tmpfile",
                }}
                style={styles.certificateWrapper}
              >
                <CertificateCard
                  name={student}
                  course={courseName}
                  date={new Date().toDateString()}
                  certId={certificate?.certId || `CERT-${Date.now()}`}
                  width={340}
                  height={480}
                />
              </ViewShot>
            </View>

            {/* Modern Info Card */}
            <LinearGradient
              colors={["rgba(99,102,241,0.15)", "rgba(139,92,246,0.15)"]}
              style={styles.infoCard}
            >
              <View style={styles.infoHeader}>
                <View style={styles.trophyContainer}>
                  <LinearGradient
                    colors={["#FFD93D", "#FFA500"]}
                    style={styles.trophyGradient}
                  >
                    <Ionicons name="trophy" size={28} color="#FFFFFF" />
                  </LinearGradient>
                </View>
                <View style={styles.infoTitleContainer}>
                  <Text style={styles.infoTitle}>Congratulations!</Text>
                  <Text style={styles.infoSubtitle}>🎉 Well Done</Text>
                </View>
              </View>
              <Text style={styles.infoText}>
                You've successfully completed {courseName}. Share your
                achievement with the world or download your certificate for your
                records.
              </Text>
            </LinearGradient>

            {/* Download Progress Indicator */}
            {isDownloading && (
              <Animated.View style={[styles.progressCard, pulseStyle]}>
                <LinearGradient
                  colors={["rgba(16,185,129,0.2)", "rgba(52,211,153,0.2)"]}
                  style={styles.progressCardGradient}
                >
                  <View style={styles.progressHeader}>
                    <Ionicons name="cloud-download" size={24} color="#10B981" />
                    <Text style={styles.progressTitle}>
                      Downloading Certificate
                    </Text>
                  </View>

                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBackground}>
                      <Animated.View
                        style={[styles.progressBarFill, progressBarStyle]}
                      >
                        <LinearGradient
                          colors={["#10B981", "#34D399"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.progressBarGradient}
                        />
                      </Animated.View>
                    </View>
                    <Text style={styles.progressText}>{downloadProgress}%</Text>
                  </View>

                  <View style={styles.progressDetails}>
                    <View style={styles.progressDetailItem}>
                      <View style={styles.progressDot} />
                      <Text style={styles.progressDetailText}>
                        {downloadProgress < 100
                          ? "Downloading..."
                          : "Complete!"}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </Animated.View>
            )}

            {/* Modern Action Buttons */}
            <View style={styles.actionButtons}>
              {/* Share Button */}
              <TouchableOpacity
                onPress={handleShare}
                disabled={loading}
                style={[styles.actionButton, loading && styles.buttonDisabled]}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#6366F1", "#8B5CF6", "#A855F7"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientButton}
                >
                  <View style={styles.buttonIconContainer}>
                    <Ionicons name="share-social" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.buttonTextContainer}>
                    <Text style={styles.buttonText}>Share</Text>
                    <Text style={styles.buttonSubtext}>
                      Show your achievement
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>

              {/* Download Button */}
              <TouchableOpacity
                onPress={handleDownload}
                disabled={loading}
                style={[styles.actionButton, loading && styles.buttonDisabled]}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#10B981", "#34D399", "#6EE7B7"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientButton}
                >
                  <View style={styles.buttonIconContainer}>
                    {isDownloading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Ionicons name="download" size={24} color="#FFFFFF" />
                    )}
                  </View>
                  <View style={styles.buttonTextContainer}>
                    <Text style={styles.buttonText}>
                      {isDownloading ? "Downloading..." : "Download"}
                    </Text>
                    <Text style={styles.buttonSubtext}>
                      {isDownloading
                        ? `${downloadProgress}% complete`
                        : "Save to gallery"}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>

              {/* View Button */}
              <TouchableOpacity
                onPress={handleView}
                disabled={loading}
                style={[styles.actionButton, loading && styles.buttonDisabled]}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#F59E0B", "#FBBF24", "#FCD34D"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientButton}
                >
                  <View style={styles.buttonIconContainer}>
                    <Ionicons name="eye" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.buttonTextContainer}>
                    <Text style={styles.buttonText}>View Full Size</Text>
                    <Text style={styles.buttonSubtext}>Open in browser</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Modern Loading Indicator */}
            {loading && !isDownloading && (
              <LinearGradient
                colors={["rgba(99,102,241,0.2)", "rgba(139,92,246,0.2)"]}
                style={styles.loadingContainer}
              >
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={styles.loadingText}>Processing...</Text>
                <Text style={styles.loadingSubtext}>Please wait</Text>
              </LinearGradient>
            )}

            {/* Certificate Info Card */}
            {certificate && (
              <LinearGradient
                colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
                style={styles.certInfoCard}
              >
                <View style={styles.certInfoHeader}>
                  <Ionicons name="shield-checkmark" size={24} color="#10B981" />
                  <Text style={styles.certInfoTitle}>Certificate Details</Text>
                </View>
                <View style={styles.certInfoDivider} />
                <View style={styles.certInfoRow}>
                  <View style={styles.certInfoIconContainer}>
                    <Ionicons name="document-text" size={20} color="#6366F1" />
                  </View>
                  <View style={styles.certInfoTextContainer}>
                    <Text style={styles.certInfoLabel}>Certificate ID</Text>
                    <Text style={styles.certInfoValue}>
                      {certificate.certId}
                    </Text>
                  </View>
                </View>
                <View style={styles.certInfoRow}>
                  <View style={styles.certInfoIconContainer}>
                    <Ionicons name="calendar" size={20} color="#10B981" />
                  </View>
                  <View style={styles.certInfoTextContainer}>
                    <Text style={styles.certInfoLabel}>Date Issued</Text>
                    <Text style={styles.certInfoValue}>
                      {new Date(certificate.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Text>
                  </View>
                </View>
                <View style={styles.certInfoRow}>
                  <View style={styles.certInfoIconContainer}>
                    <Ionicons name="school" size={20} color="#F59E0B" />
                  </View>
                  <View style={styles.certInfoTextContainer}>
                    <Text style={styles.certInfoLabel}>Course</Text>
                    <Text style={styles.certInfoValue}>{courseName}</Text>
                  </View>
                </View>
              </LinearGradient>
            )}

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  backButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  backButtonGradient: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  headerSubtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  glowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
    marginRight: 6,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600",
  },
  placeholder: {
    width: 48,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  certificateContainer: {
    alignItems: "center",
    marginBottom: 32,
    position: "relative",
  },
  certificateGlow: {
    position: "absolute",
    width: 340,
    height: 480,
    borderRadius: 20,
    backgroundColor: "#6366F1",
    opacity: 0.3,
    blur: 40,
    transform: [{ scale: 1.05 }],
  },
  certificateWrapper: {
    borderRadius: 20,
    backgroundColor: "#fff",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 32,
    elevation: 16,
  },
  infoCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  trophyContainer: {
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 16,
  },
  trophyGradient: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  infoTitleContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  infoSubtitle: {
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "600",
    marginTop: 2,
  },
  infoText: {
    fontSize: 15,
    color: "#CBD5E1",
    lineHeight: 24,
    fontWeight: "500",
  },
  progressCard: {
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.3)",
  },
  progressCardGradient: {
    padding: 24,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    marginLeft: 12,
    letterSpacing: 0.3,
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  progressBarBackground: {
    flex: 1,
    height: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarGradient: {
    flex: 1,
    height: "100%",
  },
  progressText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#10B981",
    minWidth: 50,
  },
  progressDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressDetailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
    marginRight: 8,
  },
  progressDetailText: {
    fontSize: 14,
    color: "#CBD5E1",
    fontWeight: "600",
  },
  actionButtons: {
    gap: 16,
    marginBottom: 24,
  },
  actionButton: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
    gap: 12,
  },
  buttonIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  buttonSubtext: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
    marginTop: 2,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  loadingText: {
    fontSize: 18,
    color: "#FFFFFF",
    marginTop: 16,
    fontWeight: "700",
  },
  loadingSubtext: {
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 4,
    fontWeight: "600",
  },
  certInfoCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  certInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  certInfoTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    marginLeft: 12,
    letterSpacing: 0.3,
  },
  certInfoDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginBottom: 20,
  },
  certInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  certInfoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  certInfoTextContainer: {
    flex: 1,
  },
  certInfoLabel: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  certInfoValue: {
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  bottomSpacer: {
    height: 20,
  },
});
