// mobile/src/screens/onboarding/CourseSelectionScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';

interface CourseSelectionScreenProps {
  navigation: any;
  route: {
    params: {
      selectedSubjects: string[];
    };
  };
}

const POPULAR_COURSES = [
  { id: 'medicine', name: 'Medicine & Surgery', icon: '🩺', cutoff: 320 },
  { id: 'engineering', name: 'Engineering', icon: '⚙️', cutoff: 280 },
  { id: 'law', name: 'Law', icon: '⚖️', cutoff: 280 },
  { id: 'pharmacy', name: 'Pharmacy', icon: '💊', cutoff: 300 },
  { id: 'computer_science', name: 'Computer Science', icon: '💻', cutoff: 270 },
  { id: 'accounting', name: 'Accounting', icon: '📊', cutoff: 250 },
  { id: 'business_admin', name: 'Business Administration', icon: '💼', cutoff: 240 },
  { id: 'economics', name: 'Economics', icon: '📈', cutoff: 260 },
  { id: 'psychology', name: 'Psychology', icon: '🧠', cutoff: 270 },
  { id: 'mass_comm', name: 'Mass Communication', icon: '📺', cutoff: 250 },
];

export const CourseSelectionScreen: React.FC<CourseSelectionScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { selectedSubjects } = route.params;
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [customCourse, setCustomCourse] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourse(courseId);
    setShowCustomInput(false);
    setCustomCourse('');
  };

  const handleCustomCourse = () => {
    setShowCustomInput(true);
    setSelectedCourse('custom');
  };

  const handleContinue = () => {
    const aspiringCourse = selectedCourse === 'custom' ? customCourse : 
      POPULAR_COURSES.find(c => c.id === selectedCourse)?.name || '';
    
    if (!aspiringCourse) {
      return;
    }

    const suggestedScore = selectedCourse === 'custom' ? 300 :
      POPULAR_COURSES.find(c => c.id === selectedCourse)?.cutoff || 300;

    navigation.navigate('GoalSetting', { 
      selectedSubjects, 
      aspiringCourse,
      suggestedScore
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1, padding: 24 }}>
        {/* Header */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 }}>
            What's Your Dream Course?
          </Text>
          <Text style={{ fontSize: 16, color: '#6B7280', lineHeight: 24 }}>
            This helps us understand your target score and create the perfect study plan for you.
          </Text>
        </View>

        {/* Course Grid */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {POPULAR_COURSES.map((course) => {
              const isSelected = selectedCourse === course.id;
              
              return (
                <TouchableOpacity
                  key={course.id}
                  onPress={() => handleCourseSelect(course.id)}
                  style={{
                    flexBasis: '47%',
                    backgroundColor: isSelected ? '#EFF6FF' : 'white',
                    borderWidth: 2,
                    borderColor: isSelected ? '#3B82F6' : '#E5E7EB',
                    borderRadius: 12,
                    padding: 16,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ fontSize: 32, marginBottom: 8 }}>
                    {course.icon}
                  </Text>
                  <Text style={{ 
                    fontSize: 14, 
                    fontWeight: '600', 
                    color: isSelected ? '#1E40AF' : '#374151',
                    textAlign: 'center',
                    marginBottom: 4
                  }}>
                    {course.name}
                  </Text>
                  <Text style={{ 
                    fontSize: 12, 
                    color: '#9CA3AF',
                    textAlign: 'center'
                  }}>
                    Cutoff: {course.cutoff}+
                  </Text>
                </TouchableOpacity>
              );
            })}
            
            {/* Custom Course Option */}
            <TouchableOpacity
              onPress={handleCustomCourse}
              style={{
                flexBasis: '47%',
                backgroundColor: selectedCourse === 'custom' ? '#EFF6FF' : 'white',
                borderWidth: 2,
                borderColor: selectedCourse === 'custom' ? '#3B82F6' : '#E5E7EB',
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
                borderStyle: 'dashed'
              }}
            >
              <Text style={{ fontSize: 32, marginBottom: 8 }}>➕</Text>
              <Text style={{ 
                fontSize: 14, 
                fontWeight: '600', 
                color: selectedCourse === 'custom' ? '#1E40AF' : '#374151',
                textAlign: 'center'
              }}>
                Other Course
              </Text>
            </TouchableOpacity>
          </View>

          {/* Custom Course Input */}
          {showCustomInput && (
            <View style={{ marginTop: 24 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                Enter Your Course
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#D1D5DB',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  backgroundColor: 'white'
                }}
                placeholder="e.g., Architecture, Biochemistry..."
                value={customCourse}
                onChangeText={setCustomCourse}
                autoFocus
              />
            </View>
          )}
        </ScrollView>

        {/* Navigation */}
        <View style={{ flexDirection: 'row', gap: 12, paddingTop: 16 }}>
          <Button
            title="Back"
            onPress={() => navigation.goBack()}
            variant="outline"
            style={{ flex: 1 }}
          />
          <Button
            title="Continue"
            onPress={handleContinue}
            disabled={!selectedCourse || (selectedCourse === 'custom' && !customCourse.trim())}
            style={{ flex: 2 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};
