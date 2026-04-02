import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from './useAuth';
import { useAppData } from './useAppData';
import { useNotifications } from './useNotifications';
import { storageKeys } from '@/lib/storageKeys';
import { ChatContext } from './chat-context';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  receiverId: string;
  receiverName: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface ChatThread {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: string;
  participantEmail?: string;
  subtitle?: string;
  lastMessage: string;
  lastTimestamp: Date;
  unreadCount: number;
}

export interface ChatContact {
  participantId: string;
  participantName: string;
  participantRole: string;
  participantEmail?: string;
  subtitle?: string;
  hasConversation: boolean;
  lastTimestamp?: Date;
}

type StoredChatMessage = Omit<ChatMessage, 'timestamp'> & { timestamp: string };
const STORAGE_KEY = storageKeys.chatMessages;

const safeParseMessages = (raw: string | null): ChatMessage[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as StoredChatMessage[];
    return parsed.map((message) => ({
      ...message,
      timestamp: new Date(message.timestamp),
    }));
  } catch {
    return [];
  }
};

const sortByTimestamp = (messages: ChatMessage[]) =>
  [...messages].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, getUsers } = useAuth();
  const { appointments } = useAppData();
  const { addNotification } = useNotifications();
  const [messages, setMessages] = useState<ChatMessage[]>(() => safeParseMessages(localStorage.getItem(STORAGE_KEY)));
  const [activeThread, setActiveThreadState] = useState<string | null>(null);

  const persistMessages = useCallback((next: ChatMessage[]) => {
    const serializable: StoredChatMessage[] = next.map((message) => ({
      ...message,
      timestamp: message.timestamp.toISOString(),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  }, []);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      setMessages(safeParseMessages(event.newValue));
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const updateMessages = useCallback((updater: (current: ChatMessage[]) => ChatMessage[]) => {
    setMessages((current) => {
      const next = updater(current);
      if (next === current) {
        return current;
      }
      persistMessages(next);
      return next;
    });
  }, [persistMessages]);

  const markThreadRead = useCallback((participantId: string) => {
    if (!user) return;

    updateMessages((current) => {
      let changed = false;
      const next = current.map((message) => {
        if (message.receiverId === user.id && message.senderId === participantId && !message.read) {
          changed = true;
          return { ...message, read: true };
        }
        return message;
      });

      return changed ? next : current;
    });
  }, [updateMessages, user]);

  const setActiveThread = useCallback((id: string | null) => {
    setActiveThreadState(id);
    if (id) {
      markThreadRead(id);
    }
  }, [markThreadRead]);

  const threads = useMemo<ChatThread[]>(() => {
    if (!user) return [];

    const relevant = sortByTimestamp(
      messages.filter((message) => message.senderId === user.id || message.receiverId === user.id),
    );
    const threadMap = new Map<string, ChatThread>();
    const usersById = new Map(getUsers().map((account) => [account.id, account]));

    relevant.forEach((message) => {
      const isOutgoing = message.senderId === user.id;
      const participantId = isOutgoing ? message.receiverId : message.senderId;
      const participantName = isOutgoing ? message.receiverName : message.senderName;
      const participantRole = isOutgoing ? usersById.get(message.receiverId)?.role ?? 'patient' : message.senderRole;
      const participantEmail = usersById.get(participantId)?.email;

      threadMap.set(participantId, {
        id: participantId,
        participantId,
        participantName,
        participantRole,
        participantEmail,
        subtitle: participantRole === 'doctor' ? 'Secure provider conversation' : 'Patient conversation',
        lastMessage: message.content,
        lastTimestamp: message.timestamp,
        unreadCount: relevant.filter(
          (candidate) =>
            candidate.senderId === participantId &&
            candidate.receiverId === user.id &&
            !candidate.read,
        ).length,
      });
    });

    return Array.from(threadMap.values()).sort((a, b) => b.lastTimestamp.getTime() - a.lastTimestamp.getTime());
  }, [getUsers, messages, user]);

  const contacts = useMemo<ChatContact[]>(() => {
    if (!user) return [];

    const contactMap = new Map<string, ChatContact>();
    const allUsers = getUsers();

    threads.forEach((thread) => {
      contactMap.set(thread.participantId, {
        participantId: thread.participantId,
        participantName: thread.participantName,
        participantRole: thread.participantRole,
        participantEmail: thread.participantEmail,
        subtitle: thread.participantRole === 'doctor' ? 'Recent conversation' : 'Patient conversation',
        hasConversation: true,
        lastTimestamp: thread.lastTimestamp,
      });
    });

    if (user.role === 'patient') {
      allUsers
        .filter((account) => account.id !== user.id && account.role === 'doctor')
        .forEach((doctor) => {
          const existing = contactMap.get(doctor.id);
          contactMap.set(doctor.id, {
            participantId: doctor.id,
            participantName: doctor.name,
            participantRole: doctor.role,
            participantEmail: doctor.email,
            subtitle: doctor.profile?.bio?.trim() || 'Doctor',
            hasConversation: existing?.hasConversation ?? false,
            lastTimestamp: existing?.lastTimestamp,
          });
        });

      appointments
        .filter((appointment) => appointment.patientId === user.id)
        .forEach((appointment) => {
          const existing = contactMap.get(appointment.doctorId);
          contactMap.set(appointment.doctorId, {
            participantId: appointment.doctorId,
            participantName: appointment.doctorName,
            participantRole: 'doctor',
            participantEmail: existing?.participantEmail,
            subtitle: appointment.type,
            hasConversation: existing?.hasConversation ?? false,
            lastTimestamp: existing?.lastTimestamp,
          });
        });
    }

    if (user.role === 'doctor') {
      allUsers
        .filter((account) => account.id !== user.id && account.role === 'patient')
        .forEach((patient) => {
          const existing = contactMap.get(patient.id);
          contactMap.set(patient.id, {
            participantId: patient.id,
            participantName: patient.name,
            participantRole: patient.role,
            participantEmail: patient.email,
            subtitle: 'Patient',
            hasConversation: existing?.hasConversation ?? false,
            lastTimestamp: existing?.lastTimestamp,
          });
        });

      appointments
        .filter((appointment) => appointment.doctorId === user.id)
        .forEach((appointment) => {
          const existing = contactMap.get(appointment.patientId);
          contactMap.set(appointment.patientId, {
            participantId: appointment.patientId,
            participantName: appointment.patientName,
            participantRole: 'patient',
            participantEmail: existing?.participantEmail,
            subtitle: appointment.type,
            hasConversation: existing?.hasConversation ?? false,
            lastTimestamp: existing?.lastTimestamp,
          });
        });
    }

    return Array.from(contactMap.values()).sort((a, b) => {
      if (a.hasConversation !== b.hasConversation) {
        return a.hasConversation ? -1 : 1;
      }
      if (a.lastTimestamp && b.lastTimestamp) {
        return b.lastTimestamp.getTime() - a.lastTimestamp.getTime();
      }
      return a.participantName.localeCompare(b.participantName);
    });
  }, [appointments, getUsers, threads, user]);

  useEffect(() => {
    if (!activeThread) return;
    markThreadRead(activeThread);
  }, [activeThread, markThreadRead, messages]);

  useEffect(() => {
    if (activeThread && !contacts.some((contact) => contact.participantId === activeThread)) {
      setActiveThreadState(null);
    }
  }, [activeThread, contacts]);

  const sendMessage = useCallback((receiverId: string, receiverName: string, content: string) => {
    if (!user || !content.trim()) return;

    const receiver = contacts.find((contact) => contact.participantId === receiverId);
    const newMessage: ChatMessage = {
      id: `msg-${crypto.randomUUID()}`,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      receiverId,
      receiverName: receiver?.participantName ?? receiverName,
      content: content.trim(),
      timestamp: new Date(),
      read: false,
    };

    updateMessages((current) => [...current, newMessage]);
    setActiveThreadState(receiverId);

    if (receiver?.participantEmail) {
      addNotification({
        title: `New message from ${user.name}`,
        message: newMessage.content,
        type: 'chat',
        priority: 'medium',
        audience: 'personal',
        actionUrl: `/dashboard/messages?thread=${user.id}`,
        actionLabel: 'Reply',
        targetEmails: [receiver.participantEmail],
      });
    }
  }, [addNotification, contacts, updateMessages, user]);

  const totalUnread = useMemo(() => {
    if (!user) return 0;
    return messages.filter((message) => message.receiverId === user.id && !message.read).length;
  }, [messages, user]);

  return (
    <ChatContext.Provider
      value={{
        threads,
        contacts,
        activeThread,
        messages,
        setActiveThread,
        sendMessage,
        totalUnread,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
