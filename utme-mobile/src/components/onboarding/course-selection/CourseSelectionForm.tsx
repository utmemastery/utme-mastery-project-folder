import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Input } from '../../../components/ui/Input';
import { globalStyles } from '../../../styles/global';
import { COLORS, SIZES } from '../../../constants';

interface CourseSelectionFormProps {
  customCourse: string;
  setCustomCourse: (value: string) => void;
}

export const CourseSelectionForm: React.FC<CourseSelectionFormProps> = ({ customCourse, setCustomCourse }) => (
  <View style={styles.formContainer}>
    <Text style={[globalStyles.text, styles.label]}>Enter Your Course</Text>
    <Input
      placeholder="e.g., Architecture, Biochemistry..."
      value={customCourse}
      onChangeText={setCustomCourse}
      style={globalStyles.input}
      inputStyle={globalStyles.inputText}
      labelStyle={globalStyles.label}
      accessibilityLabel="Custom course input"
      accessibilityRole="text"
      autoFocus
    />
  </View>
);

const styles = StyleSheet.create({
  formContainer: {
    marginTop: 24,
    marginBottom: 24,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
  },
});