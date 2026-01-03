import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useCoursesStore } from "../../utils/store";
import { getJSON, setJSON } from '../../utils/Storage';
import { htmlTestQuestions, cssTestQuestions, jsTestQuestions,reactTestQuestions,nextjsQuestions,nodejsTest,expressTestQuestions,mongodbTestQuestions,redisTestQuestions } from "../../data/testdata";


const { width } = Dimensions.get("window");

export default function ResultReviewScreen() {
  const [userAnswers, setUserAnswers] = useState({});
  const [percentageScore, setPercentageScore] = useState(0);
  const [actualScore, setActualScore] = useState(0);
  const route=useRoute()
  const { courseId } = route.params;
  const navigation=useNavigation();

  const data = {
    html: htmlTestQuestions,
    css: cssTestQuestions,
    js: jsTestQuestions,
    mongodb:mongodbTestQuestions,
    react: reactTestQuestions,
    nextjs: nextjsQuestions,
    nodejs: nodejsTest,
    express: expressTestQuestions,
    redis:redisTestQuestions
  };
  const course = data[courseId];

  useEffect(() => {
    const fetchData =  () => {
      try {
        const saved = getJSON("courseProgress");
        const parsed = saved;
        const answers = parsed[courseId]?.userAnswers || {};
        const storedPercentage = parsed[courseId]?.TestScore || 0;

        // Calculate actual score from user answers
        let correctCount = 0;
        course.forEach((q) => {
          if (answers[q.id] === q.answer) {
            correctCount++;
          }
        });

        setUserAnswers(answers);
        setPercentageScore(storedPercentage);
        setActualScore(correctCount);
      } catch (e) {
        console.log("Error fetching data:", e);
      }
    };
    fetchData();
  }, [courseId]);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        {/* Header Section */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
        <View style={styles.headerSection}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <LinearGradient
            colors={["#6366F1", "#8B5CF6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scoreCard}
          >
            <View style={styles.scoreHeader}>
              <Ionicons name="trophy" size={32} color="#FCD34D" />
              <Text style={styles.scoreTitle}>Test Results</Text>
            </View>

            <View style={styles.scoreBody}>
              <Text style={styles.scoreValue}>
                {actualScore}
                <Text style={styles.scoreDivider}> / </Text>
                <Text style={styles.scoreTotal}>{course.length}</Text>
              </Text>
              <Text style={styles.percentageText}>{percentageScore}% Correct</Text>
            </View>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBg}>
                <LinearGradient
                  colors={["#FCD34D", "#FBBF24"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressBarFill, { width: `${percentageScore}%` }]}
                />
              </View>
            </View>

            {/* Performance Badge */}
            <View style={styles.performanceBadge}>
              <Text style={styles.performanceText}>
                {percentageScore >= 90
                  ? "🌟 Excellent Performance!"
                  : percentageScore >= 70
                  ? "🎉 Great Job!"
                  : percentageScore >= 50
                  ? "👍 Good Effort!"
                  : "📚 Keep Practicing!"}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Questions Review */}
       
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
              <Text style={styles.statValue}>{actualScore}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="close-circle" size={24} color="#EF4444" />
              <Text style={styles.statValue}>{course.length - actualScore}</Text>
              <Text style={styles.statLabel}>Incorrect</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="document-text" size={24} color="#6366F1" />
              <Text style={styles.statValue}>{course.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Answer Review</Text>

          {course.map((q, index) => {
            const userAnswer = userAnswers[q.id];
            const isCorrect = userAnswer === q.answer;
            const isUnanswered = !userAnswer;

            return (
              <View key={index} style={styles.questionCard}>
                {/* Question Header */}
                <View style={styles.questionHeader}>
                  <View
                    style={[
                      styles.questionNumber,
                      isCorrect
                        ? styles.correctBg
                        : isUnanswered
                        ? styles.unansweredBg
                        : styles.wrongBg,
                    ]}
                  >
                    <Text style={styles.questionNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.statusBadge}>
                    {isUnanswered ? (
                      <Ionicons name="remove-circle" size={24} color="#94A3B8" />
                    ) : isCorrect ? (
                      <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
                    ) : (
                      <Ionicons name="close-circle" size={24} color="#EF4444" />
                    )}
                  </View>
                </View>

                {/* Question Text */}
                <Text style={styles.questionText}>{q.question}</Text>

                {/* Your Answer */}
                <View style={styles.answerSection}>
                  <Text style={styles.answerLabel}>Your Answer:</Text>
                  <View
                    style={[
                      styles.answerBox,
                      isCorrect
                        ? styles.correctAnswer
                        : isUnanswered
                        ? styles.unansweredAnswer
                        : styles.wrongAnswer,
                    ]}
                  >
                    <Text
                      style={[
                        styles.answerText,
                        isCorrect
                          ? styles.correctText
                          : isUnanswered
                          ? styles.unansweredText
                          : styles.wrongText,
                      ]}
                    >
                      {userAnswer || "Not Answered"}
                    </Text>
                  </View>
                </View>

                {/* Correct Answer */}
                {!isCorrect && (
                  <View style={styles.answerSection}>
                    <Text style={styles.answerLabel}>Correct Answer:</Text>
                    <View style={[styles.answerBox, styles.correctAnswer]}>
                      <Text style={[styles.answerText, styles.correctText]}>
                        {q.answer}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Explanation */}
                {q.explanation && (
                  <View style={styles.explanationSection}>
                    <View style={styles.explanationHeader}>
                      <Ionicons name="bulb" size={16} color="#FBBF24" />
                      <Text style={styles.explanationLabel}>Explanation</Text>
                    </View>
                    <Text style={styles.explanationText}>{q.explanation}</Text>
                  </View>
                )}
              </View>
            );
          })}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  scoreCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  scoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  scoreTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    marginLeft: 12,
  },
  scoreBody: {
    alignItems: "center",
    marginBottom: 20,
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -2,
  },
  scoreDivider: {
    fontSize: 40,
    color: "#E0E7FF",
    fontWeight: "600",
  },
  scoreTotal: {
    fontSize: 40,
    color: "#E0E7FF",
    fontWeight: "700",
  },
  percentageText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#E0E7FF",
    marginTop: 8,
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  performanceBadge: {
    marginTop: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  performanceText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#1E293B",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94A3B8",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  questionCard: {
    backgroundColor: "#1E293B",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  questionNumber: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  correctBg: {
    backgroundColor: "#22C55E20",
  },
  wrongBg: {
    backgroundColor: "#EF444420",
  },
  unansweredBg: {
    backgroundColor: "#94A3B820",
  },
  questionNumberText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  statusBadge: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F1F5F9",
    lineHeight: 24,
    marginBottom: 20,
  },
  answerSection: {
    marginBottom: 16,
  },
  answerLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#94A3B8",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  answerBox: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  correctAnswer: {
    backgroundColor: "#22C55E10",
    borderColor: "#22C55E",
  },
  wrongAnswer: {
    backgroundColor: "#EF444410",
    borderColor: "#EF4444",
  },
  unansweredAnswer: {
    backgroundColor: "#94A3B810",
    borderColor: "#94A3B8",
  },
  answerText: {
    fontSize: 15,
    fontWeight: "700",
  },
  correctText: {
    color: "#22C55E",
  },
  wrongText: {
    color: "#EF4444",
  },
  unansweredText: {
    color: "#94A3B8",
  },
  explanationSection: {
    backgroundColor: "#0F172A",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#FBBF24",
  },
  explanationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  explanationLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FBBF24",
    marginLeft: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  explanationText: {
    fontSize: 14,
    color: "#CBD5E1",
    lineHeight: 20,
    fontWeight: "500",
  },
  bottomSpacer: {
    height: 20,
  },
});