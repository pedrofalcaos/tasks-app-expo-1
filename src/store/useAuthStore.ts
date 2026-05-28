import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const baseURL = process.env.EXPO_PUBLIC_API_URL;
const TOKEN_KEY = 'sessionToken';

interface AuthState {
  token: string | null;
  loading: boolean;
  loadToken: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  loading: true,

  loadToken: async () => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    set({ token, loading: false });
  },

  login: async (email, password) => {
    const { data } = await axios.post(`${baseURL}/auth/login`, { email, password });
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    set({ token: data.token });
  },

  signup: async (name, email, password) => {
    const { data } = await axios.post(`${baseURL}/auth/signup`, { name, email, password });
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    set({ token: data.token });
  },

  logout: async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    set({ token: null });
  },
}));
