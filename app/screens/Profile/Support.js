import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, LayoutAnimation, Platform, UIManager } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function HelpSupportScreen() {
  const [expanded, setExpanded] = useState(null);

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(expanded === id ? null : id);
  };

  const sections = [
    {
      id: 1,
      icon: "book-outline",
      title: "📘 FAQs",
      gradient: ["#8B5CF6", "#6D28D9"],
      content: [
        { q: "How do I start a course?", a: "Just open any course from the catalog and tap 'Start Learning'. Your progress will automatically be saved." },
        { q: "Can I resume my last lesson?", a: "Yes! The app remembers your last visited lesson. When you return, just tap 'Continue Learning' from the home screen." },
        { q: "Do I need internet for lessons?", a: "Most lessons require internet to stream videos, but quizzes and notes can be viewed offline soon." },
        { q: "How do I reset my password?", a: "Go to Settings > Account > Reset Password. You'll receive a verification code via email to create a new password." },
        { q: "Can I download lessons for offline viewing?", a: "Premium users can download video lessons for offline access. Check the download icon next to each lesson." },
        { q: "How do I contact support?", a: "Tap the chat icon in the top right corner or email us at support@learnapp.com. We respond within 24 hours." },
        { q: "Is there a student discount?", a: "Yes! Students get 50% off Premium. Verify your student email in Settings > Billing to unlock the discount." },
      ],
    },
    {
      id: 2,
      icon: "school-outline",
      title: "🎓 How to Use the App",
      gradient: ["#EC4899", "#DB2777"],
      content: [
        { q: "Explore Courses", a: "Browse through the Web Development categories like HTML, CSS, JS, React, Node.js, and more." },
        { q: "Track Progress", a: "Each completed lesson updates your progress bar automatically. View detailed stats in the Dashboard." },
        { q: "Take Quizzes", a: "At the end of each section, test your knowledge with quick quizzes. Pass with 70% to unlock the next module." },
        { q: "Earn Badges", a: "Complete courses and achieve milestones to unlock learning badges and shareable certificates." },
        { q: "Join Communities", a: "Connect with fellow learners in course-specific forums. Share tips, ask questions, and collaborate on projects." },
        { q: "Set Learning Goals", a: "Create daily or weekly goals to stay motivated. The app will send you friendly reminders to keep you on track." },
        { q: "Bookmark Content", a: "Save important lessons, resources, or code snippets by tapping the bookmark icon. Access them anytime from your profile." },
      ],
    },
    {
      id: 3,
      icon: "flash-outline",
      title: "⚡ Pro Tips & Tricks",
      gradient: ["#F59E0B", "#D97706"],
      content: [
        { q: "Speed Controls", a: "Adjust video playback speed from 0.5x to 2x. Find your perfect learning pace in the video player settings." },
        { q: "Note Taking", a: "Tap the notepad icon while watching videos to jot down important points with automatic timestamps." },
        { q: "Practice Mode", a: "Use the built-in code editor to practice while learning. Your code is automatically saved and synced across devices." },
        { q: "Dark Mode", a: "Enable dark mode in Settings > Appearance for comfortable learning during night sessions. Auto-schedule available too!" },
        { q: "Keyboard Shortcuts", a: "Space to play/pause, Arrow keys to skip 10s, 'S' for subtitles, 'F' for fullscreen, 'M' to mute." },
        { q: "Study Streaks", a: "Maintain daily learning streaks to unlock bonus XP and special badges. Don't break the chain!" },
        { q: "Smart Recommendations", a: "The app learns your preferences and suggests courses based on your learning style and completed content." },
      ],
    },
    {
      id: 4,
      icon: "rocket-outline",
      title: "🚀 Advanced Features",
      gradient: ["#10B981", "#059669"],
      content: [
        { q: "Code Playground", a: "Test and run code directly in the app. Supports HTML, CSS, JavaScript, Python, and more with live preview." },
        { q: "AI Study Assistant", a: "Ask questions about course content and get instant explanations powered by AI. Available 24/7." },
        { q: "Learning Paths", a: "Follow curated learning paths designed by industry experts. From beginner to advanced in structured steps." },
        { q: "Project Challenges", a: "Complete real-world projects to build your portfolio. Get feedback from mentors and the community." },
        { q: "Peer Reviews", a: "Submit your code for review by experienced developers. Give and receive constructive feedback." },
        { q: "Live Sessions", a: "Join live coding sessions and Q&A with instructors. Schedule available in the Events tab." },
      ],
    },
    {
      id: 5,
      icon: "gift-outline",
      title: "🎁 Premium Benefits",
      gradient: ["#8B5CF6", "#7C3AED"],
      content: [
        { q: "Offline Access", a: "Download entire courses and learn without internet connection. Perfect for travel or commuting." },
        { q: "Verified Certificates", a: "Earn verified certificates upon course completion to showcase on LinkedIn and your resume." },
        { q: "Priority Support", a: "Get instant help from our expert team via live chat. Skip the queue with premium support." },
        { q: "Ad-Free Experience", a: "Enjoy completely uninterrupted learning without any advertisements or distractions." },
        { q: "Advanced Projects", a: "Access exclusive real-world projects, industry case studies, and portfolio-building challenges." },
        { q: "Early Access", a: "Be the first to try new courses and features before they're released to the public." },
        { q: "Career Resources", a: "Access resume templates, interview prep guides, and career counseling sessions." },
      ],
    },
    {
      id: 6,
      icon: "shield-checkmark-outline",
      title: "🔒 Security & Privacy",
      gradient: ["#3B82F6", "#2563EB"],
      content: [
        { q: "Your Data", a: "We only store your learning progress and basic profile info. No sensitive data is shared or sold to third parties." },
        { q: "Encryption", a: "All data is encrypted using industry-standard AES-256 encryption both in transit and at rest." },
        { q: "Account Safety", a: "Enable two-factor authentication in Settings > Security for an extra layer of account protection." },
        { q: "Data Export", a: "You can export all your data anytime from Settings > Privacy > Download My Data in JSON or CSV format." },
        { q: "GDPR Compliant", a: "We're fully compliant with GDPR and CCPA. Your privacy rights are our priority." },
        { q: "Session Management", a: "Monitor active sessions and remotely log out from devices in Settings > Security > Active Sessions." },
      ],
    },
    {
      id: 7,
      icon: "chatbubbles-outline",
      title: "💬 Community Guidelines",
      gradient: ["#06B6D4", "#0891B2"],
      content: [
        { q: "Be Respectful", a: "Treat all learners with respect. Harassment, hate speech, or offensive language will result in account suspension." },
        { q: "Share Knowledge", a: "Help others by answering questions and sharing your learning experiences. Earn reputation points for helpful contributions." },
        { q: "No Spam", a: "Avoid posting promotional content, irrelevant links, or duplicate questions in forums and discussions." },
        { q: "Report Issues", a: "If you encounter inappropriate content, use the report button to notify moderators. We review reports within hours." },
        { q: "Give Credit", a: "Always credit sources when sharing code or resources. Plagiarism is taken seriously." },
        { q: "Stay On Topic", a: "Keep discussions relevant to the course material. Off-topic conversations belong in the General forum." },
      ],
    },
    {
      id: 8,
      icon: "trending-up-outline",
      title: "📊 Progress & Analytics",
      gradient: ["#EF4444", "#DC2626"],
      content: [
        { q: "Learning Dashboard", a: "View comprehensive stats including time spent, courses completed, and skill progression over time." },
        { q: "Skill Tree", a: "Visualize your learning journey with an interactive skill tree showing mastered and upcoming topics." },
        { q: "Weekly Reports", a: "Receive detailed weekly reports via email with insights into your learning patterns and suggestions." },
        { q: "Leaderboards", a: "Compete with friends or the global community. Climb the ranks by completing courses and helping others." },
        { q: "Achievement System", a: "Unlock achievements for various milestones: first course, 100 hours, helping 50 learners, and more." },
      ],
    },
    {
      id: 9,
      icon: "document-text-outline",
      title: "📄 Terms & Policies",
      gradient: ["#64748B", "#475569"],
      content: [
        { q: "Usage Policy", a: "You agree to use the app for learning purposes only. Copying or redistributing course content is strictly prohibited." },
        { q: "Refund Policy", a: "Premium subscriptions can be cancelled anytime. Refunds are available within 14 days of purchase, no questions asked." },
        { q: "Content Rights", a: "All course materials are copyrighted. Sharing login credentials or course content violates our terms." },
        { q: "Age Requirements", a: "You must be 13 years or older to use this app. Users under 18 require parental consent." },
        { q: "Contact Legal", a: "For legal inquiries, contact legal@learnapp.com or review our full terms at learnapp.com/terms" },
        { q: "Updates to Terms", a: "We may update our terms periodically. You'll be notified of significant changes via email." },
      ],
    },
  ];

  return (
    <LinearGradient colors={["#0A0118", "#1A0B2E", "#2D1B4E"]} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Help & Support</Text>
          <Text style={styles.subheader}>We're here to help you learn better 💜</Text>
        </View>

        {sections.map((section) => (
          <View key={section.id} style={styles.card}>
            <TouchableOpacity onPress={() => toggleExpand(section.id)} activeOpacity={0.8} style={styles.cardHeader}>
              <LinearGradient colors={section.gradient} style={styles.iconContainer}>
                <Ionicons name={section.icon} size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.title}>{section.title}</Text>
              <Ionicons
                name={expanded === section.id ? "chevron-up-outline" : "chevron-down-outline"}
                size={24}
                color="#C29FFF"
              />
            </TouchableOpacity>

            {expanded === section.id && (
              <View style={styles.content}>
                {section.content.map((item, idx) => (
                  <View key={idx} style={styles.faqItem}>
                    <View style={styles.questionContainer}>
                      <View style={styles.bullet} />
                      <Text style={styles.question}>{item.q}</Text>
                    </View>
                    <Text style={styles.answer}>{item.a}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Still need help?</Text>
          <TouchableOpacity style={styles.contactButton}>
            <LinearGradient colors={["#8B5CF6", "#7C3AED"]} style={styles.contactButtonGradient}>
              <Ionicons name="mail-outline" size={20} color="#FFFFFF" style={styles.contactIcon} />
              <Text style={styles.contactButtonText}>Contact Support</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    alignItems: "center",
  },
  header: {
    fontSize: 34,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subheader: {
    fontSize: 16,
    color: "#B8A8D9",
    textAlign: "center",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(194,159,255,0.2)",
    shadowColor: "#C29FFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    paddingTop: 4,
  },
  faqItem: {
    marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#C29FFF",
  },
  questionContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#C29FFF",
    marginTop: 6,
    marginRight: 10,
  },
  question: {
    flex: 1,
    color: "#E9D5FF",
    fontWeight: "700",
    fontSize: 15,
    lineHeight: 20,
  },
  answer: {
    color: "#D1C4E9",
    fontSize: 14,
    lineHeight: 21,
    marginLeft: 16,
  },
  footer: {
    marginTop: 30,
    alignItems: "center",
  },
  footerText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  contactButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  contactButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  contactIcon: {
    marginRight: 10,
  },
  contactButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});