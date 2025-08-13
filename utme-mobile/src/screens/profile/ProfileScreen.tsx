// mobile/src/screens/ProfileScreen.tsx
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

  useEffect(() => {
    fetchProfile();
    fetchProfileStats();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchProfile(), fetchProfileStats()]);
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
            updateProfileImage(imageUri);
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
              // Navigation will be handled by auth state change
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
      const data = await exportData();
      Alert.alert('Success', 'Your data has been exported and sent to your email.');
    } catch (error) {
      Alert.alert('Error', 'Failed to export data. Please try again.');
    }
  };

  const toggleStudyReminders = async (value: boolean) => {
    try {
      await updateStudyPreferences({
        studyReminders: value,
        preferredStudyTime: profile?.preferredStudyTime
      });
    } catch (error) {
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
          {/* Header */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 }}>
              Profile
            </Text>
            <Text style={{ fontSize: 16, color: '#6B7280' }}>
              Manage your account and preferences
            </Text>
          </View>

          {/* Profile Card */}
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
                      {user?.firstName?.charAt(0) || 'U'}
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
                {profile?.firstName} {profile?.lastName}
              </Text>
              <Text style={{ fontSize: 16, color: '#6B7280' }}>
                {profile?.email}
              </Text>
            </View>

            {/* Quick Stats */}
            {stats && (
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-around',
                paddingTop: 20,
                borderTopWidth: 1,
                borderTopColor: '#E5E7EB'
              }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#3B82F6' }}>
                    {stats.studyStreak}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280' }}>Day Streak</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#10B981' }}>
                    {stats.averageScore}%
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280' }}>Avg Score</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#8B5CF6' }}>
                    {Math.round(stats.totalStudyTime / 3600)}h
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280' }}>Study Time</Text>
                </View>
              </View>
            )}
          </View>

          {/* Settings Sections */}
          <View style={{ gap: 16 }}>
            {/* Account Settings */}
            <SettingsSection title="Account Settings">
              <SettingsItem 
                icon="👤"
                title="Edit Profile"
                subtitle="Update your personal information"
                onPress={() => navigation.navigate('EditProfile')}
                showChevron
              />
              <SettingsItem 
                icon="🎯"
                title="Goal & Subjects"
                subtitle={`Goal: ${profile?.goalScore || 300} • ${profile?.selectedSubjects?.length || 0} subjects`}
                onPress={() => navigation.navigate('GoalSettings')}
                showChevron
              />
              <SettingsItem 
                icon="🔔"
                title="Study Reminders"
                subtitle="Get notified about your study schedule"
                rightElement={
                  <Switch
                    value={profile?.studyReminders || false}
                    onValueChange={toggleStudyReminders}
                    trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                    thumbColor={profile?.studyReminders ? 'white' : '#9CA3AF'}
                  />
                }
              />
            </SettingsSection>

            {/* Study Settings */}
            <SettingsSection title="Study Preferences">
              <SettingsItem 
                icon="📚"
                title="Study Plan"
                subtitle="Customize your learning path"
                onPress={() => navigation.navigate('StudyPlan')}
                showChevron
              />
              <SettingsItem 
                icon="📊"
                title="Performance Analytics"
                subtitle="Detailed insights into your progress"
                onPress={() => navigation.navigate('Analytics')}
                showChevron
              />
              <SettingsItem 
                icon="🎮"
                title="Practice Settings"
                subtitle="Configure practice sessions"
                onPress={() => navigation.navigate('PracticeSettings')}
                showChevron
              />
            </SettingsSection>

            {/* Data & Privacy */}
            <SettingsSection title="Data & Privacy">
              <SettingsItem 
                icon="📤"
                title="Export Data"
                subtitle="Download your study data"
                onPress={handleExportData}
                showChevron
              />
              <SettingsItem 
                icon="🔒"
                title="Privacy Policy"
                subtitle="Learn how we protect your data"
                onPress={() => navigation.navigate('PrivacyPolicy')}
                showChevron
              />
              <SettingsItem 
                icon="📋"
                title="Terms of Service"
                subtitle="Review our terms and conditions"
                onPress={() => navigation.navigate('TermsOfService')}
                showChevron
              />
            </SettingsSection>

            {/* Support */}
            <SettingsSection title="Support">
              <SettingsItem 
                icon="❓"
                title="Help & FAQ"
                subtitle="Get answers to common questions"
                onPress={() => navigation.navigate('Help')}
                showChevron
              />
              <SettingsItem 
                icon="📧"
                title="Contact Support"
                subtitle="Get help from our team"
                onPress={() => navigation.navigate('ContactSupport')}
                showChevron
              />
              <SettingsItem 
                icon="⭐"
                title="Rate the App"
                subtitle="Share your feedback"
                onPress={() => {/* Handle app rating */}}
                showChevron
              />
            </SettingsSection>

            {/* Account Actions */}
            <SettingsSection title="Account Actions">
              <SettingsItem 
                icon="🚪"
                title="Logout"
                subtitle="Sign out of your account"
                onPress={handleLogout}
                titleColor="#EF4444"
              />
              <SettingsItem 
                icon="🗑️"
                title="Delete Account"
                subtitle="Permanently delete your account"
                onPress={handleDeleteAccount}
                titleColor="#EF4444"
              />
            </SettingsSection>
          </View>

          {/* App Version */}
          <View style={{ alignItems: 'center', marginTop: 32, marginBottom: 16 }}>
            <Text style={{ fontSize: 12, color: '#9CA3AF' }}>
              UTME Prep App v1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Settings Section Component
interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => (
  <View>
    <Text style={{ 
      fontSize: 16, 
      fontWeight: '600', 
      color: '#374151', 
      marginBottom: 12,
      marginLeft: 4 
    }}>
      {title}
    </Text>
    <View style={{
      backgroundColor: 'white',
      borderRadius: 12,
      overflow: 'hidden'
    }}>
      {children}
    </View>
  </View>
);

// Settings Item Component
interface SettingsItemProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
  titleColor?: string;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  rightElement,
  showChevron = false,
  titleColor = '#1F2937'
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6'
    }}
    disabled={!onPress}
  >
    <Text style={{ fontSize: 20, marginRight: 12 }}>{icon}</Text>
    <View style={{ flex: 1 }}>
      <Text style={{ 
        fontSize: 16, 
        fontWeight: '500', 
        color: titleColor,
        marginBottom: 2 
      }}>
        {title}
      </Text>
      <Text style={{ fontSize: 14, color: '#6B7280' }}>
        {subtitle}
      </Text>
    </View>
    {rightElement || (showChevron && (
      <Text style={{ color: '#9CA3AF', fontSize: 16 }}>→</Text>
    ))}
  </TouchableOpacity>
);