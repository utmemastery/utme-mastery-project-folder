// mobile/src/screens/study/StudyPlanScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStudyPlanStore } from '../../stores/studyPlanStore';

interface StudyPlanScreenProps {
  navigation: any;
}

export const StudyPlanScreen: React.FC<StudyPlanScreenProps> = ({ navigation }) => {
  const { 
    studyPlan, 
    isLoading, 
    fetchStudyPlan, 
    updateTaskStatus,
    weekPlan 
  } = useStudyPlanStore();
  
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchStudyPlan();
  }, []);

  const getWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const handleTaskPress = (task: any) => {
    switch (task.type) {
      case 'practice':
        navigation.navigate('Practice', { 
          subject: task.subject,
          topic: task.topic 
        });
        break;
      case 'flashcards':
        navigation.navigate('Flashcards');
        break;
      case 'mock_exam':
        navigation.navigate('MockExam');
        break;
      case 'weak_topic':
        navigation.navigate('Practice', { 
          subject: task.subject,
          topic: task.topic,
          focusMode: true 
        });
        break;
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const weekDates = getWeekDates();
  const todaysPlan = studyPlan;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 24 }}>
          {/* Header */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 }}>
              Study Plan
            </Text>
            <Text style={{ fontSize: 16, color: '#6B7280' }}>
              Your personalized learning schedule
            </Text>
          </View>

          {/* Week Calendar */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 16 }}>
              This Week
            </Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {weekDates.map((date, index) => {
                  const isSelected = date.toDateString() === selectedDate.toDateString();
                  const isTodayDate = isToday(date);
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedDate(date)}
                      style={{
                        backgroundColor: isSelected ? '#3B82F6' : isTodayDate ? '#EFF6FF' : 'white',
                        borderRadius: 12,
                        padding: 16,
                        minWidth: 80,
                        alignItems: 'center',
                        borderWidth: isTodayDate && !isSelected ? 2 : 0,
                        borderColor: '#3B82F6'
                      }}
                    >
                      <Text style={{ 
                        fontSize: 12, 
                        color: isSelected ? 'white' : '#6B7280',
                        marginBottom: 4
                      }}>
                        {date.toLocaleDateString('en', { weekday: 'short' })}
                      </Text>
                      <Text style={{ 
                        fontSize: 18, 
                        fontWeight: 'bold',
                        color: isSelected ? 'white' : isTodayDate ? '#3B82F6' : '#1F2937'
                      }}>
                        {date.getDate()}
                      </Text>
                      {isTodayDate && !isSelected && (
                        <View style={{
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: '#3B82F6',
                          marginTop: 4
                        }} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* Today's Plan Summary */}
          {todaysPlan && (
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
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2937' }}>
                  Today's Plan
                </Text>
                <Text style={{ fontSize: 14, color: '#6B7280' }}>
                  {formatTime(todaysPlan.totalEstimatedTime)}
                </Text>
              </View>

              {/* Progress Ring */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View style={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: 30,
                  backgroundColor: '#F3F4F6',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 16,
                  borderWidth: 4,
                  borderColor: todaysPlan.completionRate > 0 ? '#10B981' : '#E5E7EB'
                }}>
                  <Text style={{ 
                    fontSize: 14, 
                    fontWeight: 'bold',
                    color: todaysPlan.completionRate > 0 ? '#10B981' : '#6B7280'
                  }}>
                    {Math.round(todaysPlan.completionRate)}%
                  </Text>
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 2 }}>
                    {todaysPlan.tasks.filter(t => t.status === 'completed').length} of {todaysPlan.tasks.length} completed
                  </Text>
                  <Text style={{ fontSize: 14, color: '#6B7280' }}>
                    Keep up the great work!
                  </Text>
                </View>
              </View>

              {/* Quick Stats */}
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#3B82F6', marginBottom: 2 }}>
                    {todaysPlan.tasks.filter(t => t.priority === 'high').length}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280' }}>High Priority</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#10B981', marginBottom: 2 }}>
                    {todaysPlan.tasks.filter(t => t.status === 'completed').length}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280' }}>Completed</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#F59E0B', marginBottom: 2 }}>
                    {todaysPlan.tasks.filter(t => t.status === 'pending').length}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280' }}>Remaining</Text>
                </View>
              </View>
            </View>
          )}

          {/* Task List */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 16 }}>
              Today's Tasks
            </Text>
            
            <View style={{ gap: 12 }}>
              {todaysPlan?.tasks.map((task, index) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onPress={() => handleTaskPress(task)}
                  onStatusChange={(status) => updateTaskStatus(task.id, status)}
                />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Task Item Component
interface TaskItemProps {
  task: any;
  onPress: () => void;
  onStatusChange: (status: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onPress, onStatusChange }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'practice': return '🎯';
      case 'flashcards': return '🗂️';
      case 'mock_exam': return '📋';
      case 'weak_topic': return '📚';
      case 'review': return '🔄';
      default: return '📝';
    }
  };

  const isCompleted = task.status === 'completed';

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        opacity: isCompleted ? 0.7 : 1
      }}
    >
      {/* Completion Checkbox */}
      <TouchableOpacity
        onPress={() => onStatusChange(isCompleted ? 'pending' : 'completed')}
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: isCompleted ? '#10B981' : '#D1D5DB',
          backgroundColor: isCompleted ? '#10B981' : 'transparent',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12
        }}
      >
        {isCompleted && (
          <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
        )}
      </TouchableOpacity>

      {/* Task Icon */}
      <View style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
      }}>
        <Text style={{ fontSize: 20 }}>{getTaskIcon(task.type)}</Text>
      </View>

      {/* Task Details */}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
          <Text style={{ 
            fontSize: 16, 
            fontWeight: '600', 
            color: '#1F2937',
            textDecorationLine: isCompleted ? 'line-through' : 'none'
          }}>
            {task.title}
          </Text>
          <View style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: getPriorityColor(task.priority),
            marginLeft: 8
          }} />
        </View>
        <Text style={{ 
          fontSize: 14, 
          color: '#6B7280',
          marginBottom: 4
        }}>
          {task.description}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: '#9CA3AF' }}>
            ⏱️ {task.estimatedTime}m
          </Text>
          {task.subject && (
            <Text style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 12 }}>
              📚 {task.subject}
            </Text>
          )}
        </View>
      </View>

      <Text style={{ color: '#6B7280', fontSize: 16 }}>→</Text>
    </TouchableOpacity>
  );
};