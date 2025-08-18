import { useEffect, useState } from 'react';
import { Animated } from 'react-native';

export const useRotateAnimation = () => {
  const [rotateAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const rotateAnimation = () => {
      rotateAnim.setValue(0);
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }).start(() => rotateAnimation());
    };
    rotateAnimation();
  }, [rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return { spin };
};