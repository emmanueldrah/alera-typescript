import { createContext } from 'react';
import type { ChatContact, ChatMessage, ChatThread } from './ChatContext';

export interface ChatContextType {
  threads: ChatThread[];
  contacts: ChatContact[];
  activeThread: string | null;
  messages: ChatMessage[];
  setActiveThread: (id: string | null) => void;
  sendMessage: (receiverId: string, receiverName: string, content: string) => void;
  totalUnread: number;
}

export const ChatContext = createContext<ChatContextType | null>(null);
