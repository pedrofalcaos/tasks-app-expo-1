import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../src/store/useAuthStore';

export default function RootLayout() {
  const { token, loading, loadToken } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    loadToken();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inTabs = segments[0] === '(tabs)';

    if (!token && inTabs) {
      router.replace('/login');
    } else if (token && !inTabs) {
      router.replace('/(tabs)');
    }
  }, [token, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return <Slot />;
}
