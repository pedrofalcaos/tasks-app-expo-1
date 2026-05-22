import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const baseURL = process.env.EXPO_PUBLIC_API_URL;

export type Priority = 'Baixa' | 'Média' | 'Alta';
export type Filter = 'all' | 'completed' | 'pending';

export interface TaskItem {
  _id: string;
  text: string;
  completed?: boolean;
  dueDate?: string;
  priority?: Priority;
}

interface TaskState {
  tasks: TaskItem[];
  loading: boolean;
  filter: Filter;
  editingTask: TaskItem | null;
}

interface TaskActions {
  fetchTasks: () => Promise<void>;
  addTask: (text: string, completed: boolean, dueDate: string | null, priority: Priority, onSuccess: () => void) => Promise<void>;
  updateTask: (taskId: string, text: string, completed: boolean, dueDate: string | null, priority: Priority, onSuccess: () => void) => Promise<void>;
  toggleTaskCompleted: (id: string) => void;
  deleteTask: (id: string) => Promise<void>;
  deleteAllTasks: () => void;
  setFilter: (filter: Filter) => void;
  setEditingTask: (task: TaskItem | null) => void;
}

type TaskStore = TaskState & TaskActions;

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      loading: false,
      filter: 'all',
      editingTask: null,

      fetchTasks: async () => {
        set({ loading: true });
        try {
          const { data } = await axios.get<TaskItem[]>(`${baseURL}`);
          set({ tasks: data });
        } catch (err) {
          console.log(err);
        } finally {
          set({ loading: false });
        }
      },

      addTask: async (text, completed, dueDate, priority, onSuccess) => {
        try {
          await axios.post(`${baseURL}/save`, { text, completed, dueDate, priority });
          onSuccess();
          await get().fetchTasks();
        } catch (err) {
          console.log(err);
        }
      },

      updateTask: async (taskId, text, completed, dueDate, priority, onSuccess) => {
        try {
          await axios.post(`${baseURL}/update`, { _id: taskId, text, completed, dueDate, priority });
          onSuccess();
          await get().fetchTasks();
        } catch (err) {
          console.log(err);
        }
      },

      toggleTaskCompleted: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task._id === id ? { ...task, completed: !task.completed } : task
          ),
        }));
      },

      deleteTask: async (id) => {
        try {
          await axios.post(`${baseURL}/delete`, { _id: id });
          set((state) => ({
            tasks: state.tasks.filter((task) => task._id !== id),
          }));
        } catch (err) {
          console.log(err);
        }
      },

      deleteAllTasks: () => {
        set({ tasks: [] });
      },

      setFilter: (filter) => set({ filter }),

      setEditingTask: (task) => set({ editingTask: task }),
    }),
    {
      name: 'task-store',
      storage: createJSONStorage(() => AsyncStorage),
      // Persiste apenas os dados relevantes; loading e editingTask são estado de sessão
      partialize: (state) => ({
        tasks: state.tasks,
        filter: state.filter,
      }),
    }
  )
);
