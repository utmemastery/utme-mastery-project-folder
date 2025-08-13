import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStudyPlanStore } from '../../stores/studyPlanStore';
import { useNavigation } from '@react-navigation/native';

interface StudyPlanScreenProps {
  navigation: any;
}

const StudyPlanScreen: React.FC<StudyPlanScreenProps> = ({ navigation }) => {
  const { 
    studyPlan, 
    weekPlan, 
    isLoading, 
    error, 
    fetchStudyPlan, 
    updateTaskStatus,
    regenerateStudyPlan,
    clearError 
  } = useStudyPlanStore();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStudyPlan();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchStudyPlan();
    } catch {
      Alert.alert('Error', 'Failed to refresh study plan. Please check your connection.');
    }
    setRefreshing(false);
  };

  const handleRegeneratePlan = async () => {
    Alert.alert(
      'Regenerate Study Plan',
      'This will replace your current study plan for today. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          style: 'default',
          onPress: async () => {
            try {
              await regenerateStudyPlan();
            } catch {
              Alert.alert('Error', 'Failed to regenerate study plan.');
            }
          }
        }
      ]
    );
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Note: weekPlan fetching not implemented in store; assuming studyPlan is for selected date
  };

  const handleTaskPress = (task: any) => {
    if (task.status === 'COMPLETED') return;

    const navigationMap: { [key: string]: string } = {
      PRACTICE: 'Practice',
      FLASHCARDS: 'Flashcards',
      MOCK_EXAM: 'MockExam',
      WEAK_TOPIC: 'Practice'
    };

    const screen = navigationMap[task.type];
    
    if (screen && task.subject && task.topic) {
      navigation.navigate(screen, {
        subject: task.subject,
        topic: task.topic
      });
    } else {
      Alert.alert('Error', 'Cannot navigate: Subject or topic missing.');
    }
  };

  const toggleTaskStatus = async (taskId: number) => {
    try {
      const task = studyPlan?.tasks.find(t => t.id === taskId);
      if (!task) return;

      const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      await updateTaskStatus(taskId, newStatus);
    } catch (error) {
      Alert.alert('Error', 'Failed to update task status.');
    }
  };

  const renderTask = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={() => handleTaskPress(item)}
      disabled={item.status === 'COMPLETED'}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.taskTitle}>{item.title}</Text>
          <Text style={styles.taskDescription}>{item.description}</Text>
          <Text style={styles.taskDetails}>
            {item.subject || 'General'} • {item.topic || 'N/A'} • {item.estimatedTime} mins
          </Text>
          <Text style={styles.taskPriority}>Priority: {item.priority}</Text>
        </View>
        <TouchableOpacity
          style={item.status === 'COMPLETED' ? styles.completedButton : styles.pendingButton}
          onPress={() => toggleTaskStatus(item.id)}
        >
          <Text style={styles.buttonText}>
            {item.status === 'COMPLETED' ? '✓ Completed' : 'Mark Complete'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderDateTab = (date: Date, index: number) => {
    const isSelected = selectedDate.toDateString() === date.toDateString();
    return (
      <TouchableOpacity
        key={index}
        style={[styles.dateTab, isSelected && styles.selectedDateTab]}
        onPress={() => handleDateSelect(date)}
      >
        <Text style={[styles.dateText, isSelected && styles.selectedDateText]}>
          {date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
        </Text>
      </TouchableOpacity>
    );
  };

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - date.getDay() + i);
    return date;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Study Plan</Text>
          <Text style={styles.headerSubtitle}>Your personalized learning schedule</Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={clearError}>
              <Text style={styles.dismissText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.dateTabs}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {weekDates.map(renderDateTab)}
          </ScrollView>
        </View>

        <View style={styles.planSummary}>
          <Text style={styles.summaryTitle}>Today's Plan</Text>
          <Text style={styles.summaryText}>
            {studyPlan?.tasks.length || 0} tasks • {studyPlan?.totalEstimatedTime || 0} mins
          </Text>
          <Text style={styles.summaryText}>
            Completion: {studyPlan?.completionRate.toFixed(1) || 0}%
          </Text>
          <TouchableOpacity
            style={styles.regenerateButton}
            onPress={handleRegeneratePlan}
          >
            <Text style={styles.regenerateButtonText}>Regenerate Plan</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={studyPlan?.tasks || []}
          renderItem={renderTask}
          keyExtractor={item => item.id.toString()}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {isLoading ? 'Loading...' : 'No tasks for today'}
            </Text>
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  header: {
    padding: 24,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937'
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 8,
    margin: 24,
    marginBottom: 16
  },
  errorText: {
    color: '#DC2626',
    fontSize: 16
  },
  dismissText: {
    color: '#3B82F6',
    marginTop: 8,
    fontSize: 16
  },
  dateTabs: {
    paddingHorizontal: 16,
    marginVertical: 16
  },
  dateTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#E5E7EB'
  },
  selectedDateTab: {
    backgroundColor: '#3B82F6'
  },
  dateText: {
    fontSize: 16,
    color: '#1F2937'
  },
  selectedDateText: {
    color: 'white',
    fontWeight: '600'
  },
  planSummary: {
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8
  },
  summaryText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4
  },
  regenerateButton: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12
  },
  regenerateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  taskCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4
  },
  taskDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4
  },
  taskDetails: {
    fontSize: 14,
    color: '#9CA3AF'
  },
  taskPriority: {
    fontSize: 14,
    color: '#3B82F6',
    marginTop: 4
  },
  completedButton: {
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8
  },
  pendingButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 24
  }
});

export default StudyPlanScreen;