// mobile/src/screens/flashcards/FlashcardReviewScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFlashcardStore } from '../../stores/flashcardStore';

interface FlashcardReviewScreenProps {
  navigation: any;
}

export const FlashcardReviewScreen: React.FC<FlashcardReviewScreenProps> = ({ navigation }) => {
  const { 
    flashcards, 
    currentCardIndex, 
    submitFlashcardAttempt,
    nextCard
  } = useFlashcardStore();
  
  const [isFlipped, setIsFlipped] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [flipAnimation] = useState(new Animated.Value(0));
  const [swipeAnimation] = useState(new Animated.Value(0));

  const currentCard = flashcards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / flashcards.length) * 100;

  useEffect(() => {
    setStartTime(Date.now());
    setIsFlipped(false);
    flipAnimation.setValue(0);
    swipeAnimation.setValue(0);
  }, [currentCardIndex]);

  const handleFlip = () => {
    Animated.spring(flipAnimation, {
      toValue: isFlipped ? 0 : 1,
      useNativeDriver: true
    }).start();
    setIsFlipped(!isFlipped);
  };

  const handleResponse = async (response: 'again' | 'hard' | 'good' | 'easy') => {
    if (!isFlipped || !currentCard) return;

    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    
    try {
      await submitFlashcardAttempt({
        flashcardId: currentCard.id,
        response,
        timeSpent
      });

      // Animate card away
      Animated.timing(swipeAnimation, {
        toValue: response === 'again' ? -300 : 300,
        duration: 300,
        useNativeDriver: true
      }).start(() => {
        if (currentCardIndex < flashcards.length - 1) {
          nextCard();
        } else {
          // Review session complete
          navigation.navigate('FlashcardResults');
        }
      });
    } catch (error) {
      console.error('Failed to submit flashcard attempt:', error);
    }
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg']
  });

  if (!currentCard) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, color: '#6B7280' }}>No cards to review</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: 24,
          paddingBottom: 16
        }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ fontSize: 16, color: '#EF4444' }}>✕</Text>
          </TouchableOpacity>
          
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>
              {currentCardIndex + 1} of {flashcards.length}
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>
              {currentCard.subject} • {currentCard.topic}
            </Text>
          </View>
          
          <View style={{ width: 20 }} />
        </View>

        {/* Progress Bar */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <View style={{ 
            height: 4, 
            backgroundColor: '#E5E7EB', 
            borderRadius: 2, 
            overflow: 'hidden' 
          }}>
            <View style={{ 
              height: '100%', 
              backgroundColor: '#3B82F6',
              width: `${progress}%`
            }} />
          </View>
        </View>

        {/* Flashcard */}
        <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center' }}>
          <Animated.View style={{
            transform: [{ translateX: swipeAnimation }]
          }}>
            <TouchableOpacity onPress={handleFlip} activeOpacity={0.8}>
              <View style={{ height: 400, position: 'relative' }}>
                {/* Front of card */}
                <Animated.View style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'white',
                  borderRadius: 16,
                  padding: 24,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 6,
                  elevation: 4,
                  backfaceVisibility: 'hidden',
                  transform: [{ rotateY: frontInterpolate }]
                }}>
                  <Text style={{ 
                    fontSize: 20, 
                    color: '#1F2937', 
                    textAlign: 'center',
                    lineHeight: 28
                  }}>
                    {currentCard.front}
                  </Text>
                  
                  {!isFlipped && (
                    <View style={{ position: 'absolute', bottom: 24 }}>
                      <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center' }}>
                        Tap to reveal answer
                      </Text>
                    </View>
                  )}
                </Animated.View>

                {/* Back of card */}
                <Animated.View style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#F3F4F6',
                  borderRadius: 16,
                  padding: 24,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 6,
                  elevation: 4,
                  backfaceVisibility: 'hidden',
                  transform: [{ rotateY: backInterpolate }]
                }}>
                  <Text style={{ 
                    fontSize: 18, 
                    color: '#374151', 
                    textAlign: 'center',
                    lineHeight: 26,
                    marginBottom: 16
                  }}>
                    {currentCard.back}
                  </Text>
                  
                  {currentCard.tags && currentCard.tags.length > 0 && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                      {currentCard.tags.map((tag: string, index: number) => (
                        <View key={index} style={{
                          backgroundColor: '#E5E7EB',
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 12
                        }}>
                          <Text style={{ fontSize: 12, color: '#6B7280' }}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </Animated.View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Response Buttons */}
        {isFlipped && (
          <View style={{ padding: 24 }}>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: '600', 
              color: '#374151', 
              textAlign: 'center',
              marginBottom: 16 
            }}>
              How well did you know this?
            </Text>
            
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <ResponseButton
                title="Again"
                subtitle="< 1 day"
                color="#EF4444"
                onPress={() => handleResponse('again')}
              />
              <ResponseButton
                title="Hard"
                subtitle="< 6 days"
                color="#F59E0B"
                onPress={() => handleResponse('hard')}
              />
              <ResponseButton
                title="Good"
                subtitle="< 2 weeks"
                color="#3B82F6"
                onPress={() => handleResponse('good')}
              />
              <ResponseButton
                title="Easy"
                subtitle="< 1 month"
                color="#10B981"
                onPress={() => handleResponse('easy')}
              />
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

// Response Button Component
interface ResponseButtonProps {
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
}

const ResponseButton: React.FC<ResponseButtonProps> = ({ title, subtitle, color, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      flex: 1,
      backgroundColor: color,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 8,
      alignItems: 'center'
    }}
  >
    <Text style={{ 
      fontSize: 14, 
      fontWeight: '600', 
      color: 'white',
      marginBottom: 2
    }}>
      {title}
    </Text>
    <Text style={{ 
      fontSize: 11, 
      color: 'rgba(255, 255, 255, 0.8)'
    }}>
      {subtitle}
    </Text>
  </TouchableOpacity>
);

