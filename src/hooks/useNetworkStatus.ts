import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useOfflineStore } from '@/stores';

export function useNetworkStatus() {
  const { setOnline } = useOfflineStore();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOnline(state.isConnected ?? false);
    });
    return unsubscribe;
  }, []);
}
