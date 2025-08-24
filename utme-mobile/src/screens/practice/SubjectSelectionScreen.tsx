import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { usePracticeStore } from '../../stores/practiceStore';
import { practiceStyles as styles } from '../../styles/practice';
import { COLORS } from '../../constants';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PracticeStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<PracticeStackParamList, 'SubjectSelection'>;

interface Topic {
  id: number;
  name: string;
  mastery: number | null;
  isUnlocked: boolean;
}
interface Section {
  id: number;
  name: string;
  avgMastery: number | null;
  topicCount: number;
  masteredTopics: number;
  topics?: Topic[];
}

export const SubjectSelectionScreen: React.FC<Props> = ({ route, navigation }) => {
  const { subjectId } = route.params; // string from navigation
  const {
    currentSubject,
    sections,
    currentSession,
    loadSubjectDetails,
    loadSubjectSections,
    createPracticeSession,
    createDiagnosticSession,
  } = usePracticeStore();

  // Convert subjectId to number for store functions
  useEffect(() => {
    const id = Number(subjectId);
    loadSubjectDetails(id);
    loadSubjectSections(id);
  }, [subjectId]);

const navigateToTopic = async (topicId: number) => {
  try {
    const session = await createPracticeSession({ topicId, subjectId: currentSubject?.id, sessionType: 'PRACTICE', questionCount: 10, difficulty: 'MIXED' });
    navigation.navigate('PracticeSession', { sessionId: session.id });
  } catch (error) {
    console.error('Failed to create session:', error);
  }
};



  const TopicMap = () => (
    <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
      <Text style={styles.sectionTitle}>Topic Map</Text>
      <View style={styles.topicMap}>
        {sections.map((section: Section) => (
          <View key={section.id} style={styles.sectionNode}>
            <Text style={styles.sectionName}>
              {section.name} - {section.avgMastery ?? 0}%
            </Text>
            <View style={styles.topicNodes}>
              {section.topics?.map((topic: Topic) => (
                <TouchableOpacity
                  key={topic.id}
                  style={[styles.topicNode, topic.isUnlocked ? null : styles.lockedNode]}
                  disabled={!topic.isUnlocked}
                  onPress={() => navigateToTopic(topic.id)}
                >
                  <Text style={styles.topicText}>
                    {topic.name} ({topic.mastery ?? 0}%)
                  </Text>
                  {!topic.isUnlocked && (
                    <Ionicons name="lock-closed" size={16} color={COLORS.textSecondary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>
    </Animated.View>
  );

const DiagnosticButton = () => {
  const handleDiagnosticPress = async () => {
    // Create diagnostic session first
    await createDiagnosticSession({
      subjectId: Number(subjectId),
      questionCount: 5
    });

    // Navigate to PracticeSessionScreen with the new session
    navigation.navigate('PracticeSession', {
      sessionId: currentSession?.id // currentSession comes from the store
    });
  };

  return (
    <Animated.View entering={FadeInDown.delay(400)} style={styles.actionCard}>
      <Text style={styles.actionTitle}>Quick Diagnostic</Text>
      <Text style={styles.actionSubtitle}>5 Qs to calibrate practice</Text>
      <TouchableOpacity style={styles.actionButton} onPress={handleDiagnosticPress}>
        <Text style={styles.actionButtonText}>TAKE DIAGNOSTIC</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {currentSubject?.name || 'Subject'} - {currentSubject?.mastery ?? 0}%
        </Text>
      </View>
      <ScrollView style={styles.content}>
        <TopicMap />
        <DiagnosticButton />
      </ScrollView>
    </SafeAreaView>
  );
};
