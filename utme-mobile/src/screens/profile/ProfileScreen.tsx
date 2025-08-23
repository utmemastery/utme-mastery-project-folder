import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
  RefreshControl,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuthStore } from '../../stores/authStore';
import { useProfileStore } from '../../stores/profileStore';
import { globalStyles } from '../../styles/global';
import { COLORS, LAYOUT, SIZES } from '../../constants';
import { Button } from '../../components/ui/Button';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const { 
    profile, 
    stats, 
    isLoading, 
    error, 
    fetchProfile, 
    fetchProfileStats,
    updateProfileImage,
    updateStudyPreferences,
    deleteAccount,
    exportData,
    clearError
  } = useProfileStore();

  const [refreshing, setRefreshing] = useState(false);
  const [studyRemindersEnabled, setStudyRemindersEnabled] = useState(profile?.studyReminders ?? true);

  useEffect(() => {
    fetchProfile();
    fetchProfileStats();
  }, []);

  useEffect(() => {
    setStudyRemindersEnabled(profile?.studyReminders ?? true);
  }, [profile?.studyReminders]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchProfile(), fetchProfileStats()]);
    } catch {
      Alert.alert('Error', 'Failed to refresh data. Please check your connection.');
    }
    setRefreshing(false);
  };

  const handleImagePicker = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 400,
        maxHeight: 400
      },
      (response) => {
        if (response.assets && response.assets[0]) {
          const imageUri = response.assets[0].uri;
          if (imageUri) {
            updateProfileImage(imageUri).catch(() => {
              Alert.alert('Error', 'Failed to update profile image.');
            });
          }
        }
      }
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: logout 
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              navigation.replace('Login');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleExportData = async () => {
    try {
      await exportData();
      Alert.alert('Success', 'Your data has been exported and sent to your email.');
    } catch (error) {
      Alert.alert('Error', 'Failed to export data. Please try again.');
    }
  };

  const toggleStudyReminders = async (value: boolean) => {
    try {
      setStudyRemindersEnabled(value);
      await updateStudyPreferences({
        studyReminders: value,
        preferredStudyTime: profile?.preferredStudyTime
      });
    } catch (error) {
      setStudyRemindersEnabled(!value); // Revert on error
      Alert.alert('Error', 'Failed to update study reminders.');
    }
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
          <View style={{ marginBottom: 32 }}>
            <Text style={[globalStyles.sectionHeader, { marginBottom: 8 }]}>
              Profile
            </Text>
            <Text style={globalStyles.text}>
              Manage your account and preferences
            </Text>
          </View>

          {error && (
            <View style={[globalStyles.errorContainer, { marginBottom: 24 }]}>
              <Text style={globalStyles.errorText}>{error}</Text>
              <TouchableOpacity onPress={clearError}>
                <Text style={[globalStyles.text, { color: COLORS.primary, marginTop: 8 }]}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={[globalStyles.cardContainer, { marginBottom: 24 }]}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <TouchableOpacity onPress={handleImagePicker} style={{ position: 'relative' }}>
                <View style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: COLORS.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                  overflow: 'hidden'
                }}>
                  {profile?.profileImage ? (
                    <Image 
                      source={{ uri: profile.profileImage }} 
                      style={{ width: '100%', height: '100%' }}
                    />
                  ) : (
                    <Text style={{ fontSize: 36, color: COLORS.white, fontWeight: 'bold' }}>
                      {profile?.firstName?.charAt(0) || 'U'}
                    </Text>
                  )}
                </View>
                <View style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: COLORS.success,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Text style={{ color: COLORS.white, fontSize: 16 }}>📷</Text>
                </View>
              </TouchableOpacity>
              
              <Text style={[globalStyles.sectionHeader, { marginTop: 12, fontSize: SIZES.xLargeText }]}>
                {profile?.firstName || ''} {profile?.lastName || ''}
              </Text>
              <Text style={globalStyles.text}>
                {profile?.email || ''}
              </Text>
              {profile?.phone && (
                <Text style={[globalStyles.text, { marginTop: 4 }]}>
                  {profile.phone}
                </Text>
              )}
              {profile?.dateOfBirth && (
                <Text style={[globalStyles.text, { marginTop: 4 }]}>
                  DOB: {new Date(profile.dateOfBirth).toLocaleDateString()}
                </Text>
              )}
              {profile?.state && (
                <Text style={[globalStyles.text, { marginTop: 4 }]}>
                  State: {profile.state}
                </Text>
              )}
              {profile?.school && (
                <Text style={[globalStyles.text, { marginTop: 4 }]}>
                  School: {profile.school}
                </Text>
              )}
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={[globalStyles.sectionHeader, { fontSize: SIZES.mediumText, marginBottom: 8 }]}>
                Study Preferences
              </Text>
              {profile?.preferredStudyTime && (
                <Text style={[globalStyles.text, { marginBottom: 8 }]}>
                  Preferred Study Time: {new Date(profile.preferredStudyTime).toLocaleTimeString()}
                </Text>
              )}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={globalStyles.text}>
                  Study Reminders
                </Text>
                <Switch
                  value={studyRemindersEnabled}
                  onValueChange={toggleStudyReminders}
                  trackColor={{ false: COLORS.disabled, true: COLORS.primary }}
                  thumbColor={studyRemindersEnabled ? COLORS.white : '#f4f3f4'}
                />
              </View>
              {profile?.examYear && (
                <Text style={[globalStyles.text, { marginTop: 8 }]}>
                  Exam Year: {profile.examYear}
                </Text>
              )}
            </View>

            {stats && (
              <View style={{ marginBottom: 20 }}>
                <Text style={[globalStyles.sectionHeader, { fontSize: SIZES.mediumText, marginBottom: 8 }]}>
                  Statistics
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={globalStyles.text}>Total Questions</Text>
                  <Text style={[globalStyles.text, { color: COLORS.textPrimary }]}>{stats.totalQuestions}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={globalStyles.text}>Correct Answers</Text>
                  <Text style={[globalStyles.text, { color: COLORS.textPrimary }]}>{stats.correctAnswers}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={globalStyles.text}>Study Streak</Text>
                  <Text style={[globalStyles.text, { color: COLORS.textPrimary }]}>{stats.studyStreak} days</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={globalStyles.text}>Total Study Time</Text>
                  <Text style={[globalStyles.text, { color: COLORS.textPrimary }]}>{stats.totalStudyTime} mins</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={globalStyles.text}>Average Score</Text>
                  <Text style={[globalStyles.text, { color: COLORS.textPrimary }]}>{stats.averageScore}%</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={globalStyles.text}>Strongest Subject</Text>
                  <Text style={[globalStyles.text, { color: COLORS.textPrimary }]}>{stats.strongestSubject || 'N/A'}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={globalStyles.text}>Weakest Subject</Text>
                  <Text style={[globalStyles.text, { color: COLORS.textPrimary }]}>{stats.weakestSubject || 'N/A'}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={globalStyles.text}>Last Active</Text>
                  <Text style={[globalStyles.text, { color: COLORS.textPrimary }]}>
                    {stats.lastActiveDate ? new Date(stats.lastActiveDate).toLocaleDateString() : 'N/A'}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <Button
            title="Edit Profile"
            size='large'
            onPress={() => navigation.navigate('EditProfile')}
            style={{ marginBottom: 16, justifyContent: 'center', alignItems: 'center' }}
          />

          <Button
            title="Export My Data"
            size='large'
            onPress={handleExportData}
            style={{ marginBottom: 16, justifyContent: 'center', alignItems: 'center' }}
            variant="primary"
            leftIcon="📤"
          />

          <Button
            title="Delete Account"
            size='large'
            onPress={handleDeleteAccount}
            style={{ marginBottom: 16, backgroundColor: COLORS.error, justifyContent: 'center', alignItems: 'center'  }}
            variant="primary"
            leftIcon="🗑️"
          />

          <Button
            title="Logout"
            size='large'
            onPress={handleLogout}
            style={{ backgroundColor: COLORS.textSecondary, justifyContent: 'center', alignItems: 'center'  }}
            variant="primary"
            leftIcon="🚪"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
    </View>
  );
};


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