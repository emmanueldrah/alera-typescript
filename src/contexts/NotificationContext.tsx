import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { type UserRole } from './AuthContext';
import { getNotificationStorageKey, storageKeys } from '@/lib/storageKeys';
import { NotificationContext, type NotificationDraft, type NotificationContextType, type RealtimeNotification } from './notification-context';
import { useAuth } from './useAuth';
import { createStoredNotification, matchesNotificationRecipient } from '@/lib/notificationUtils';

interface NotificationEventPayload {
  sourceId: string;
  notification: NotificationDraft;
  createdAt: string;
}

const MAX_NOTIFICATIONS = 50;
const EVENT_STORAGE_KEY = storageKeys.notificationEvent;
const roleFeedLabels: Record<UserRole, string> = {
  patient: 'Patient activity',
  doctor: 'Doctor activity',
  hospital: 'Hospital activity',
  laboratory: 'Laboratory activity',
  imaging: 'Imaging activity',
  pharmacy: 'Pharmacy activity',
  ambulance: 'Emergency activity',
  admin: 'Admin activity',
};

const safeParseNotifications = (raw: string | null): RealtimeNotification[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Array<Omit<RealtimeNotification, 'timestamp'> & { timestamp: string }>;
    return parsed.map((notification) => ({
      ...notification,
      timestamp: new Date(notification.timestamp),
    }));
  } catch {
    return [];
  }
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const sourceIdRef = useRef(`notif-source-${Math.random().toString(36).slice(2, 10)}`);
  const storageKey = user ? getNotificationStorageKey(user.email) : null;

  const persistNotifications = useCallback((next: RealtimeNotification[]) => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify(next));
  }, [storageKey]);

  const deliverNotification = useCallback((draft: NotificationDraft, options?: { toastEnabled?: boolean }) => {
    if (!user || !matchesNotificationRecipient(draft, user.email, user.role)) return;

    const created = createStoredNotification(draft, user.role);
    setNotifications((prev) => {
      const next = [created, ...prev].slice(0, MAX_NOTIFICATIONS);
      persistNotifications(next);
      return next;
    });
    setLastUpdatedAt(created.timestamp);

    if (options?.toastEnabled !== false) {
      toast(created.title, {
        description: created.message,
      });
    }

    if (
      created.priority === 'critical' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      new Notification(created.title, { body: created.message, icon: '/alera-icon.png' });
    }
  }, [persistNotifications, user]);

  useEffect(() => {
    if (!user || !isAuthenticated || !storageKey) {
      setNotifications([]);
      setLastUpdatedAt(null);
      return;
    }

    const stored = safeParseNotifications(localStorage.getItem(storageKey));
    setNotifications(stored);
    setLastUpdatedAt(stored[0]?.timestamp ?? null);
  }, [user, isAuthenticated, storageKey]);

  useEffect(() => {
    if (isAuthenticated && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!user || !isAuthenticated) return;

    const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('alera-notifications') : null;

    const handleEvent = (payload: NotificationEventPayload) => {
      if (payload.sourceId === sourceIdRef.current) return;
      deliverNotification(payload.notification);
    };

    const handleChannelMessage = (event: MessageEvent<NotificationEventPayload>) => {
      handleEvent(event.data);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== EVENT_STORAGE_KEY || !event.newValue) return;
      try {
        handleEvent(JSON.parse(event.newValue) as NotificationEventPayload);
      } catch {
        return;
      }
    };

    channel?.addEventListener('message', handleChannelMessage);
    window.addEventListener('storage', handleStorage);

    return () => {
      channel?.removeEventListener('message', handleChannelMessage);
      channel?.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, [deliverNotification, isAuthenticated, user]);

  const addNotification = useCallback((draft: NotificationDraft) => {
    const payload: NotificationEventPayload = {
      sourceId: sourceIdRef.current,
      notification: draft,
      createdAt: new Date().toISOString(),
    };

    deliverNotification(draft);

    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('alera-notifications');
      channel.postMessage(payload);
      channel.close();
    }

    localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(payload));
    localStorage.removeItem(EVENT_STORAGE_KEY);
  }, [deliverNotification]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const next = prev.map((notification) => notification.id === id ? { ...notification, read: true } : notification);
      persistNotifications(next);
      return next;
    });
  }, [persistNotifications]);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      const next = prev.map((notification) => ({ ...notification, read: true }));
      persistNotifications(next);
      return next;
    });
  }, [persistNotifications]);

  const archiveNotification = useCallback((id: string) => {
    setNotifications((prev) => {
      const next = prev.map((notification) => notification.id === id ? { ...notification, archived: true, read: true } : notification);
      persistNotifications(next);
      return next;
    });
  }, [persistNotifications]);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setLastUpdatedAt(null);
    if (storageKey) localStorage.removeItem(storageKey);
  }, [storageKey]);

  const unreadCount = notifications.filter((notification) => !notification.read && !notification.archived).length;
  const feedLabel = user ? roleFeedLabels[user.role] : 'Activity';
  const contextValue = useMemo<NotificationContextType>(() => ({
    notifications,
    unreadCount,
    isLive: isAuthenticated && !!user,
    feedLabel,
    lastUpdatedAt,
    addNotification,
    markAsRead,
    markAllRead,
    archiveNotification,
    clearAll,
  }), [notifications, unreadCount, isAuthenticated, user, feedLabel, lastUpdatedAt, addNotification, markAsRead, markAllRead, archiveNotification, clearAll]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};
