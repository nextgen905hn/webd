import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  Dimensions,
} from "react-native";

import LinearGradient from "react-native-linear-gradient";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useCoursesStore } from "../../utils/store";
import { getJSON, setJSON } from '../../utils/Storage';
const { width } = Dimensions.get("window");

// Memoized Empty State Component
const EmptyQuizState = memo(({ onBack }) => (
  <View style={styles.center}>
    <View style={styles.emptyStateCard}>
      <Text style={styles.noQuizIcon}>📝</Text>
      <Text style={styles.noQuiz}>No Quiz Available</Text>
      <Text style={styles.noQuizSub}>This lesson doesn't have quiz questions yet.</Text>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={20} color="#fff" />
        <Text style={styles.backButtonText}>Back to Lesson</Text>
      </TouchableOpacity>
    </View>
  </View>
));

// Memoized Header Component
const QuizHeader = memo(({ lessonTitle, currentIndex, totalQuestions, progress }) => {
  const progressColor = useMemo(
    () => progress >= 80 ? '#10b981' : progress >= 40 ? '#f59e0b' : '#8b5cf6',
    [progress]
  );

  const progressBarStyle = useMemo(
    () => ({ width: `${progress}%`, backgroundColor: progressColor }),
    [progress, progressColor]
  );

  return (
    <View style={styles.headerSection}>
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <Text style={styles.lessonTitle} numberOfLines={1}>
            {lessonTitle}
          </Text>
          <View style={styles.questionBadge}>
            <Text style={styles.questionBadgeText}>
              {currentIndex + 1}/{totalQuestions}
            </Text>
          </View>
        </View>

        <View style={styles.progressBarContainer}>
          <Animated.View style={[styles.progressBar, progressBarStyle]} />
        </View>
        <Text style={styles.progressText}>{Math.round(progress)}% Complete</Text>
      </View>
    </View>
  );
});

// Memoized Question Card
const QuestionCard = memo(({ question }) => (
  <View style={styles.questionCard}>
    <View style={styles.questionHeader}>
      <View style={styles.questionIconBadge}>
        <Text style={styles.questionIcon}>❓</Text>
      </View>
      <Text style={styles.questionLabel}>Question</Text>
    </View>
    <Text style={styles.question}>{question}</Text>
  </View>
));

// Memoized Option Component
const QuizOption = memo(({ 
  option, 
  index, 
  isSelected, 
  isSubmitted, 
  isCorrect, 
  currentAnswer,
  onPress 
}) => {
  const showResult = isSubmitted && option === currentAnswer;
  const showWrong = isSubmitted && isSelected && !isCorrect;

  const optionStyle = useMemo(() => [
    styles.option,
    isSelected && !isSubmitted && styles.optionSelected,
    showResult && styles.optionCorrect,
    showWrong && styles.optionWrong,
  ], [isSelected, isSubmitted, showResult, showWrong]);

  const letterStyle = useMemo(() => [
    styles.optionLetter,
    isSelected && !isSubmitted && styles.optionLetterSelected,
    showResult && styles.optionLetterCorrect,
    showWrong && styles.optionLetterWrong,
  ], [isSelected, isSubmitted, showResult, showWrong]);

  const textStyle = useMemo(() => [
    styles.optionText,
    (showResult || showWrong) && styles.optionTextBold
  ], [showResult, showWrong]);

  const letterContent = useMemo(() => {
    if (isSubmitted && showResult) {
      return <Ionicons name="checkmark" size={20} color="#fff" />;
    }
    if (isSubmitted && showWrong) {
      return <Ionicons name="close" size={20} color="#fff" />;
    }
    return (
      <Text style={[styles.optionLetterText, isSelected && styles.optionLetterTextSelected]}>
        {String.fromCharCode(65 + index)}
      </Text>
    );
  }, [isSubmitted, showResult, showWrong, isSelected, index]);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={isSubmitted}
      onPress={onPress}
      style={optionStyle}
    >
      <View style={styles.optionContent}>
        <View style={letterStyle}>{letterContent}</View>
        <Text style={textStyle}>{option}</Text>
      </View>
    </TouchableOpacity>
  );
});

