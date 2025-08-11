// mobile/src/screens/onboarding/WelcomeScreen.tsx
import React from 'react';
import { View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';

interface WelcomeScreenProps {
  navigation: any;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1, padding: 24 }}>
        {/* Hero Section */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{
            width: 120,
            height: 120,
            backgroundColor: '#3B82F6',
            borderRadius: 60,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 32
          }}>
            <Text style={{ fontSize: 48, color: 'white' }}>🎯</Text>
          </View>
          
          <Text style={{ 
            fontSize: 32, 
            fontWeight: 'bold', 
            color: '#1F2937', 
            textAlign: 'center',
            marginBottom: 16 
          }}>
            Welcome to{'\n'}UTME Mastery
          </Text>
          
          <Text style={{ 
            fontSize: 18, 
            color: '#6B7280', 
            textAlign: 'center',
            lineHeight: 26,
            marginBottom: 48,
            paddingHorizontal: 24
          }}>
            Your AI-powered companion for achieving{'\n'}99th percentile UTME scores
          </Text>

          {/* Feature Highlights */}
          <View style={{ width: '100%', marginBottom: 48 }}>
            {[
              { icon: '🧠', title: 'AI-Powered Learning', desc: 'Personalized study plans' },
              { icon: '📊', title: 'Real-Time Analytics', desc: 'Track your progress' },
              { icon: '🎮', title: 'Gamified Experience', desc: 'Make learning fun' }
            ].map((feature, index) => (
              <View key={index} style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                marginBottom: 16,
                paddingHorizontal: 16 
              }}>
                <Text style={{ fontSize: 24, marginRight: 16 }}>{feature.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>
                    {feature.title}
                  </Text>
                  <Text style={{ fontSize: 14, color: '#6B7280' }}>
                    {feature.desc}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* CTA */}
        <View style={{ paddingBottom: 32 }}>
          <Button
            title="Let's Get Started"
            onPress={() => navigation.navigate('SubjectSelection')}
            size="large"
            style={{ marginBottom: 16 }}
          />
          
          <Text style={{ 
            textAlign: 'center', 
            fontSize: 14, 
            color: '#6B7280',
            lineHeight: 20 
          }}>
            Complete setup in just 3 minutes to get{'\n'}your personalized study plan
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};