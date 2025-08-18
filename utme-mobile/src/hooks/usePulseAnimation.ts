import { useEffect, useState } from 'react';
import { Animated } from 'react-native';

export const usePulseAnimation = () => {
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    const pulseAnimation = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => pulseAnimation());
    };
    pulseAnimation();
  }, [pulseAnim]);

  return { pulseAnim };
};