// mobile/src/screens/onboarding/GoalSettingScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface GoalSettingScreenProps {
  navigation: any;
  route: {
    params: {
      selectedSubjects: string[];
      aspiringCourse: string;
      suggestedScore: number;
    };
  };
}

const LEARNING_STYLES = [
  { 
    id: 'visual', 
    name: 'Visual Learner', 
    icon: '👁️', 
    description: 'Learn best with charts, diagrams, and images' 
  },
  { 
    id: 'auditory', 
    name: 'Auditory Learner', 
    icon: '👂', 
    description: 'Prefer explanations and discussions' 
  },
  { 
    id: 'kinesthetic', 
    name: 'Hands-on Learner', 
    icon: '✋', 
    description: 'Learn through practice and examples' 
  },
  { 
    id: 'reading', 
    name: 'Reading/Writing', 
    icon: '📝', 
    description: 'Prefer text-based learning and notes' 
  }
];

export const GoalSettingScreen: React.FC<GoalSettingScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { selectedSubjects, aspiringCourse, suggestedScore } = route.params;
  const [goalScore, setGoalScore] = useState(suggestedScore.toString());
  const [learningStyle, setLearningStyle] = useState<string>('');

  const handleContinue = () => {
    const numericGoal = parseInt(goalScore);
    
    if (numericGoal < 200 || numericGoal > 400) {
      return;
    }

    if (!learningStyle) {
      return;
    }

    navigation.navigate('DiagnosticAssessment', {
      selectedSubjects,
      aspiringCourse,
      goalScore: numericGoal,
      learningStyle
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 24 }}>
          {/* Header */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 }}>
              Set Your Goals
            </Text>
            <Text style={{ fontSize: 16, color: '#6B7280', lineHeight: 24 }}>
              Let's personalize your learning experience based on your goals and learning style.
            </Text>
          </View>

          {/* Course Summary */}
          <View style={{ 
            backgroundColor: '#F3F4F6', 
            padding: 16, 
            borderRadius: 12, 
            marginBottom: 32 
          }}>
            <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 4 }}>
              Aspiring Course
            </Text>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937' }}>
              {aspiringCourse}
            </Text>
          </View>

          {/* Goal Score */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 20, fontWeight: '600', color: '#1F2937', marginBottom: 16 }}>
              Target UTME Score
            </Text>
            
            <Input
              label={`Recommended: ${suggestedScore}+ for ${aspiringCourse}`}
              placeholder="Enter your target score"
              value={goalScore}
              onChangeText={setGoalScore}
              keyboardType="numeric"
              error={
                goalScore && (parseInt(goalScore) < 200 || parseInt(goalScore) > 400)
                  ? 'Score must be between 200-400'
                  : ''
              }
            />

            <View style={{ 
              backgroundColor: '#FEF3C7', 
              padding: 12, 
              borderRadius: 8, 
              marginTop: 8,
              borderLeftWidth: 4,
              borderLeftColor: '#F59E0B'
            }}>
              <Text style={{ fontSize: 12, color: '#92400E' }}>
                💡 Tip: Set a score 20-30 points above the typical cutoff to increase your chances
              </Text>
            </View>
          </View>

          {/* Learning Style */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 20, fontWeight: '600', color: '#1F2937', marginBottom: 16 }}>
              How Do You Learn Best?
            </Text>
            
            <View style={{ gap: 12 }}>
              {LEARNING_STYLES.map((style) => {
                const isSelected = learningStyle === style.id;
                
                return (
                  <TouchableOpacity
                    key={style.id}
                    onPress={() => setLearningStyle(style.id)}
                    style={{
                      backgroundColor: isSelected ? '#EFF6FF' : 'white',
                      borderWidth: 2,
                      borderColor: isSelected ? '#3B82F6' : '#E5E7EB',
                      borderRadius: 12,
                      padding: 16,
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                  >
                    <Text style={{ fontSize: 24, marginRight: 16 }}>
                      {style.icon}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ 
                        fontSize: 16, 
                        fontWeight: '600', 
                        color: isSelected ? '#1E40AF' : '#374151',
                        marginBottom: 4
                      }}>
                        {style.name}
                      </Text>
                      <Text style={{ 
                        fontSize: 14, 
                        color: '#6B7280',
                        lineHeight: 20
                      }}>
                        {style.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={{ flexDirection: 'row', gap: 12, padding: 24 }}>
        <Button
          title="Back"
          onPress={() => navigation.goBack()}
          variant="outline"
          style={{ flex: 1 }}
        />
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={
            !learningStyle || 
            !goalScore || 
            parseInt(goalScore) < 200 || 
            parseInt(goalScore) > 400
          }
          style={{ flex: 2 }}
        />
      </View>
    </SafeAreaView>
  );
};
