import { create } from 'zustand';
import api from '../services/api';

interface StudyTask {
  id: number;
  type: 'PRACTICE' | 'FLASHCARDS' | 'MOCK_EXAM' | 'WEAK_TOPIC' | 'REVIEW';
  title: string;
  description: string;
  subject?: string;
  topic?: string;
  estimatedTime: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'COMPLETED';
  dueDate: Date;
}

interface StudyPlan {
  date: Date;
  totalEstimatedTime: number;
  tasks: StudyTask[];
  completionRate: number;
}

interface StudyPlanState {
  studyPlan: StudyPlan | null;
  weekPlan: StudyPlan[];
  isLoading: boolean;
  error: string | null;

  fetchStudyPlan: () => Promise<void>;
  updateTaskStatus: (taskId: number, status: 'PENDING' | 'COMPLETED') => Promise<void>;
  regenerateStudyPlan: () => Promise<void>;
  clearError: () => void;
}

export const useStudyPlanStore = create<StudyPlanState>((set, get) => ({
  studyPlan: null,
  weekPlan: [],
  isLoading: false,
  error: null,

  fetchStudyPlan: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.get('/user/study-plan');
      set({ 
        studyPlan: {
          ...response.data.studyPlan,
          date: new Date(response.data.studyPlan.date),
          tasks: response.data.studyPlan.tasks.map((task: any) => ({
            ...task,
            id: Number(task.id),
            dueDate: new Date(task.dueDate)
          }))
        },
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to fetch study plan', 
        isLoading: false 
      });
    }
  },

  updateTaskStatus: async (taskId, status) => {
    try {
      await api.put('/user/study-plan/task', { taskId: Number(taskId), status });
      
      set(state => ({
        studyPlan: state.studyPlan ? {
          ...state.studyPlan,
          tasks: state.studyPlan.tasks.map(task => 
            task.id === taskId ? { ...task, status } : task
          ),
          completionRate: state.studyPlan.tasks.length > 0
            ? (state.studyPlan.tasks.filter(t => t.status === 'COMPLETED').length / state.studyPlan.tasks.length) * 100
            : 0
        } : null
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to update task' });
    }
  },

  regenerateStudyPlan: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.put('/user/study-plan/regenerate');
      set({ 
        studyPlan: {
          ...response.data.studyPlan,
          date: new Date(response.data.studyPlan.date),
          tasks: response.data.studyPlan.tasks.map((task: any) => ({
            ...task,
            id: Number(task.id),
            dueDate: new Date(task.dueDate)
          }))
        },
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.constexpr: true,
        isLoading: false 
      });
    }
  },

  clearError: () => set({ error: null })
}));