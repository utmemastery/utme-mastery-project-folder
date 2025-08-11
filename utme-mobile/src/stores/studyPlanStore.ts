// mobile/src/stores/studyPlanStore.ts
import { create } from 'zustand';
import api from '../services/api';

interface StudyTask {
  id: string;
  type: string;
  title: string;
  description: string;
  subject?: string;
  topic?: string;
  estimatedTime: number;
  priority: string;
  status: string;
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

  // Actions
  fetchStudyPlan: () => Promise<void>;
  updateTaskStatus: (taskId: string, status: string) => Promise<void>;
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
        studyPlan: response.data.studyPlan,
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
      await api.put('/user/study-plan/task', { taskId, status });
      
      // Update local state
      set(state => ({
        studyPlan: state.studyPlan ? {
          ...state.studyPlan,
          tasks: state.studyPlan.tasks.map(task => 
            task.id === taskId ? { ...task, status } : task
          )
        } : null
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to update task' });
    }
  },

  clearError: () => set({ error: null })
}));