// Memoized Feedback Section
const FeedbackSection = memo(({ 
  isCorrect, 
  selected, 
  correctAnswer, 
  explanation, 
  isLastQuestion,
  feedbackAnim,
  onNext 
}) => {
  const feedbackStyle = useMemo(() => ({
    opacity: feedbackAnim,
    transform: [{
      translateY: feedbackAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [30, 0]
      })
    }]
  }), [feedbackAnim]);

  const resultHeaderStyle = useMemo(() => [
    styles.resultHeader,
    isCorrect ? styles.resultHeaderCorrect : styles.resultHeaderWrong
  ], [isCorrect]);

  return (
    <Animated.View style={[styles.feedbackSection, feedbackStyle]}>
      <View style={resultHeaderStyle}>
        <View style={styles.resultIconCircle}>
          <Ionicons 
            name={isCorrect ? "checkmark-circle" : "close-circle"} 
            size={48} 
            color="#fff" 
          />
        </View>
        <View style={styles.resultTextContainer}>
          <Text style={styles.resultTitle}>
            {isCorrect ? "Correct Answer! 🎉" : "Oops! Wrong Answer"}
          </Text>
          <Text style={styles.resultSubtitle}>
            {isCorrect 
              ? "Great job! You got it right." 
              : "Don't worry, let's learn from this."}
          </Text>
        </View>
      </View>

      <View style={styles.answersComparison}>
        <View style={styles.answerBlock}>
          <View style={styles.answerBlockHeader}>
            <Text style={styles.answerBlockLabel}>Your Answer</Text>
            <Ionicons 
              name={isCorrect ? "checkmark-circle" : "close-circle"} 
              size={18} 
              color={isCorrect ? "#10b981" : "#ef4444"} 
            />
          </View>
          <Text style={[
            styles.answerBlockText,
            isCorrect ? styles.answerCorrectText : styles.answerWrongText
          ]}>
            {selected}
          </Text>
        </View>

        {!isCorrect && (
          <View style={styles.answerBlock}>
            <View style={styles.answerBlockHeader}>
              <Text style={styles.answerBlockLabel}>Correct Answer</Text>
              <Ionicons name="checkmark-circle" size={18} color="#10b981" />
            </View>
            <Text style={[styles.answerBlockText, styles.answerCorrectText]}>
              {correctAnswer}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.explanationCard}>
        <View style={styles.explanationHeader}>
          <View style={styles.explanationIconCircle}>
            <Text style={styles.explanationEmoji}>💡</Text>
          </View>
          <Text style={styles.explanationHeaderText}>Explanation</Text>
        </View>
        <Text style={styles.explanationText}>
          {explanation || "No explanation available for this question."}
        </Text>
      </View>

      <TouchableOpacity onPress={onNext} style={styles.nextButton}>
        <Text style={styles.nextButtonText}>
          {isLastQuestion ? "View Results" : "Next Question"}
        </Text>
        <Ionicons 
          name={isLastQuestion ? "trophy-outline" : "arrow-forward"} 
          size={22} 
          color="#fff" 
        />
      </TouchableOpacity>
    </Animated.View>
  );
});

