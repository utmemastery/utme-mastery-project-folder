import React from 'react';
import { View } from 'react-native';
import { styles } from '../../styles/login';

export const BackgroundDecorations: React.FC = () => (
  <>
    <View style={styles.background} />
    <View style={styles.orbTop} />
    <View style={styles.orbBottom} />
  </>
);