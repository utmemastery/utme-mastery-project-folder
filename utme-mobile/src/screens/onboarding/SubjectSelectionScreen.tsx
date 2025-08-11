// mobile/src/screens/onboarding/SubjectSelectionScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';

interface SubjectSelectionScreenProps {
  navigation: any;
}

const UTME_SUBJECTS = [
  { id: 'english', name: 'English Language', icon: '📚', required: true },
  { id: 'mathematics', name: 'Mathematics', icon: '🔢', required: true },
  { id: 'physics', name: 'Physics', icon: '⚛️', category: 'Science' },
  { id: 'chemistry', name: 'Chemistry', icon: '🧪', category: 'Science' },
  { id: 'biology', name: 'Biology', icon: '🧬', category: 'Science' },
  { id: 'geography', name: 'Geography', icon: '🌍', category: 'Social Science' },
  { id: 'economics', name: 'Economics', icon: '💰', category: 'Social Science' },
  { id: 'government', name: 'Government', icon: '🏛️', category: 'Social Science' },
  { id: 'literature', name: 'Literature in English', icon: '📖', category: 'Arts' },
  { id: 'history', name: 'History', icon: '📜', category: 'Arts' },
  { id: 'crs', name: 'Christian Religious Studies', icon: '✝️', category: 'Arts' },
  { id: 'irs', name: 'Islamic Religious Studies', icon: '☪️', category: 'Arts' },
  { id: 'yoruba', name: 'Yoruba', icon: '🗣️', category: 'Languages' },
  { id: 'hausa', name: 'Hausa', icon: '🗣️', category: 'Languages' },
  { id: 'igbo', name: 'Igbo', icon: '🗣️', category: 'Languages' },
];

export const SubjectSelectionScreen: React.FC<SubjectSelectionScreenProps> = ({ navigation }) => {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['english', 'mathematics']);

  const toggleSubject = (subjectId: string) => {
    const subject = UTME_SUBJECTS.find(s => s.id === subjectId);
    
    if (subject?.required) {
      Alert.alert('Required Subject', `${subject.name} is required for all UTME candidates`);
      return;
    }

    setSelectedSubjects(prev => {
      if (prev.includes(subjectId)) {
        return prev.filter(id => id !== subjectId);
      } else if (prev.length < 4) {
        return [...prev, subjectId];
      } else {
        Alert.alert('Maximum Reached', 'You can only select 4 subjects for UTME');
        return prev;
      }
    });
  };

  const handleContinue = () => {
    if (selectedSubjects.length < 4) {
      Alert.alert('Incomplete Selection', `Please select ${4 - selectedSubjects.length} more subject(s)`);
      return;
    }

    navigation.navigate('CourseSelection', { selectedSubjects });
  };

  const groupedSubjects = UTME_SUBJECTS.reduce((acc, subject) => {
    const category = subject.category || 'Core';
    if (!acc[category]) acc[category] = [];
    acc[category].push(subject);
    return acc;
  }, {} as Record<string, typeof UTME_SUBJECTS>);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1, padding: 24 }}>
        {/* Header */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 }}>
            Choose Your Subjects
          </Text>
          <Text style={{ fontSize: 16, color: '#6B7280', lineHeight: 24 }}>
            Select 4 subjects for your UTME preparation.{'\n'}
            English and Mathematics are required.
          </Text>
          <View style={{ 
            backgroundColor: '#EFF6FF', 
            padding: 12, 
            borderRadius: 8, 
            marginTop: 16,
            borderLeftWidth: 4,
            borderLeftColor: '#3B82F6'
          }}>
            <Text style={{ fontSize: 14, color: '#1E40AF' }}>
              {selectedSubjects.length}/4 subjects selected
            </Text>
          </View>
        </View>

        {/* Subject Grid */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {Object.entries(groupedSubjects).map(([category, subjects]) => (
            <View key={category} style={{ marginBottom: 24 }}>
              <Text style={{ 
                fontSize: 18, 
                fontWeight: '600', 
                color: '#374151', 
                marginBottom: 12 
              }}>
                {category}
              </Text>
              
              <View style={{ 
                flexDirection: 'row', 
                flexWrap: 'wrap', 
                gap: 12 
              }}>
                {subjects.map((subject) => {
                  const isSelected = selectedSubjects.includes(subject.id);
                  const isRequired = subject.required;
                  
                  return (
                    <TouchableOpacity
                      key={subject.id}
                      onPress={() => toggleSubject(subject.id)}
                      style={{
                        flexBasis: '47%',
                        backgroundColor: isSelected ? '#EFF6FF' : 'white',
                        borderWidth: 2,
                        borderColor: isSelected ? '#3B82F6' : '#E5E7EB',
                        borderRadius: 12,
                        padding: 16,
                        alignItems: 'center',
                        opacity: isRequired ? 0.7 : 1
                      }}
                      disabled={isRequired}
                    >
                      <Text style={{ fontSize: 32, marginBottom: 8 }}>
                        {subject.icon}
                      </Text>
                      <Text style={{ 
                        fontSize: 14, 
                        fontWeight: '600', 
                        color: isSelected ? '#1E40AF' : '#374151',
                        textAlign: 'center' 
                      }}>
                        {subject.name}
                      </Text>
                      {isRequired && (
                        <Text style={{ 
                          fontSize: 10, 
                          color: '#9CA3AF', 
                          marginTop: 4 
                        }}>
                          Required
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Continue Button */}
        <View style={{ paddingTop: 16 }}>
          <Button
            title="Continue"
            onPress={handleContinue}
            disabled={selectedSubjects.length < 4}
            size="large"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};
