import { useState, useEffect } from 'react';
import { Animated } from 'react-native';
import { ANIMATIONS } from '../constants';

export const useScreenAnimation = () => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(ANIMATIONS.slideDistance));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: ANIMATIONS.fadeDuration,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: ANIMATIONS.slideDuration,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return { fadeAnim, slideAnim };
};