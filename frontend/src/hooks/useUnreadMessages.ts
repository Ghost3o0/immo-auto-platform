import { useEffect, useState, useCallback } from 'react';
import { messagesApi } from '@/lib/api';

interface UseUnreadMessagesOptions {
  enabled?: boolean;
  interval?: number;
}

/**
 * Hook pour surveiller les messages non lus avec polling
 */
export function useUnreadMessages({ enabled = true, interval = 30000 }: UseUnreadMessagesOptions = {}) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadUnreadCount = useCallback(async () => {
    if (!enabled) return;

    try {
      const response = await messagesApi.getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Charger immédiatement au montage
    loadUnreadCount();

    // Configurer le polling
    const timer = setInterval(loadUnreadCount, interval);

    return () => clearInterval(timer);
  }, [enabled, interval, loadUnreadCount]);

  return { unreadCount, isLoading, refetch: loadUnreadCount };
}
