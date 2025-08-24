import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { usePracticeStore } from '../../stores/practiceStore';
import { COLORS, SIZES } from '../../constants';
import { practiceStyles as styles } from '../../styles/practice';

export const PracticeSessionScreen: React.FC = () => {
  const {
    currentSession,
    currentQuestion,
    currentQuestionIndex,
    sessionQuestions,
    sessionProgress,
    submitQuestionAttempt,
    navigateToQuestion,
    flagQuestion,
    unflagQuestion,
    preloadNextQuestions,
    loading,
  } = usePracticeStore();

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [confidence, setConfidence] = useState(50);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [hintLevel, setHintLevel] = useState(0);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentSession) {
      preloadNextQuestions(5);
    }
  }, [currentQuestionIndex, currentSession]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmitAnswer = async () => {
    if (!currentSession || !currentQuestion || selectedOption === null) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await submitQuestionAttempt(currentSession.id, currentQuestion.id, {
      selectedOption,
      timeTaken: timeElapsed * 1000,
      confidenceLevel: confidence,
    });
    if (currentQuestionIndex < sessionQuestions.length - 1) {
      navigateToQuestion(currentQuestionIndex + 1);
      setSelectedOption(null);
      setConfidence(50);
      setTimeElapsed(0);
      setHintLevel(0);
    }
  };

  const handleRequestHint = () => {
    if (currentQuestion?.hints && hintLevel < currentQuestion.hints.length) {
      setHintLevel(hintLevel + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const readQuestion = () => {
    if (currentQuestion) {
      Speech.speak(`${currentQuestion.text}. Options: ${currentQuestion.options.map((o, i) => `${String.fromCharCode(65 + i)}: ${o.text}`).join(', ')}`);
    }
  };

  const toggleHighContrast = () => {
    setIsHighContrast(!isHighContrast);
  };

  const SessionHeader = () => (
    <View style={[styles.sessionHeader, isHighContrast && { backgroundColor: COLORS.black, borderColor: COLORS.white }]}>
      <TouchableOpacity style={styles.pauseButton}>
        <Ionicons name="pause" size={20} color={isHighContrast ? COLORS.white : COLORS.primary} />
      </TouchableOpacity>
      <Text style={[styles.questionCounter, isHighContrast && { color: COLORS.white }]}>
        Q {currentQuestionIndex + 1}/{sessionQuestions.length}
      </Text>
      <Text style={[styles.timer, isHighContrast && { color: COLORS.white }]}>
        ⏱️ {formatTime(timeElapsed)}
      </Text>
      <View style={[styles.accuracyBadge, isHighContrast && { backgroundColor: COLORS.white }]}>
        <Text style={[styles.accuracyText, isHighContrast && { color: COLORS.black }]}>
          🏃‍♂️ 95%
        </Text>
      </View>
    </View>
  );

  const QuestionDisplay = () => (
    <View style={[styles.questionContainer, isHighContrast && { backgroundColor: COLORS.black }]}>
      {currentQuestion ? (
        <Text style={[styles.breadcrumb, isHighContrast && { color: COLORS.white }]}>
          {currentQuestion?.topic?.name || 'Mathematics' }
        </Text>
            ) : (
        <Text>Loading question...</Text>
      )}
      <Text style={[styles.questionText, isHighContrast && { color: COLORS.white }]}>
        {currentQuestion?.text || 'Loading question...'}
      </Text>
      <View style={styles.optionsContainer}>
{currentQuestion?.options && currentQuestion.options.length > 0 ? (
  currentQuestion.options.map((option, index) => (
    <TouchableOpacity
      key={option.id || index}
      style={[
        styles.optionItem,
        selectedOption === index && styles.selectedOption,
        isHighContrast && { borderColor: COLORS.white, backgroundColor: COLORS.black },
        selectedOption === index && isHighContrast && { backgroundColor: COLORS.white }
      ]}
      onPress={() => setSelectedOption(index)}
    >
      <View style={[styles.optionBullet, isHighContrast && { backgroundColor: COLORS.white }]}>
        <Text style={[styles.optionLetter, isHighContrast && { color: COLORS.black }]}>
          {String.fromCharCode(65 + index)}
        </Text>
      </View>
      <Text style={[styles.optionText, isHighContrast && { color: COLORS.white }]}>
        {option.text}
      </Text>
      {selectedOption === index && (
        <Text style={[styles.selectedIndicator, isHighContrast && { color: COLORS.black }]}>
          ←Selected
        </Text>
      )}
    </TouchableOpacity>
  ))
) : (
  <Text style={{ color: isHighContrast ? COLORS.white : COLORS.black }}>
    No options available
  </Text>
)}

      </View>
      <View style={styles.confidenceContainer}>
        <Text style={[styles.confidenceLabel, isHighContrast && { color: COLORS.white }]}>
          Confidence:
        </Text>
        <View style={styles.confidenceSlider}>
          {[1, 2, 3, 4, 5].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.confidenceLevel,
                level <= confidence / 20 && styles.confidenceFilled,
                isHighContrast && { backgroundColor: COLORS.white, opacity: level <= confidence / 20 ? 1 : 0.3 }
              ]}
              onPress={() => setConfidence(level * 20)}
            />
          ))}
        </View>
        <Text style={[styles.confidencePercent, isHighContrast && { color: COLORS.white }]}>
          ({confidence}%)
        </Text>
      </View>
      {hintLevel > 0 && currentQuestion?.hints && (
        <View style={styles.hintContainer}>
          <Text style={[styles.hintText, isHighContrast && { color: COLORS.white }]}>
            Hint: {currentQuestion.hints[hintLevel - 1]}
          </Text>
        </View>
      )}
    </View>
  );

  const SessionControls = () => (
    <View style={[styles.controlsContainer, isHighContrast && { backgroundColor: COLORS.black }]}>
      <TouchableOpacity 
        style={styles.controlButton}
        onPress={() => flagQuestion(currentQuestionIndex)}
      >
        <Ionicons name="flag" size={20} color={isHighContrast ? COLORS.white : COLORS.warning} />
        <Text style={[styles.controlText, isHighContrast && { color: COLORS.white }]}>
          FLAG
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.controlButton}
        onPress={readQuestion}
      >
        <Ionicons name="volume-high" size={20} color={isHighContrast ? COLORS.white : COLORS.secondary} />
        <Text style={[styles.controlText, isHighContrast && { color: COLORS.white }]}>
          READ
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.controlButton}
        onPress={toggleHighContrast}
      >
        <Ionicons name="contrast" size={20} color={isHighContrast ? COLORS.white : COLORS.secondary} />
        <Text style={[styles.controlText, isHighContrast && { color: COLORS.white }]}>
          CONTRAST
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.controlButton}
        onPress={() => setIsFocusMode(!isFocusMode)}
      >
        <Ionicons name={isFocusMode ? "expand" : "contract"} size={20} color={isHighContrast ? COLORS.white : COLORS.secondary} />
        <Text style={[styles.controlText, isHighContrast && { color: COLORS.white }]}>
          FOCUS
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.navigationButton, isHighContrast && { borderColor: COLORS.white }]}
        onPress={() => navigateToQuestion(Math.max(0, currentQuestionIndex - 1))}
        disabled={currentQuestionIndex === 0}
      >
        <Ionicons name="chevron-back" size={20} color={isHighContrast ? COLORS.white : COLORS.primary} />
        <Text style={[styles.controlText, isHighContrast && { color: COLORS.white }]}>
          PREV
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.navigationButton, styles.nextButton, isHighContrast && { backgroundColor: COLORS.white }]}
        onPress={handleSubmitAnswer}
        disabled={selectedOption === null}
      >
        <Text style={[styles.nextText, isHighContrast && { color: COLORS.black }]}>
          NEXT
        </Text>
        <Ionicons name="chevron-forward" size={20} color={isHighContrast ? COLORS.black : COLORS.white} />
      </TouchableOpacity>
    </View>
  );

  const SidePanel = () => (
    <Animated.View 
      entering={FadeInRight}
      style={[styles.sidePanel, isHighContrast && { backgroundColor: COLORS.black }]}
    >
      <Text style={[styles.sidePanelTitle, isHighContrast && { color: COLORS.white }]}>
        Session Overview
      </Text>
      <View style={styles.progressOverview}>
        <Text style={[styles.progressText, isHighContrast && { color: COLORS.white }]}>
          Progress: {sessionProgress.answered}/{sessionQuestions.length}
        </Text>
        <View style={[styles.progressBar, isHighContrast && { backgroundColor: COLORS.white, opacity: 0.3 }]}>
          <View 
            style={[
              styles.progressFill,
              { width: `${(sessionProgress.answered / sessionQuestions.length) * 100}%` },
              isHighContrast && { backgroundColor: COLORS.white }
            ]}
          />
        </View>
      </View>
      <ScrollView style={styles.questionList}>
        {sessionQuestions.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.questionItem,
              index === currentQuestionIndex && styles.currentQuestionItem,
              isHighContrast && { backgroundColor: COLORS.black, borderColor: COLORS.white }
            ]}
            onPress={() => navigateToQuestion(index)}
          >
            <Text style={[styles.questionNumber, isHighContrast && { color: COLORS.white }]}>
              {index + 1}.
            </Text>
            <Text style={[styles.questionStatus, isHighContrast && { color: COLORS.white }]}>
              {index < sessionProgress.answered ? '✅' : 
               sessionProgress.flagged.includes(index) ? '🏳️' :
               index === currentQuestionIndex ? '🔵' : '⚪'}
            </Text>
            <Text style={[styles.questionTitle, isHighContrast && { color: COLORS.white }]}>
              {index < sessionProgress.answered ? 'Completed' :
               index === currentQuestionIndex ? 'Current Question' : 'Upcoming...'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.sessionStats}>
        <Text style={[styles.statText, isHighContrast && { color: COLORS.white }]}>
          Accuracy: {Math.round((sessionProgress.answered > 0 ? 
            sessionProgress.answered / sessionQuestions.length : 0) * 100)}%
        </Text>
        <Text style={[styles.statText, isHighContrast && { color: COLORS.white }]}>
          Avg Time: 1.8 min/Q
        </Text>
        <Text style={[styles.statText, isHighContrast && { color: COLORS.white }]}>
          Flagged: {sessionProgress.flagged.length}
        </Text>
      </View>
      <View style={styles.sidePanelControls}>
        <TouchableOpacity style={[styles.sidePanelButton, isHighContrast && { backgroundColor: COLORS.white }]}>
          <Text style={[styles.sidePanelButtonText, isHighContrast && { color: COLORS.black }]}>
            PAUSE & SAVE
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.sidePanelButton, isHighContrast && { backgroundColor: COLORS.white }]}>
          <Text style={[styles.sidePanelButtonText, isHighContrast && { color: COLORS.black }]}>
            SETTINGS
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  if (loading.session || !currentQuestion) {
    return (
      <SafeAreaView style={[styles.loadingContainer, isHighContrast && { backgroundColor: COLORS.black }]}>
        <Text style={isHighContrast && { color: COLORS.white }}>Loading session...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.sessionContainer, isHighContrast && { backgroundColor: COLORS.black }]}>
      {!isFocusMode && <SessionHeader />}
      {!isFocusMode && (
        <TouchableOpacity
          style={[styles.sidePanelToggle, isHighContrast && { backgroundColor: COLORS.white }]}
          onPress={() => setShowSidePanel(!showSidePanel)}
        >
          <Ionicons name="menu" size={24} color={isHighContrast ? COLORS.black : COLORS.primary} />
        </TouchableOpacity>
      )}
      <ScrollView style={styles.sessionContent}>
        <QuestionDisplay />
      </ScrollView>
      {!isFocusMode && <SessionControls />}
      {!isFocusMode && showSidePanel && <SidePanel />}
    </SafeAreaView>
  );
};
