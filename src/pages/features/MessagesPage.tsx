import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Heart, Users, Circle, Search, Video } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useChat } from '@/contexts/useChat';
import { useAuth } from '@/contexts/useAuth';
import VideoCall from '@/components/VideoCall';

const MessagesPage = () => {
  const { user } = useAuth();
  const { threads, contacts, messages, setActiveThread, sendMessage } = useChat();
  const [searchParams, setSearchParams] = useSearchParams();
  const [newMessage, setNewMessage] = useState('');
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [videoCallTarget, setVideoCallTarget] = useState<{ name: string; role: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const availableParticipantIds = useMemo(
    () => new Set(contacts.map((contact) => contact.participantId)),
    [contacts],
  );

  const currentParticipant = contacts.find((contact) => contact.participantId === selectedThread)
    ?? threads.find((thread) => thread.participantId === selectedThread);
  const focusThread = searchParams.get('thread');

  const threadMessages = messages
    .filter((message) => {
      if (!selectedThread || !user) return false;
      return (
        (message.senderId === user.id && message.receiverId === selectedThread) ||
        (message.senderId === selectedThread && message.receiverId === user.id)
      );
    })
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadMessages.length, selectedThread]);

  useEffect(() => {
    if (focusThread && availableParticipantIds.has(focusThread)) {
      setSelectedThread(focusThread);
      setActiveThread(focusThread);
      return;
    }

    if (focusThread) {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.delete('thread');
        return next;
      }, { replace: true });
    }
  }, [availableParticipantIds, focusThread, setActiveThread, setSearchParams]);

  useEffect(() => {
    if (selectedThread && availableParticipantIds.has(selectedThread)) return;
    const defaultThread = threads[0]?.participantId ?? contacts[0]?.participantId ?? null;
    if (!defaultThread) return;
    setSelectedThread(defaultThread);
    setActiveThread(defaultThread);
  }, [availableParticipantIds, contacts, selectedThread, setActiveThread, threads]);

  const handleSend = () => {
    if (!newMessage.trim() || !selectedThread || !currentParticipant) return;
    sendMessage(selectedThread, currentParticipant.participantName, newMessage);
    setNewMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (date: Date) => date.toLocaleDateString([], { month: 'short', day: 'numeric' });

  const filteredContacts = contacts.filter((contact) =>
    contact.participantName.toLowerCase().includes(search.toLowerCase()),
  );
  const conversationContacts = filteredContacts.filter((contact) => contact.hasConversation);
  const newContacts = filteredContacts.filter((contact) => !contact.hasConversation);

  return (
    <div className="h-[calc(100vh-7rem)]">
      <AnimatePresence>
        {videoCallTarget && (
          <VideoCall
            participantName={videoCallTarget.name}
            participantRole={videoCallTarget.role}
            onEnd={() => setVideoCallTarget(null)}
          />
        )}
      </AnimatePresence>
      <div className="flex h-full bg-card rounded-2xl border border-border overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r border-border flex flex-col shrink-0">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-display font-semibold text-card-foreground mb-3">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search conversations..."
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversationContacts.map((contact) => {
              const thread = threads.find((candidate) => candidate.participantId === contact.participantId);
              if (!thread) return null;

              return (
                <button
                  key={thread.id}
                  onClick={() => { setSelectedThread(thread.participantId); setActiveThread(thread.participantId); }}
                  className={`w-full flex items-center gap-3 p-4 text-left transition border-b border-border last:border-0 ${
                    selectedThread === thread.participantId ? 'bg-primary/5' : 'hover:bg-secondary/50'
                  }`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      {thread.participantRole === 'doctor' ? <Heart className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                    </div>
                    <Circle className="absolute -bottom-0.5 -right-0.5 w-3 h-3 fill-success text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-card-foreground">{thread.participantName}</span>
                      <span className="text-[10px] text-muted-foreground">{formatTime(thread.lastTimestamp)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs text-muted-foreground truncate pr-2">{thread.lastMessage}</span>
                      {thread.unreadCount > 0 && (
                        <span className="shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}

            {/* New contacts */}
            {newContacts.length > 0 && (
              <div className="p-4">
                <p className="text-xs text-muted-foreground mb-2 font-medium">Start a conversation</p>
                {newContacts.map(contact => (
                  <button key={contact.participantId} onClick={() => {
                    setSelectedThread(contact.participantId);
                    setActiveThread(contact.participantId);
                  }}
                    className="w-full flex items-center gap-2 p-2.5 rounded-lg hover:bg-secondary/50 transition text-left mb-1">
                    <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                      {contact.participantRole === 'doctor' ? <Heart className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-card-foreground">{contact.participantName}</div>
                      <div className="text-[10px] text-muted-foreground">{contact.subtitle || contact.participantRole}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat area */}
        {selectedThread && currentParticipant ? (
          <div className="flex-1 flex flex-col">
            {/* Chat header */}
            <div className="h-16 px-6 flex items-center gap-3 border-b border-border shrink-0">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                {currentParticipant.participantRole === 'doctor' ? <Heart className="w-5 h-5" /> : <Users className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <div className="text-sm font-display font-semibold text-card-foreground">{currentParticipant.participantName}</div>
                <div className="flex items-center gap-1">
                  <Circle className="w-2 h-2 fill-success text-success" />
                  <span className="text-xs text-success">{currentParticipant.subtitle || 'Available for secure messaging'}</span>
                </div>
              </div>
              <button
                onClick={() => setVideoCallTarget({ name: currentParticipant.participantName, role: currentParticipant.participantRole })}
                className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition"
                title="Start video call"
              >
                <Video className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {threadMessages.length === 0 && (
                <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                  <div>
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No messages yet</p>
                    <p className="text-sm mt-1">Start the conversation with {currentParticipant.participantName}.</p>
                  </div>
                </div>
              )}
              {threadMessages.map((msg, i) => {
                const isMe = msg.senderId === user?.id;
                const showDate = i === 0 || formatDate(msg.timestamp) !== formatDate(threadMessages[i - 1].timestamp);
                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div className="text-center my-4">
                        <span className="px-3 py-1 rounded-full bg-secondary text-muted-foreground text-[11px]">{formatDate(msg.timestamp)}</span>
                      </div>
                    )}
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[65%] rounded-2xl px-4 py-3 ${
                        isMe
                          ? 'bg-gradient-primary text-primary-foreground rounded-br-md'
                          : 'bg-secondary text-secondary-foreground rounded-bl-md'
                      }`}>
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <p className={`text-[10px] mt-1.5 ${isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border shrink-0">
              <div className="flex items-center gap-3">
                <input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${currentParticipant.participantName}...`}
                  className="flex-1 h-11 px-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button onClick={handleSend} disabled={!newMessage.trim()}
                  className="w-11 h-11 rounded-xl bg-gradient-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition disabled:opacity-40">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">Select a conversation</p>
              <p className="text-sm text-muted-foreground mt-1">Choose from your contacts to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
