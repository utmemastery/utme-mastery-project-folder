import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../../styles/login';

interface HeaderProps {
  title: string;
  subtitle: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => (
  <View style={styles.headerContainer}>
    <View style={styles.logoContainer}>
      <Text style={styles.logo}>🎓</Text>
    </View>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.subtitle}>{subtitle}</Text>
  </View>
);