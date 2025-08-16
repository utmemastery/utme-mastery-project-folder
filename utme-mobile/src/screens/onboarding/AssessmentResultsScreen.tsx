import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

interface AssessmentResultsScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AssessmentResults'>;
  route: {
    params: {
      subjectProficiency: Array<{ subject: string; proficiency: number }>;
      goalScore: number;
      aspiringCourse: string;
    };
  };
}

export const AssessmentResultsScreen: React.FC<AssessmentResultsScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { subjectProficiency, goalScore, aspiringCourse } = route.params;

  const getSubjectName = (subject: string) => {
    const names: Record<string, string> = {
      english: 'English Language',
      mathematics: 'Mathematics',
      physics: 'Physics',
      chemistry: 'Chemistry',
      biology: 'Biology',
      // Add more mappings
    };
    return names[subject] || subject;
  };

  const getProficiencyLevel = (score: number) => {
    if (score >= 80) return { level: 'Excellent', color: '#10B981' };
    if (score >= 60) return { level: 'Good', color: '#3B82F6' };
    if (score >= 40) return { level: 'Fair', color: '#F59E0B' };
    return { level: 'Needs Work', color: '#EF4444' };
  };

  const averageProficiency = subjectProficiency.reduce((sum, item) => sum + item.proficiency, 0) / subjectProficiency.length;
  const currentProjectedScore = Math.round(200 + (averageProficiency / 100) * 200);

  const handleStartLearning = () => {
    console.log('Navigating to MainTabs');
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }]
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 24 }}>
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>📊</Text>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 }}>
              Your Assessment Results
            </Text>
            <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center' }}>
              Based on your performance, here's your current standing
            </Text>
          </View>

          {/* Overall Score */}
          <View style={{ 
            backgroundColor: '#F3F4F6', 
            padding: 20, 
            borderRadius: 16, 
            marginBottom: 24,
            alignItems: 'center'
          }}>
            <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 8 }}>
              Current Projected UTME Score
            </Text>
            <Text style={{ fontSize: 48, fontWeight: 'bold', color: '#3B82F6', marginBottom: 8 }}>
              {currentProjectedScore}
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center' }}>
              Target: {goalScore} for {aspiringCourse}
            </Text>
            
            {currentProjectedScore < goalScore && (
              <View style={{ marginTop: 16 }}>
                <Text style={{ fontSize: 14, color: '#EF4444', textAlign: 'center' }}>
                  You're {goalScore - currentProjectedScore} points away from your goal. Let's work together to reach it!
                </Text>
              </View>
            )}
          </View>

          {/* Subject Breakdown */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 20, fontWeight: '600', color: '#1F2937', marginBottom: 16 }}>
              Subject Performance
            </Text>
            
            {subjectProficiency.map((item) => {
              const { level, color } = getProficiencyLevel(item.proficiency);
              
              return (
                <View key={item.subject} style={{ 
                  backgroundColor: 'white',
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>
                      {getSubjectName(item.subject)}
                    </Text>
                    <Text style={{ fontSize: 14, color, fontWeight: '600' }}>
                      {level}
                    </Text>
                  </View>
                  
                  {/* Progress Bar */}
                  <View style={{ 
                    height: 8, 
                    backgroundColor: '#E5E7EB', 
                    borderRadius: 4, 
                    overflow: 'hidden',
                    marginBottom: 8
                  }}>
                    <View style={{ 
                      height: '100%', 
                      backgroundColor: color,
                      width: `${item.proficiency}%`
                    }} />
                  </View>
                  
                  <Text style={{ fontSize: 12, color: '#6B7280' }}>
                    {Math.round(item.proficiency)}% proficiency
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Next Steps */}
          <View style={{ 
            backgroundColor: '#F0F9FF', 
            padding: 20, 
            borderRadius: 16, 
            marginBottom: 24 
          }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#1E40AF', marginBottom: 12 }}>
              🚀 Your Personalized Plan
            </Text>
            <Text style={{ fontSize: 14, color: '#1E40AF', lineHeight: 20 }}>
              We've created a custom study plan focusing on your weak areas while maintaining your strengths. 
              Your AI tutor will adapt the difficulty as you improve!
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={{ padding: 24 }}>
        <Button
          title="Start My Learning Journey"
          onPress={handleStartLearning}
          size="large"
        />
      </View>
    </SafeAreaView>
  );
};