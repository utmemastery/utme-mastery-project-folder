import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuthStore } from '../../stores/authStore';
import { useProfileStore } from '../../stores/profileStore';

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={{ padding: 24 }}>
          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 }}>
              Profile
            </Text>
            <Text style={{ fontSize: 16, color: '#6B7280' }}>
              Manage your account and preferences
            </Text>
          </View>

          {error && (
            <View style={{ 
              backgroundColor: '#FEE2E2', 
              padding: 16, 
              borderRadius: 8, 
              marginBottom: 24 
            }}>
              <Text style={{ color: '#DC2626' }}>{error}</Text>
              <TouchableOpacity onPress={clearError}>
                <Text style={{ color: '#3B82F6', marginTop: 8 }}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 24,
            marginBottom: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 2
          }}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <TouchableOpacity onPress={handleImagePicker} style={{ position: 'relative' }}>
                <View style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: '#3B82F6',
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
                    <Text style={{ fontSize: 36, color: 'white', fontWeight: 'bold' }}>
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
                  backgroundColor: '#10B981',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Text style={{ color: 'white', fontSize: 16 }}>📷</Text>
                </View>
              </TouchableOpacity>
              
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginTop: 12 }}>
                {profile?.firstName || ''} {profile?.lastName || ''}
              </Text>
              <Text style={{ fontSize: 16, color: '#6B7280' }}>
                {profile?.email || ''}
              </Text>
              {profile?.phone && (
                <Text style={{ fontSize: 16, color: '#6B7280', marginTop: 4 }}>
                  {profile.phone}
                </Text>
              )}
              {profile?.dateOfBirth && (
                <Text style={{ fontSize: 16, color: '#6B7280', marginTop: 4 }}>
                  DOB: {new Date(profile.dateOfBirth).toLocaleDateString()}
                </Text>
              )}
              {profile?.state && (
                <Text style={{ fontSize: 16, color: '#6B7280', marginTop: 4 }}>
                  State: {profile.state}
                </Text>
              )}
              {profile?.school && (
                <Text style={{ fontSize: 16, color: '#6B7280', marginTop: 4 }}>
                  School: {profile.school}
                </Text>
              )}
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 8 }}>
                Study Preferences
              </Text>
              {profile?.preferredStudyTime && (
                <Text style={{ fontSize: 16, color: '#6B7280', marginBottom: 8 }}>
                  Preferred Study Time: {new Date(profile.preferredStudyTime).toLocaleTimeString()}
                </Text>
              )}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, color: '#6B7280' }}>
                  Study Reminders
                </Text>
                <Switch
                  value={studyRemindersEnabled}
                  onValueChange={toggleStudyReminders}
                  trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                  thumbColor={studyRemindersEnabled ? '#ffffff' : '#f4f3f4'}
                />
              </View>
              {profile?.examYear && (
                <Text style={{ fontSize: 16, color: '#6B7280', marginTop: 8 }}>
                  Exam Year: {profile.examYear}
                </Text>
              )}
            </View>

            {stats && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 8 }}>
                  Statistics
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 16, color: '#6B7280' }}>Total Questions</Text>
                  <Text style={{ fontSize: 16, color: '#1F2937' }}>{stats.totalQuestions}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 16, color: '#6B7280' }}>Correct Answers</Text>
                  <Text style={{ fontSize: 16, color: '#1F2937' }}>{stats.correctAnswers}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 16, color: '#6B7280' }}>Study Streak</Text>
                  <Text style={{ fontSize: 16, color: '#1F2937' }}>{stats.studyStreak} days</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 16, color: '#6B7280' }}>Total Study Time</Text>
                  <Text style={{ fontSize: 16, color: '#1F2937' }}>{stats.totalStudyTime} mins</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 16, color: '#6B7280' }}>Average Score</Text>
                  <Text style={{ fontSize: 16, color: '#1F2937' }}>{stats.averageScore}%</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 16, color: '#6B7280' }}>Strongest Subject</Text>
                  <Text style={{ fontSize: 16, color: '#1F2937' }}>{stats.strongestSubject || 'N/A'}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 16, color: '#6B7280' }}>Weakest Subject</Text>
                  <Text style={{ fontSize: 16, color: '#1F2937' }}>{stats.weakestSubject || 'N/A'}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 16, color: '#6B7280' }}>Last Active</Text>
                  <Text style={{ fontSize: 16, color: '#1F2937' }}>
                    {stats.lastActiveDate ? new Date(stats.lastActiveDate).toLocaleDateString() : 'N/A'}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: '#3B82F6',
              padding: 16,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: 16
            }}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
              Edit Profile
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#10B981',
              padding: 16,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: 16
            }}
            onPress={handleExportData}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
              Export My Data
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#EF4444',
              padding: 16,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: 16
            }}
            onPress={handleDeleteAccount}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
              Delete Account
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#6B7280',
              padding: 16,
              borderRadius: 8,
              alignItems: 'center'
            }}
            onPress={handleLogout}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};