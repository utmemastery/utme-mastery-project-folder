// mobile/src/screens/practice/PracticeHomeScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/authStore';
import { usePracticeStore } from '../../stores/practiceStore';

interface PracticeHomeScreenProps {
  navigation: any;
}

export const PracticeHomeScreen: React.FC<PracticeHomeScreenProps> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { startPracticeSession, isLoading } = usePracticeStore();

  const selectedSubjects = user?.selectedSubjects || [];

  const handleStartPractice = async (subject: string, type: string = 'practice') => {
    try {
      await startPracticeSession({
        subject,
        sessionType: type,
        questionCount: type === 'quick' ? 5 : 10
      });
      navigation.navigate('PracticeSession');
    } catch (error) {
      // Error handled by store
    }
  };

  const subjectCards = selectedSubjects.map(subject => ({
    id: subject,
    name: subject.charAt(0).toUpperCase() + subject.slice(1),
    icon: getSubjectIcon(subject),
    progress: Math.floor(Math.random() * 100), // Replace with real progress
    weakTopics: ['Topic 1', 'Topic 2'], // Replace with real data
    lastScore: Math.floor(Math.random() * 100)
  }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 24 }}>
          {/* Header */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 }}>
              Practice Mode
            </Text>
            <Text style={{ fontSize: 16, color: '#6B7280' }}>
              Choose a subject to start practicing
            </Text>
          </View>

          {/* Quick Actions */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 16 }}>
              Quick Start
            </Text>
            
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => handleStartPractice('mixed', 'daily')}
                style={{
                  flex: 1,
                  backgroundColor: '#3B82F6',
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center'
                }}
              >
                <Text style={{ fontSize: 24, marginBottom: 8 }}>⚡</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: 'white', textAlign: 'center' }}>
                  Daily Quiz
                </Text>
                <Text style={{ fontSize: 12, color: '#BFDBFE', textAlign: 'center' }}>
                  5 mixed questions
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('MockExam')}
                style={{
                  flex: 1,
                  backgroundColor: '#8B5CF6',
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center'
                }}
              >
                <Text style={{ fontSize: 24, marginBottom: 8 }}>🎯</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: 'white', textAlign: 'center' }}>
                  Mock Exam
                </Text>
                <Text style={{ fontSize: 12, color: '#C4B5FD', textAlign: 'center' }}>
                  Full simulation
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Subject Cards */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 16 }}>
              Practice by Subject
            </Text>
            
            <View style={{ gap: 16 }}>
              {subjectCards.map((subject) => (
                <TouchableOpacity
                  key={subject.id}
                  onPress={() => handleStartPractice(subject.id)}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 16,
                    padding: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                    elevation: 2
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <Text style={{ fontSize: 32, marginRight: 16 }}>
                      {subject.icon}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937' }}>
                        {subject.name}
                      </Text>
                      <Text style={{ fontSize: 14, color: '#6B7280' }}>
                        Last score: {subject.lastScore}%
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#3B82F6' }}>
                        {subject.progress}%
                      </Text>
                      <Text style={{ fontSize: 12, color: '#6B7280' }}>
                        mastery
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View style={{ 
                    height: 4, 
                    backgroundColor: '#E5E7EB', 
                    borderRadius: 2, 
                    overflow: 'hidden',
                    marginBottom: 12
                  }}>
                    <View style={{ 
                      height: '100%', 
                      backgroundColor: '#3B82F6',
                      width: `${subject.progress}%`
                    }} />
                  </View>

                  {/* Weak Topics */}
                  {subject.weakTopics.length > 0 && (
                    <View>
                      <Text style={{ fontSize: 12, color: '#EF4444', marginBottom: 4 }}>
                        Focus areas: {subject.weakTopics.join(', ')}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper function for subject icons
const getSubjectIcon = (subject: string): string => {
  const icons: Record<string, string> = {
    english: '📚',
    mathematics: '🔢',
    physics: '⚛️',
    chemistry: '🧪',
    biology: '🧬',
    geography: '🌍',
    economics: '💰',
    government: '🏛️',
    literature: '📖',
    history: '📜',
    crs: '✝️',
    irs: '☪️',
    yoruba: '🗣️',
    hausa: '🗣️',
    igbo: '🗣️'
  };
  return icons[subject] || '📋';
};
