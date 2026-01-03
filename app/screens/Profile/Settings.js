import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
  Switch,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import RateUsModal from "../../Components/Rateus"; // adjust the path

export default function SettingsScreen() {
  const navigation=useNavigation();
  const [aboutVisible, setAboutVisible] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [downloadQuality, setDownloadQuality] = useState("High");
  const [rateUsVisible, setRateUsVisible] = useState(false);


  const settingsSections = [
    {
      title: "Account",
      items: [
        {
          icon: "person-outline",
          label: "Edit Profile",
          subtitle: "Update your name, email, and profile picture",
          color: "#8B5CF6",
          action: () => console.log("Edit Profile"),
        },
        {
          icon: "shield-checkmark-outline",
          label: "Privacy & Security",
          subtitle: "Manage your account security and privacy settings",
          color: "#EC4899",
          action: () => console.log("Privacy"),
        },
        {
          icon: "key-outline",
          label: "Change Password",
          subtitle: "Update your password for account security",
          color: "#F59E0B",
          action: () => console.log("Change Password"),
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: "notifications-outline",
          label: "Notifications",
          subtitle: "Manage your study reminders and alerts",
          color: "#10B981",
          action: () =>navigation.navigate("Reminder"),
          hasArrow: true,
        },
        {
          icon: "moon-outline",
          label: "Dark Mode",
          subtitle: "Toggle dark mode for comfortable viewing",
          color: "#3B82F6",
          toggle: true,
          value: darkMode,
          onToggle: setDarkMode,
        },

        {
          icon: "language-outline",
          label: "Language",
          subtitle: "English (US)",
          color: "#8B5CF6",
          action: () => console.log("Language"),
        },
      ],
    },
    {
      title: "Learning",
      items: [
        {
          icon: "download-outline",
          label: "Download Quality",
          subtitle: `Current: ${downloadQuality} Quality`,
          color: "#EC4899",
          action: () => console.log("Download Quality"),
        },
        {
          icon: "timer-outline",
          label: "Playback Speed",
          subtitle: "Default video playback speed: 1.0x",
          color: "#F59E0B",
          action: () => console.log("Playback Speed"),
        },
        {
          icon: "bookmark-outline",
          label: "Saved Content",
          subtitle: "View all your bookmarked lessons and resources",
          color: "#10B981",
          action: () => console.log("Saved Content"),
        },
        {
          icon: "trophy-outline",
          label: "Achievements",
          subtitle: "View your badges, certificates, and milestones",
          color: "#EF4444",
          action: () => console.log("Achievements"),
        },
      ],
    },
    {
      title: "Storage & Data",
      items: [
        {
          icon: "cloud-download-outline",
          label: "Downloaded Courses",
          subtitle: "Manage offline content (2.4 GB used)",
          color: "#3B82F6",
          action: () => console.log("Downloads"),
        },
        {
          icon: "trash-outline",
          label: "Clear Cache",
          subtitle: "Free up space by clearing temporary files",
          color: "#EF4444",
          action: () => console.log("Clear Cache"),
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: "help-circle-outline",
          label: "Help & Support",
          subtitle: "FAQs, tutorials, and customer support",
          color: "#8B5CF6",
          action: () => console.log("Help"),
        },
        {
          icon: "chatbubble-ellipses-outline",
          label: "Send Feedback",
          subtitle: "Share your thoughts and suggestions with us",
          color: "#06B6D4",
          action: () => console.log("Feedback"),
        },
        {
          icon: "star-outline",
          label: "Rate This App",
          subtitle: "Enjoying the app? Leave us a review",
          color: "#F59E0B",
          action: () => setRateUsVisible(true),
        },
      ],
    },
    {
      title: "About",
      items: [
        {
          icon: "information-circle-outline",
          label: "About App",
          subtitle: "Version 1.0.3 • Learn more about WebDev Mastery",
          color: "#10B981",
          action: () => setAboutVisible(true),
        },
        {
          icon: "document-text-outline",
          label: "Terms of Service",
          subtitle: "Read our terms and conditions",
          color: "#64748B",
          action: () => console.log("Terms"),
        },
        {
          icon: "shield-outline",
          label: "Privacy Policy",
          subtitle: "Learn how we protect your data",
          color: "#475569",
          action: () => console.log("Privacy Policy"),
        },
      ],
    },
  ];

  const renderSettingItem = (item) => {

    if (item.toggle) {
      return (
        <View key={item.label} style={styles.option}>
          <View style={styles.optionContent}>
            <LinearGradient
              colors={[item.color, item.color + "CC"]}
              style={styles.iconContainer}
            >
              <Ionicons name={item.icon} size={22} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.textContainer}>
              <Text style={styles.optionTitle}>{item.label}</Text>
              <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
            </View>
         

            <Switch
             
              thumbColor= "#ccc"
              trackColor={{ false: "#767577", true: "#81b0ff" }}
            />
          </View>
        </View>
      );
    }

    return (
      <TouchableOpacity
        key={item.label}
        style={styles.option}
        onPress={item.action}
        activeOpacity={0.7}
      >
        <View style={styles.optionContent}>
          <LinearGradient
            colors={[item.color, item.color + "CC"]}
            style={styles.iconContainer}
          >
            <Ionicons name={item.icon} size={22} color="#FFFFFF" />
          </LinearGradient>
          <View style={styles.textContainer}>
            <Text style={styles.optionTitle}>{item.label}</Text>
            <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
          </View>
          {item.hasArrow !== false && (
            <Ionicons name="chevron-forward" size={20} color="#8B8B8B" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={["#0A0118", "#1A0B2E", "#2D1B4E"]}
      style={styles.gradient}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Settings</Text>
          <Text style={styles.subheader}>
            Customize your learning experience
          </Text>
        </View>

        {settingsSections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item) => renderSettingItem(item))}
          </View>
        ))}

        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.8}>
          <LinearGradient
            colors={["#EF4444", "#DC2626"]}
            style={styles.logoutGradient}
          >
            <Ionicons
              name="log-out-outline"
              size={22}
              color="#FFFFFF"
              style={styles.logoutIcon}
            />
            <Text style={styles.logoutText}>Log Out</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.footer}>Made with 💜 by Metra Tech Labs</Text>
      </ScrollView>

      {/* About App Modal */}
      <Modal visible={aboutVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
    
          <View style={styles.modalContainer}>
            <TouchableOpacity onPress={()=>setAboutVisible(false)}>
                   <View style
                ={{alignItems:"flex-end"}} >
      <Text style={{color:"#fff"}}>Close</Text>
     </View>
     </TouchableOpacity>
            <View style={styles.modalHeader}>
              <View style={styles.appIconContainer}>
                <LinearGradient
                  colors={["#8B5CF6", "#7C3AED"]}
                  style={styles.appIcon}
                >
                  <Ionicons name="rocket" size={32} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <Text style={styles.modalTitle}>WebDev Mastery</Text>
              <Text style={styles.versionBadge}>Version 1.0.3</Text>
            </View>
    
            <View style={styles.modalContent}>
              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={18} color="#8B5CF6" />
                <Text style={styles.infoLabel}>Developer</Text>
                <Text style={styles.infoValue}>Metra Tech Labs</Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={18} color="#8B5CF6" />
                <Text style={styles.infoLabel}>Contact</Text>
                <Text style={styles.infoValue}>support@metratechlabs.com</Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={18} color="#8B5CF6" />
                <Text style={styles.infoLabel}>Released</Text>
                <Text style={styles.infoValue}>November 2024</Text>
              </View>

              <View style={[styles.infoRow, { alignItems: "flex-start" }]}>
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color="#8B5CF6"
                  style={{ marginTop: 2 }}
                />
                <Text style={styles.infoLabel}>About</Text>
                <Text style={[styles.infoValue, { flex: 1, lineHeight: 20 }]}>
                  A complete learning platform designed to help beginners and
                  professionals master web development technologies including
                  HTML, CSS, JavaScript, React, Node.js, and more.
                </Text>
              </View>

              <View style={styles.divider} />

              <Text style={styles.featuresTitle}>✨ Key Features</Text>
              <View style={styles.featuresList}>
                <Text style={styles.featureItem}>
                  • 100+ comprehensive web development lessons
                </Text>
                <Text style={styles.featureItem}>
                  • Interactive code editor and live previews
                </Text>
                <Text style={styles.featureItem}>
                  • Progress tracking and achievement system
                </Text>
                <Text style={styles.featureItem}>
                  • Downloadable content for offline learning
                </Text>
                <Text style={styles.featureItem}>
                  • Community forums and peer support
                </Text>
              </View>

              <View style={styles.socialContainer}>
                <Text style={styles.socialTitle}>Follow Us</Text>
                <View style={styles.socialIcons}>
                  <TouchableOpacity style={styles.socialButton}>
                    <Ionicons name="logo-twitter" size={20} color="#1DA1F2" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialButton}>
                    <Ionicons name="logo-instagram" size={20} color="#E4405F" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialButton}>
                    <Ionicons name="logo-linkedin" size={20} color="#0A66C2" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialButton}>
                    <Ionicons name="logo-github" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <Pressable
              style={styles.closeButton}
              onPress={() => setAboutVisible(false)}
            >
              <LinearGradient
                colors={["#8B5CF6", "#7C3AED"]}
                style={styles.closeButtonGradient}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>
      <RateUsModal
  visible={rateUsVisible}
  onClose={() => setRateUsVisible(false)}
/>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 30,
  },
  header: {
    fontSize: 34,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  subheader: {
    fontSize: 15,
    color: "#B8A8D9",
    fontWeight: "500",
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#9E8FCC",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 4,
  },
  option: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 3,
  },
  optionSubtitle: {
    fontSize: 13,
    color: "#B0B0B0",
    lineHeight: 18,
  },
  logoutButton: {
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  logoutGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  footer: {
    textAlign: "center",
    color: "#8B7BAB",
    fontSize: 13,
    fontWeight: "500",
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#1B1330",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    maxHeight: "90%",
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  appIconContainer: {
    marginBottom: 16,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  versionBadge: {
    fontSize: 13,
    color: "#B8A8D9",
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: "600",
  },
  modalContent: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 12,
    borderRadius: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: "#9E8FCC",
    fontWeight: "600",
    marginLeft: 10,
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: "#E5E5E5",
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 20,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  featuresList: {
    marginBottom: 20,
  },
  featureItem: {
    fontSize: 14,
    color: "#D0D0D0",
    lineHeight: 24,
    marginBottom: 4,
  },
  socialContainer: {
    alignItems: "center",
  },
  socialTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  socialIcons: {
    flexDirection: "row",
    gap: 16,
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  closeButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
