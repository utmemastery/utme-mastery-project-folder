import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { styles } from '../../styles/login';

interface FooterLinksProps {
  navigation: StackScreenProps<AuthStackParamList, 'Login'>['navigation'];
}

export const FooterLinks: React.FC<FooterLinksProps> = ({ navigation }) => (
  <View style={styles.footerContainer}>
    <TouchableOpacity
      onPress={() => navigation.navigate('Register')}
      style={styles.signUpButton}
      accessibilityLabel="Sign Up"
      accessibilityRole="button"
    >
      <Text style={styles.signUpText}>
        Don't have an account?{' '}
        <Text style={styles.signUpLink}>Sign Up 🚀</Text>
      </Text>
    </TouchableOpacity>
  </View>
);