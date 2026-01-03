import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useCoursesStore } from "../../utils/store";
import { getJSON, setJSON } from '../../utils/Storage';
import {
  htmlTestQuestions,
  cssTestQuestions,
  jsTestQuestions,
  reactTestQuestions,
  nextjsQuestions,
  nodejsTest,
  expressTestQuestions,
  mongodbTestQuestions,
  redisTestQuestions,
} from "../../data/testdata";
const { width, height } = Dimensions.get("window");

// Shuffle array function
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function FinalTestScreen() {
  const route=useRoute();
  const navigation=useNavigation();
  const { courseId } = route.params;

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [finalScore, setFinalScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);

  const animation = useRef(new Animated.Value(1)).current;
  const feedbackAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;

  const courseData = {
    html: htmlTestQuestions,
    css: cssTestQuestions,
    js: jsTestQuestions,
    mongodb: mongodbTestQuestions,
    react: reactTestQuestions,
    nextjs: nextjsQuestions,
    nodejs: nodejsTest,
    express: expressTestQuestions,
    redis: redisTestQuestions,
  };

  const course = courseData[courseId];
  const total = shuffledQuestions?.length || 0;
  const question = shuffledQuestions?.[current];

  // ✅ Load previous progress and shuffle questions
  useEffect(() => {
    try {
      const parsed = getJSON("courseProgress"); // use your helper

      // Shuffle questions on first load
      const shuffled = shuffleArray(course || []);
      setShuffledQuestions(shuffled);

      if (parsed && parsed[courseId]) {
        const savedAnswers = parsed[courseId].userAnswers || {};
        const savedScore = parsed[courseId].TestScore || 0;

        setAnswers(savedAnswers);
        setFinalScore(savedScore);
      }
    } catch (e) {
      console.log("Error loading progress", e);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const handleSelect = (option) => {
    if (showFeedback) return; // Prevent changing answer after feedback

    setSelected(option);

    // Animate selection
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const calculateScore = (userAnswers) => {
    let correctCount = 0;
    shuffledQuestions.forEach((q) => {
      if (userAnswers[q.id] === q.answer) {
        correctCount++;
      }
    });
    return correctCount;
  };

  const handleNext = async () => {
    if (!selected) return;

    // Show immediate feedback
    const correct = selected === question.answer;
    setIsCorrect(correct);
    setShowFeedback(true);

    // Animate feedback
    Animated.spring(feedbackAnimation, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();

    // Wait for user to see feedback
    setTimeout(async () => {
      const updatedAnswers = { ...answers, [question.id]: selected };
      setAnswers(updatedAnswers);

      if (current + 1 < total) {
        // Animate next question
        setSelected(null);
        setShowFeedback(false);
        setIsCorrect(false);
        feedbackAnimation.setValue(0);
        setCurrent((prev) => prev + 1);

        animation.setValue(0);
        Animated.spring(animation, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }).start();
      } else {
        // ✅ Calculate final score
        const calculatedScore = calculateScore(updatedAnswers);
        const percentageScore = Math.round((calculatedScore / total) * 100);

        setFinalScore(calculatedScore);

        // ✅ Save results
        try {
          const parsed = getJSON("courseProgress") || {}; // load existing progress

          // ensure course entry exists
          parsed[courseId] = parsed[courseId] || {};

          // update data
          parsed[courseId].TestScore = percentageScore;
          parsed[courseId].userAnswers = updatedAnswers;

          // save updated progress
          setJSON("courseProgress", parsed);
        } catch (e) {
          console.log("Error saving progress", e);
        }

        setFinished(true);
      }
    }, 1500); // Show feedback for 1.5 seconds
  };

  const handleReview = () => {
   navigation.navigate("Testresult",  { courseId } );
  };

const handleRetake = () => {
  try {
    // Clear test data
    const parsed = getJSON("courseProgress") || {};

    if (parsed[courseId]) {
      parsed[courseId].TestScore = 0;
      parsed[courseId].userAnswers = {};
      setJSON("courseProgress", parsed);
    }

    // Shuffle questions again for new attempt
    const shuffled = shuffleArray(course || []);
    setShuffledQuestions(shuffled);

    // Reset state
    setCurrent(0);
    setFinalScore(0);
    setAnswers({});
    setSelected(null);
    setFinished(false);
    setShowFeedback(false);
    setIsCorrect(false);
    animation.setValue(1);
    feedbackAnimation.setValue(0);
  } catch (e) {
    console.log("Error resetting test", e);
  }
};

  const progress = total ? (current + 1) / total : 0;

  // 🌀 Loading
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Loading Test...</Text>
      </View>
    );
  }

  // ✅ Finished
  if (finished) {
    const percentage = Math.round((finalScore / total) * 100);

    return (
      <ScrollView contentContainerStyle={styles.resultContainer}>
        <View style={styles.resultCard}>
          <View style={styles.confettiContainer}>
            <Text style={styles.confetti}>🎉</Text>
            <Text style={styles.confetti}>✨</Text>
            <Text style={styles.confetti}>🎊</Text>
          </View>

          <Text style={styles.resultTitle}>Test Completed!</Text>

          <View style={styles.scoreCircle}>
            <Text style={styles.percentageText}>{percentage}%</Text>
            <Text style={styles.scoreDetail}>
              {finalScore} / {total} correct
            </Text>
          </View>

          <View style={styles.resultBadge}>
            <Ionicons
              name={
                percentage >= 90
                  ? "trophy"
                  : percentage >= 70
                  ? "ribbon"
                  : "medal"
              }
              color="#fbbf24"
              size={64}
            />
            <Text style={styles.badgeText}>
              {percentage === 100
                ? "Perfect Score! 🏆"
                : percentage >= 90
                ? "Excellent! 🌟"
                : percentage >= 70
                ? "Great Job! 💪"
                : percentage >= 50
                ? "Good Effort! 👍"
                : "Keep Practicing! 📚"}
            </Text>
          </View>

          <TouchableOpacity style={styles.reviewButton} onPress={handleReview}>
            <Ionicons name="book-outline" color="#fff" size={22} />
            <Text style={styles.reviewText}>Review Answers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.reviewButton, styles.retakeButton]}
            onPress={handleRetake}
          >
            <Ionicons name="refresh-outline" color="#fff" size={22} />
            <Text style={styles.reviewText}>Retake Test</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.reviewButton, styles.backButton]}
            onPress={() =>navigation.goBack()}
          >
            <Ionicons name="arrow-back-outline" color="#fff" size={22} />
            <Text style={styles.reviewText}>Back to Course</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // 🧠 Test Questions
  return (
    <View style={styles.container}>
      {/* Gradient Header */}
      <View style={styles.header}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: `${progress * 100}%`,
                backgroundColor:
                  progress > 0.7
                    ? "#10b981"
                    : progress > 0.4
                    ? "#f59e0b"
                    : "#8b5cf6",
              },
            ]}
          />
        </View>

        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            Question {current + 1} of {total}
          </Text>
          <Text style={styles.progressPercentage}>
            {Math.round(progress * 100)}%
          </Text>
        </View>
      </View>

      {/* Animated Question */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.questionBox,
            {
              opacity: animation,
              transform: [
                {
                  translateX: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [width, 0],
                  }),
                },
                {
                  scale: scaleAnimation,
                },
              ],
            },
          ]}
        >
          <View style={styles.questionCard}>
            <Text style={styles.questionLabel}>Question</Text>
            <Text style={styles.question}>{question?.question}</Text>
          </View>

          <View style={styles.optionsContainer}>
            {question?.options.map((option, i) => {
              const isSelected = selected === option;
              const isAnswer = showFeedback && option === question.answer;
              const isWrong = showFeedback && isSelected && !isCorrect;

              return (
                <Animated.View
                  key={i}
                  style={{
                    transform: [
                      {
                        scale: feedbackAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, isAnswer ? 1.02 : 1],
                        }),
                      },
                    ],
                  }}
                >
                  <TouchableOpacity
                    style={[
                      styles.option,
                      isSelected && styles.optionSelected,
                      isAnswer && styles.optionCorrect,
                      isWrong && styles.optionWrong,
                    ]}
                    onPress={() => handleSelect(option)}
                    disabled={showFeedback}
                  >
                    <View style={styles.optionContent}>
                      <View
                        style={[
                          styles.optionNumber,
                          isSelected && styles.optionNumberSelected,
                          isAnswer && styles.optionNumberCorrect,
                          isWrong && styles.optionNumberWrong,
                        ]}
                      >
                        {showFeedback && isAnswer ? (
                          <Ionicons name="checkmark" size={18} color="#fff" />
                        ) : showFeedback && isWrong ? (
                          <Ionicons name="close" size={18} color="#fff" />
                        ) : (
                          <Text
                            style={[
                              styles.optionNumberText,
                              isSelected && styles.optionNumberTextSelected,
                            ]}
                          >
                            {String.fromCharCode(65 + i)}
                          </Text>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.optionText,
                          (isAnswer || isWrong) && styles.optionTextBold,
                        ]}
                      >
                        {option}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>

          {/* Feedback Section */}
          {showFeedback && question?.explanation && (
            <Animated.View
              style={[
                styles.feedbackCard,
                {
                  opacity: feedbackAnimation,
                  transform: [
                    {
                      translateY: feedbackAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.feedbackHeader}>
                <Ionicons
                  name={isCorrect ? "checkmark-circle" : "information-circle"}
                  size={24}
                  color={isCorrect ? "#10b981" : "#f59e0b"}
                />
                <Text
                  style={[
                    styles.feedbackTitle,
                    { color: isCorrect ? "#10b981" : "#f59e0b" },
                  ]}
                >
                  {isCorrect ? "Correct!" : "Incorrect"}
                </Text>
              </View>
              <Text style={styles.feedbackText}>{question.explanation}</Text>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            { opacity: selected ? 1 : 0.5 },
            !selected && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!selected || showFeedback}
        >
          <Text style={styles.nextText}>
            {showFeedback
              ? "Loading..."
              : current + 1 === total
              ? "Finish Test"
              : "Submit Answer"}
          </Text>
          <Ionicons name="arrow-forward" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0f",
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#13131a",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scrollView: {
    flex: 1,
  },
  questionBox: {
    padding: 20,
    paddingBottom: 100,
  },
  questionCard: {
    backgroundColor: "#1a1a24",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#2d2d3a",
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8b5cf6",
    marginBottom: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  question: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    lineHeight: 30,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: "#1a1a24",
    borderWidth: 2,
    borderColor: "#2d2d3a",
  },
  optionSelected: {
    backgroundColor: "#2d1b4e",
    borderColor: "#8b5cf6",
  },
  optionCorrect: {
    backgroundColor: "#064e3b",
    borderColor: "#10b981",
  },
  optionWrong: {
    backgroundColor: "#7f1d1d",
    borderColor: "#ef4444",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2d2d3a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  optionNumberSelected: {
    backgroundColor: "#8b5cf6",
  },
  optionNumberCorrect: {
    backgroundColor: "#10b981",
  },
  optionNumberWrong: {
    backgroundColor: "#ef4444",
  },
  optionNumberText: {
    color: "#94a3b8",
    fontSize: 16,
    fontWeight: "700",
  },
  optionNumberTextSelected: {
    color: "#fff",
  },
  optionText: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
    lineHeight: 24,
  },
  optionTextBold: {
    fontWeight: "700",
    color: "#fff",
  },
  feedbackCard: {
    marginTop: 24,
    backgroundColor: "#1a1a24",
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#8b5cf6",
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10,
  },
  feedbackText: {
    color: "#cbd5e1",
    fontSize: 15,
    lineHeight: 24,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#0a0a0f",
    borderTopWidth: 1,
    borderTopColor: "#2d2d3a",
  },
  nextButton: {
    backgroundColor: "#8b5cf6",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  nextButtonDisabled: {
    backgroundColor: "#2d2d3a",
  },
  nextText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    marginRight: 10,
  },
  progressBar: {
    height: 10,
    backgroundColor: "#2d2d3a",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 10,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  progressText: {
    color: "#e2e8f0",
    fontSize: 15,
    fontWeight: "600",
  },
  progressPercentage: {
    color: "#8b5cf6",
    fontSize: 15,
    fontWeight: "700",
  },
  resultContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0a0f",
    padding: 20,
  },
  resultCard: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: "#1a1a24",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2d2d3a",
  },
  confettiContainer: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 20,
  },
  confetti: {
    fontSize: 40,
  },
  resultTitle: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "800",
    marginBottom: 24,
    textAlign: "center",
  },
  scoreCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#2d1b4e",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    borderWidth: 6,
    borderColor: "#8b5cf6",
  },
  percentageText: {
    fontSize: 48,
    fontWeight: "800",
    color: "#fff",
  },
  scoreDetail: {
    fontSize: 14,
    color: "#a5b4fc",
    marginTop: 4,
    fontWeight: "600",
  },
  resultBadge: {
    alignItems: "center",
    marginBottom: 32,
    padding: 24,
  },
  badgeText: {
    color: "#fff",
    fontSize: 22,
    marginTop: 16,
    fontWeight: "700",
  },
  reviewButton: {
    backgroundColor: "#8b5cf6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 16,
    marginBottom: 14,
    width: "100%",
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  retakeButton: {
    backgroundColor: "#10b981",
  },
  backButton: {
    backgroundColor: "#475569",
  },
  reviewText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 10,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0a0f",
  },
  loadingText: {
    color: "#e2e8f0",
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
  },
});