// Memoized Results Screen
const ResultsScreen = memo(({ 
  score, 
  totalQuestions, 
  answers, 
  lastAnswer,
  fadeAnim,
  slideAnim,
  onRestart,
  onNextLesson 
}) => {
  const percentage = useMemo(() => Math.round((score / totalQuestions) * 100), [score, totalQuestions]);
  
  const celebrationEmoji = useMemo(() => {
    if (percentage === 100) return "🏆";
    if (percentage >= 80) return "🎉";
    if (percentage >= 60) return "👏";
    return "💪";
  }, [percentage]);

  const resultsTitle = useMemo(() => {
    if (percentage === 100) return "Perfect Score!";
    if (percentage >= 80) return "Excellent Work!";
    if (percentage >= 60) return "Good Job!";
    return "Keep Learning!";
  }, [percentage]);

  const scoreCircleBorderColor = useMemo(
    () => ({ borderColor: percentage >= 80 ? '#10b981' : percentage >= 60 ? '#f59e0b' : '#ef4444' }),
    [percentage]
  );

  const performanceFillStyle = useMemo(
    () => ({ 
      width: `${percentage}%`,
      backgroundColor: percentage >= 80 ? '#10b981' : percentage >= 60 ? '#f59e0b' : '#ef4444'
    }),
    [percentage]
  );

  const lastExplanationStyle = useMemo(() => ({
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }]
  }), [fadeAnim, slideAnim]);

  return (
    <ScrollView contentContainerStyle={styles.resultsContainer}>
      {lastAnswer?.explanation && (
        <Animated.View style={[styles.lastExplanationCard, lastExplanationStyle]}>
          <View style={styles.explanationBadge}>
            <Text style={styles.explanationBadgeEmoji}>💡</Text>
          </View>
          <Text style={styles.lastExplanationTitle}>Last Question Insight</Text>
          <Text style={styles.lastExplanationText}>{lastAnswer.explanation}</Text>
        </Animated.View>
      )}

      <View style={styles.resultsCard}>
        <View style={styles.celebrationHeader}>
          <Text style={styles.celebrationEmoji}>{celebrationEmoji}</Text>
          <Text style={styles.resultsTitle}>{resultsTitle}</Text>
        </View>

        <View style={styles.scoreContainer}>
          <View style={[styles.scoreCircle, scoreCircleBorderColor]}>
            <Text style={styles.scorePercentage}>{percentage}%</Text>
            <View style={styles.scoreDivider} />
            <Text style={styles.scoreDetail}>{score} of {totalQuestions}</Text>
          </View>
        </View>

        <View style={styles.performanceSection}>
          <Text style={styles.performanceLabel}>Performance</Text>
          <View style={styles.performanceBar}>
            <Animated.View style={[styles.performanceFill, performanceFillStyle]} />
          </View>
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Question Summary</Text>
          <View style={styles.summaryGrid}>
            {answers.map((ans, idx) => (
              <View 
                key={idx} 
                style={[
                  styles.summaryItem,
                  ans.correct ? styles.summaryItemCorrect : styles.summaryItemWrong
                ]}
              >
                <Text style={styles.summaryNumber}>{idx + 1}</Text>
                <Ionicons 
                  name={ans.correct ? "checkmark-circle" : "close-circle"} 
                  size={20} 
                  color={ans.correct ? "#10b981" : "#ef4444"} 
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity onPress={onRestart} style={[styles.actionButton, styles.restartButton]}>
            <Ionicons name="refresh-outline" size={22} color="#fff" />
            <Text style={styles.actionButtonText}>Retry Quiz</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onNextLesson} style={[styles.actionButton, styles.nextLessonButton]}>
            <Ionicons name="arrow-forward-outline" size={22} color="#fff" />
            <Text style={styles.actionButtonText}>Next Lesson</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
});

export default function LessonQuiz() {
  const route=useRoute()
  const { courseId, gradient1, gradient2, lessonId } = route.params;
  const navigation = useNavigation();
  const { lessonsdata, loadCourse } = useCoursesStore();

  // State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(1));
  const [feedbackAnim] = useState(new Animated.Value(0));

  // Memoized data
  const course = useMemo(() => lessonsdata[courseId], [lessonsdata, courseId]);
  const allLessons = useMemo(() => course?.sections?.flatMap(s => s.lessons) || [], [course]);
  const lessonIndex = useMemo(() => parseInt(lessonId, 10), [lessonId]);
  const data = useMemo(() => allLessons.find(lesson => lesson.id === lessonIndex) || {}, [allLessons, lessonIndex]);
  const parsedLesson = useMemo(() => typeof data === "string" ? JSON.parse(data) : data, [data]);
  const quiz = useMemo(() => parsedLesson?.quiz || [], [parsedLesson]);
  const current = useMemo(() => quiz[currentIndex], [quiz, currentIndex]);
  const isCorrect = useMemo(() => selected === current?.answer, [selected, current]);
  const progress = useMemo(() => ((currentIndex + 1) / quiz.length) * 100, [currentIndex, quiz.length]);
  const isLastQuestion = useMemo(() => currentIndex === quiz.length - 1, [currentIndex, quiz.length]);

  // Load course
  useEffect(() => {
    if (courseId) {
      loadCourse(courseId);
    }
  }, [courseId, loadCourse]);

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentIndex]);

  // Callbacks
  const handleBack = useCallback(() => navigation.goBack(), [navigation]);

  const handleSelect = useCallback((option) => {
    if (submitted) return;
    setSelected(option);
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.97,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, [submitted, scaleAnim]);

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    const newAnswer = { 
      question: currentIndex, 
      selected, 
      correct: isCorrect, 
      explanation: current.explanation 
    };
    setAnswers(prev => [...prev, newAnswer]);
    if (isCorrect) setScore(prev => prev + 1);

    Animated.spring(feedbackAnim, {
      toValue: 1,
      friction: 7,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [currentIndex, selected, isCorrect, current, feedbackAnim]);

  const handleNext = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentIndex(prev => prev + 1);
      setSelected(null);
      setSubmitted(false);
      slideAnim.setValue(50);
      fadeAnim.setValue(0);
      feedbackAnim.setValue(0);
    });
  }, [fadeAnim, slideAnim, feedbackAnim]);

  const handleRestart = useCallback(() => {
    setSubmitted(false);
    setTimeout(() => {
      setCurrentIndex(0);
      setSelected(null);
      setScore(0);
      setAnswers([]);
      slideAnim.setValue(50);
      fadeAnim.setValue(0);
      feedbackAnim.setValue(0);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }, 100);
  }, [fadeAnim, slideAnim, feedbackAnim]);

  const handleNextLesson = useCallback(() => {
    const nextLessonIndex = parseInt(lessonId, 10) + 1;

    if (nextLessonIndex < allLessons.length) {
      navigation.navigate(
         "LessonDetails",
        {
          lessonId: nextLessonIndex.toString(),
          courseId,
          gradient1,
          gradient2,
        },
      );
    } else {
      alert("🎉 You've completed all lessons in this course!");
    }
  }, [lessonId, allLessons, navigation, courseId, gradient1, gradient2]);

  // Memoized option press handlers
  const optionPressHandlers = useMemo(
    () => current?.options?.reduce((acc, option) => {
      acc[option] = () => handleSelect(option);
      return acc;
    }, {}) || {},
    [current, handleSelect]
  );

  // Empty state
  if (!quiz.length) {
    return <EmptyQuizState onBack={handleBack} />;
  }

  // Results screen
  if (submitted && isLastQuestion) {
    return (
      <ResultsScreen
        score={score}
        totalQuestions={quiz.length}
        answers={answers}
        lastAnswer={answers[answers.length - 1]}
        fadeAnim={fadeAnim}
        slideAnim={slideAnim}
        onRestart={handleRestart}
        onNextLesson={handleNextLesson}
      />
    );
  }

  // Quiz interface
  return (
    <View style={styles.container}>
      <QuizHeader
        lessonTitle={parsedLesson.title}
        currentIndex={currentIndex}
        totalQuestions={quiz.length}
        progress={progress}
      />

      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        updateCellsBatchingPeriod={50}
        windowSize={5}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ],
          }}
        >
          <QuestionCard question={current.question} />

          <View style={styles.optionsContainer}>
            {current.options.map((option, i) => (
              <QuizOption
                key={i}
                option={option}
                index={i}
                isSelected={selected === option}
                isSubmitted={submitted}
                isCorrect={isCorrect}
                currentAnswer={current.answer}
                onPress={optionPressHandlers[option]}
              />
            ))}
          </View>

          {!submitted && (
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!selected}
              style={[styles.submitBtn, !selected && styles.submitBtnDisabled]}
            >
              <Text style={styles.submitText}>Check Answer</Text>
              <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
            </TouchableOpacity>
          )}

          {submitted && (
            <FeedbackSection
              isCorrect={isCorrect}
              selected={selected}
              correctAnswer={current.answer}
              explanation={current.explanation}
              isLastQuestion={isLastQuestion}
              feedbackAnim={feedbackAnim}
              onNext={handleNext}
            />
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0f",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0a0f",
    padding: 20,
  },
  emptyStateCard: {
    backgroundColor: "#1a1a24",
    borderRadius: 24,
    padding: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2d2d3a",
  },
  noQuizIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  noQuiz: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
  },
  noQuizSub: {
    fontSize: 15,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: "#8b5cf6",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  headerSection: {
    backgroundColor: "#13131a",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    gap: 12,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    flex: 1,
    marginRight: 12,
  },
  questionBadge: {
    backgroundColor: "#8b5cf6",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  questionBadgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#2d2d3a",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 10,
  },
  progressText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
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
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  questionIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#2d1b4e",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  questionIcon: {
    fontSize: 20,
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8b5cf6",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  question: {
    fontSize: 19,
    fontWeight: "700",
    color: "#fff",
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 14,
    marginBottom: 24,
  },
  option: {
    backgroundColor: "#1a1a24",
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: "#2d2d3a",
  },
  optionSelected: {
    borderColor: "#8b5cf6",
    backgroundColor: "#2d1b4e",
  },
  optionCorrect: {
    borderColor: "#10b981",
    backgroundColor: "#064e3b",
  },
  optionWrong: {
    borderColor: "#ef4444",
    backgroundColor: "#7f1d1d",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionLetter: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#2d2d3a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  optionLetterSelected: {
    backgroundColor: "#8b5cf6",
  },
  optionLetterCorrect: {
    backgroundColor: "#10b981",
  },
  optionLetterWrong: {
    backgroundColor: "#ef4444",
  },
  optionLetterText: {
    color: "#94a3b8",
    fontSize: 17,
    fontWeight: "800",
  },
  optionLetterTextSelected: {
    color: "#fff",
  },
  optionText: {
    fontSize: 16,
    color: "#e2e8f0",
    flex: 1,
    lineHeight: 24,
    fontWeight: "500",
  },
  optionTextBold: {
    fontWeight: "700",
    color: "#fff",
  },
  submitBtn: {
    backgroundColor: "#8b5cf6",
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#8b5cf6",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 8,
  },
  submitBtnDisabled: {
    backgroundColor: "#2d2d3a",
    shadowOpacity: 0,
  },
  submitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 17,
  },
  feedbackSection: {
    marginTop: 24,
    gap: 16,
  },
  resultHeader: {
    borderRadius: 20,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  resultHeaderCorrect: {
    backgroundColor: "#064e3b",
  },
  resultHeaderWrong: {
    backgroundColor: "#7f1d1d",
  },
  resultIconCircle: {
    marginRight: 16,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  answersComparison: {
    gap: 12,
  },
  answerBlock: {
    backgroundColor: "#1a1a24",
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: "#2d2d3a",
  },
  answerBlockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  answerBlockLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  answerBlockText: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
  },
  answerCorrectText: {
    color: "#10b981",
  },
  answerWrongText: {
    color: "#ef4444",
  },
  explanationCard: {
    backgroundColor: "#1a1a24",
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#8b5cf6",
  },
  explanationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  explanationIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#2d1b4e",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  explanationEmoji: {
    fontSize: 18,
  },
  explanationHeaderText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#a5b4fc",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  explanationText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#cbd5e1",
    fontWeight: "400",
  },
  nextButton: {
    backgroundColor: "#8b5cf6",
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#8b5cf6",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 8,
  },
  nextButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 17,
  },
  resultsContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#0a0a0f",
    justifyContent: "center",
  },
  lastExplanationCard: {
    backgroundColor: "#1a1a24",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#8b5cf6",
    shadowColor: "#8b5cf6",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  explanationBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#2d1b4e",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  explanationBadgeEmoji: {
    fontSize: 22,
  },
  lastExplanationTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#a5b4fc",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  lastExplanationText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#cbd5e1",
  },
  resultsCard: {
    backgroundColor: "#1a1a24",
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: "#2d2d3a",
  },
  celebrationHeader: {
    alignItems: "center",
    marginBottom: 28,
  },
  celebrationEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
  },
  scoreContainer: {
    alignItems: "center",
    marginBottom: 28,
  },
  scoreCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "#2d1b4e",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 6,
  },
  scorePercentage: {
    fontSize: 48,
    fontWeight: "800",
    color: "#fff",
  },
  scoreDivider: {
    width: 60,
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 8,
  },
  scoreDetail: {
    fontSize: 16,
    fontWeight: "600",
    color: "#94a3b8",
  },
  performanceSection: {
    marginBottom: 28,
  },
  performanceLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  performanceBar: {
    height: 12,
    backgroundColor: "#2d2d3a",
    borderRadius: 10,
    overflow: "hidden",
  },
  performanceFill: {
    height: "100%",
    borderRadius: 10,
  },
  summarySection: {
    marginBottom: 28,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  summaryItem: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: "#2d2d3a",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    gap: 6,
  },
  summaryItemCorrect: {
    borderColor: "#10b981",
    backgroundColor: "#064e3b",
  },
  summaryItemWrong: {
    borderColor: "#ef4444",
    backgroundColor: "#7f1d1d",
  },
  summaryNumber: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  restartButton: {
    backgroundColor: "#2d2d3a",
  },
  nextLessonButton: {
    backgroundColor: "#8b5cf6",
    shadowColor: "#8b5cf6",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 8,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 17,
  },
});