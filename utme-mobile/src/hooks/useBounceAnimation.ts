import { useEffect, useState } from 'react';
import { Animated } from 'react-native';

export const useBounceAnimation = () => {
  const [bounceAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    const bounceAnimation = () => {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]).start(() => bounceAnimation());
    };
    bounceAnimation();
  }, [bounceAnim]);

  return { bounceAnim };
};