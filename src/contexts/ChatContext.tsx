import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from './useAuth';
import { useNotifications } from './useNotifications';
import { ChatContext } from './chat-context';
import { messagingApi } from '@/lib/apiService';
import { normalizeUserRole } from '@/lib/roleUtils';

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

type BackendMessage = {
  id: number;
  sender_id: number;
  recipient_id: number;
  content: string;
  subject?: string | null;
  is_read: string;
  is_archived: string;
  created_at: string;
  read_at?: string | null;
  sender?: { id: number; name: string; email?: string | null; role?: string | null };
  recipient?: { id: number; name: string; email?: string | null; role?: string | null };
};

const sortByTimestamp = (messages: ChatMessage[]) =>
  [...messages].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, getUsers } = useAuth();
  const { addNotification } = useNotifications();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeThread, setActiveThreadState] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    if (!user) {
      setMessages([]);
      setActiveThreadState(null);
      return [];
    }

    try {
      const response = await messagingApi.listMessages(0, 200);
      const usersById = new Map(
        getUsers().map((account) => [
          account.id,
          {
            name: account.name,
            email: account.email,
            role: account.role,
          },
        ]),
      );

      const mapped = (Array.isArray(response) ? response : []).map((item) => {
        const message = item as BackendMessage;
        const sender = usersById.get(String(message.sender_id));
        const recipient = usersById.get(String(message.recipient_id));

        return {
          id: String(message.id),
          senderId: String(message.sender_id),
          senderName: sender?.name ?? message.sender?.name ?? `User ${message.sender_id}`,
          senderRole: sender?.role ?? normalizeUserRole(message.sender?.role) ?? 'patient',
          receiverId: String(message.recipient_id),
          receiverName: recipient?.name ?? message.recipient?.name ?? `User ${message.recipient_id}`,
          content: message.content,
          timestamp: new Date(message.created_at),
          read: message.is_read === 'Y' || message.is_read === 'y' || message.is_read === 'true',
        } satisfies ChatMessage;
      });

      setMessages(mapped);
      return mapped;
    } catch (error) {
      console.error('Failed to load chat messages:', error);
      setMessages([]);
      return [];
    }
  }, [getUsers, user]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  const markThreadRead = useCallback(async (participantId: string) => {
    if (!user) return;

    const unreadMessages = messages.filter(
      (message) => message.receiverId === user.id && message.senderId === participantId && !message.read,
    );

    if (unreadMessages.length === 0) return;

    try {
      await Promise.all(unreadMessages.map((message) => messagingApi.updateMessage(message.id, { is_read: 'Y' })));
      await loadMessages();
    } catch (error) {
      console.error('Failed to mark thread read:', error);
    }
  }, [loadMessages, messages, user]);

  const setActiveThread = useCallback((id: string | null) => {
    setActiveThreadState(id);
    if (id) {
      void markThreadRead(id);
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
      const participant = usersById.get(participantId);
      const participantName = isOutgoing ? message.receiverName : message.senderName;
      const participantRole = participant?.role ?? message.senderRole;
      const participantEmail = participant?.email;

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
  }, [getUsers, threads, user]);

  useEffect(() => {
    if (activeThread && !contacts.some((contact) => contact.participantId === activeThread)) {
      setActiveThreadState(null);
    }
  }, [activeThread, contacts]);

  const sendMessage = useCallback(async (receiverId: string, receiverName: string, content: string) => {
    if (!user || !content.trim()) return;

    try {
      await messagingApi.sendMessage({
        recipient_id: receiverId,
        subject: 'Secure message',
        content,
      });
      await loadMessages();

      addNotification({
        title: `New message from ${user.name}`,
        message: content,
        type: 'chat',
        audience: 'personal',
        actionUrl: '/dashboard/messages',
        actionLabel: `Open ${receiverName}`,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }, [addNotification, loadMessages, user]);

  const totalUnread = useMemo(() => messages.filter((message) => message.receiverId === user?.id && !message.read).length, [messages, user?.id]);

  const contextValue = useMemo(() => ({
    threads,
    contacts,
    activeThread,
    messages,
    setActiveThread,
    sendMessage,
    totalUnread,
  }), [activeThread, contacts, messages, sendMessage, setActiveThread, threads, totalUnread]);

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};
