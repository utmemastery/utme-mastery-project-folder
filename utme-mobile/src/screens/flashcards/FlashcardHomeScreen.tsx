// mobile/src/screens/flashcards/FlashcardHomeScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFlashcardStore } from '../../stores/flashcardStore';
import { Button } from '../../components/ui/Button';

interface FlashcardHomeScreenProps {
  navigation: any;
}

export const FlashcardHomeScreen: React.FC<FlashcardHomeScreenProps> = ({ navigation }) => {
  const { 
    flashcards, 
    isLoading, 
    error, 
    fetchFlashcardsForReview, 
    reviewStats 
  } = useFlashcardStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = async () => {
    try {
      await fetchFlashcardsForReview();
    } catch (err) {
      Alert.alert('Error', 'Failed to load flashcards');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFlashcards();
    setRefreshing(false);
  };

  const startReviewSession = () => {
    if (flashcards.length === 0) {
      Alert.alert('No Cards', 'No flashcards are due for review right now!');
      return;
    }
    navigation.navigate('FlashcardReview');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScrollView 
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={{ padding: 24 }}>
          {/* Header */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 }}>
              Flashcards
            </Text>
            <Text style={{ fontSize: 16, color: '#6B7280' }}>
              Master concepts with spaced repetition
            </Text>
          </View>

          {/* Review Stats */}
          <View style={{ 
            backgroundColor: 'white', 
            borderRadius: 16, 
            padding: 20,
            marginBottom: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 2
          }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 16 }}>
              Review Status
            </Text>
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
              <ReviewStatCard
                title="Due Today"
                value={flashcards?.length?.toString() || '0'}
                color="#EF4444"
                icon="⏰"
              />
              <ReviewStatCard
                title="New Cards"
                value={reviewStats?.newCards?.toString() || '0'}
                color="#3B82F6"
                icon="✨"
              />
              <ReviewStatCard
                title="Mastered"
                value={reviewStats?.masteredCards?.toString() || '0'}
                color="#10B981"
                icon="✅"
              />
              <ReviewStatCard
                title="Learning"
                value={reviewStats?.learningCards?.toString() || '0'}
                color="#F59E0B"
                icon="📚"
              />
            </View>
          </View>

          {/* Quick Actions */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 16 }}>
              Quick Actions
            </Text>
            
            <View style={{ gap: 12 }}>
              <TouchableOpacity
                onPress={startReviewSession}
                disabled={flashcards.length === 0}
                style={{
                  backgroundColor: flashcards.length > 0 ? '#3B82F6' : '#D1D5DB',
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Text style={{ fontSize: 20, marginRight: 12 }}>🎯</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: '600', 
                    color: 'white',
                    marginBottom: 2
                  }}>
                    Start Review Session
                  </Text>
                  <Text style={{ fontSize: 14, color: '#BFDBFE' }}>
                    {flashcards.length} cards ready for review
                  </Text>
                </View>
                <Text style={{ color: '#BFDBFE', fontSize: 18 }}>→</Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('CreateFlashcard')}
                  style={{
                    flex: 1,
                    backgroundColor: 'white',
                    borderRadius: 12,
                    padding: 16,
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: '#E5E7EB'
                  }}
                >
                  <Text style={{ fontSize: 24, marginBottom: 8 }}>➕</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
                    Create Card
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate('FlashcardLibrary')}
                  style={{
                    flex: 1,
                    backgroundColor: 'white',
                    borderRadius: 12,
                    padding: 16,
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: '#E5E7EB'
                  }}
                >
                  <Text style={{ fontSize: 24, marginBottom: 8 }}>📚</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
                    Browse Library
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Recent Activity */}
          {reviewStats?.recentSessions && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 16 }}>
                Recent Sessions
              </Text>
              
              <View style={{ gap: 12 }}>
                {reviewStats.recentSessions.slice(0, 3).map((session: any, index: number) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: 12,
                      padding: 16,
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                  >
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#F3F4F6',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12
                    }}>
                      <Text style={{ fontSize: 18 }}>📖</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '500', color: '#1F2937' }}>
                        {session.cardsReviewed} cards reviewed
                      </Text>
                      <Text style={{ fontSize: 12, color: '#6B7280' }}>
                        {session.accuracy}% accuracy • {formatRelativeTime(session.date)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper function
const formatRelativeTime = (date: string | Date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInHours = (now.getTime() - past.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return `${Math.floor(diffInDays / 7)}w ago`;
};