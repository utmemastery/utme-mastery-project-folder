import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFlashcardStore } from '../../stores/flashcardStore';
import { Button } from '../../components/ui/Button';
import { globalStyles } from '../../styles/global';
import { COLORS, LAYOUT, SIZES } from '../../constants';

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
            <View style={styles.container}>
              <View style={styles.orbTop} />
              <View style={styles.orbBottom} />
              <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={{ padding: LAYOUT.padding }}>
          {/* Header */}
          <View style={{ marginBottom: 32 }}>
            <Text style={[globalStyles.sectionHeader, { marginBottom: 8 }]}>
              Flashcards
            </Text>
            <Text style={globalStyles.text}>
              Master concepts with spaced repetition
            </Text>
          </View>

          {/* Review Stats */}
          <View style={[globalStyles.cardContainer, { marginBottom: 24 }]}>
            <Text style={[globalStyles.sectionHeader, { fontSize: SIZES.mediumText, marginBottom: 16 }]}>
              Review Status
            </Text>
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
              <ReviewStatCard
                title="Due Today"
                value={flashcards?.length?.toString() || '0'}
                color={COLORS.error}
                icon="⏰"
              />
              <ReviewStatCard
                title="New Cards"
                value={reviewStats?.newCards?.toString() || '0'}
                color={COLORS.primary}
                icon="✨"
              />
              <ReviewStatCard
                title="Mastered"
                value={reviewStats?.masteredCards?.toString() || '0'}
                color={COLORS.success}
                icon="✅"
              />
              <ReviewStatCard
                title="Learning"
                value={reviewStats?.learningCards?.toString() || '0'}
                color={COLORS.warning}
                icon="📚"
              />
            </View>
          </View>

          {/* Quick Actions */}
          <View style={{ marginBottom: 24 }}>
            <Text style={[globalStyles.sectionHeader, { fontSize: SIZES.mediumText, marginBottom: 16 }]}>
              Quick Actions
            </Text>
            
            <View style={{ gap: 12 }}>
              <TouchableOpacity
                onPress={startReviewSession}
                disabled={flashcards.length === 0}
                style={[globalStyles.button, {
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: flashcards.length > 0 ? COLORS.primary : COLORS.disabled,
                  padding: SIZES.cardPadding
                }]}
              >
                <Text style={{ fontSize: SIZES.icon, marginRight: 12 }}>🎯</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[globalStyles.buttonText, { marginBottom: 2 }]}>
                    Start Review Session
                  </Text>
                  <Text style={[globalStyles.subText, { color: COLORS.textSecondary }]}>
                    {flashcards.length || 0} cards ready for review
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('CreateFlashcard')}
                  style={[globalStyles.cardContainer, {
                    flex: 1,
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: COLORS.progressBackground
                  }]}
                >
                  <Text style={{ fontSize: SIZES.icon, marginBottom: 8 }}>➕</Text>
                  <Text style={[globalStyles.buttonText, { color: COLORS.textPrimary }]}>
                    Create Card
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate('FlashcardLibrary')}
                  style={[globalStyles.cardContainer, {
                    flex: 1,
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: COLORS.progressBackground
                  }]}
                >
                  <Text style={{ fontSize: SIZES.icon, marginBottom: 8 }}>📚</Text>
                  <Text style={[globalStyles.buttonText, { color: COLORS.textPrimary }]}>
                    Browse Library
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Recent Activity */}
          {reviewStats?.recentSessions && (
            <View style={{ marginBottom: 24 }}>
              <Text style={[globalStyles.sectionHeader, { fontSize: SIZES.mediumText, marginBottom: 16 }]}>
                Recent Sessions
              </Text>
              
              <View style={{ gap: 12 }}>
                {reviewStats.recentSessions.slice(0, 3).map((session: any, index: number) => (
                  <View
                    key={index}
                    style={[globalStyles.cardContainer, {
                      flexDirection: 'row',
                      alignItems: 'center'
                    }]}
                  >
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: COLORS.progressBackground,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12
                    }}>
                      <Text style={{ fontSize: 18 }}>📖</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[globalStyles.text, { fontWeight: '500' }]}>
                        {session.cardsReviewed} cards reviewed
                      </Text>
                      <Text style={globalStyles.subText}>
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
            </View>
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

// Review Stat Card Component
interface ReviewStatCardProps {
  title: string;
  value: string;
  color: string;
  icon: string;
}

const ReviewStatCard: React.FC<ReviewStatCardProps> = ({ title, value, color, icon }) => (
  <View style={{ flex: 1, minWidth: '45%', alignItems: 'center' }}>
    <View style={{
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: `${color}20`,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8
    }}>
      <Text style={{ fontSize: 20 }}>{icon}</Text>
    </View>
    <Text style={[globalStyles.sectionHeader, { color, fontSize: SIZES.largeText, marginBottom: 2 }]}>
      {value}
    </Text>
    <Text style={[globalStyles.subText, { textAlign: 'center' }]}>
      {title}
    </Text>
  </View>
);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  orbTop: {
    position: 'absolute',
    top: LAYOUT.orbTopOffset,
    right: -0.25 * LAYOUT.orbTopSize,
    width: LAYOUT.orbTopSize,
    height: LAYOUT.orbTopSize,
    borderRadius: LAYOUT.orbTopSize / 2,
    backgroundColor: COLORS.orbBlue,
    transform: [{ rotate: '20deg' }],
  },
  orbBottom: {
    position: 'absolute',
    bottom: LAYOUT.orbBottomOffset,
    left: -0.2 * LAYOUT.orbBottomSize,
    width: LAYOUT.orbBottomSize,
    height: LAYOUT.orbBottomSize,
    borderRadius: LAYOUT.orbBottomSize / 2,
    backgroundColor: COLORS.orbGold,
    transform: [{ rotate: '-40deg' }],
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: LAYOUT.padding,
  },
  headerContainer: {
    marginTop: LAYOUT.headerMarginTop,
    marginBottom: 48,
    alignItems: 'center',
  }
});