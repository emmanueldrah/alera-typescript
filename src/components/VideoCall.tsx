import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video, VideoOff, Mic, MicOff, Phone, PhoneOff,
  Maximize2, Minimize2, Monitor, MonitorOff, MessageSquare, Clock,
  Heart, Users, Send,
} from 'lucide-react';

export type CallState = 'idle' | 'ringing' | 'connecting' | 'active' | 'ended';

interface VideoCallProps {
  participantName: string;
  participantRole: string;
  isIncoming?: boolean;
  onEnd: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
}

interface ChatMsg {
  id: string;
  text: string;
  isMe: boolean;
  time: string;
}

const VideoCall = ({
  participantName, participantRole, isIncoming = false,
  onEnd, onAccept, onDecline,
}: VideoCallProps) => {
  const [callState, setCallState] = useState<CallState>(isIncoming ? 'ringing' : 'connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const containerRef = useRef<HTMLDivElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch {
      if (import.meta.env.DEV) {
        console.log('Camera not available, using placeholder');
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  const startScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      screenStreamRef.current = stream;
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
      }
      setIsScreenSharing(true);
      // Listen for user stopping share via browser UI
      stream.getVideoTracks()[0].onended = () => {
        setIsScreenSharing(false);
        screenStreamRef.current = null;
      };
    } catch {
      if (import.meta.env.DEV) {
        console.log('Screen sharing cancelled or not available');
      }
    }
  }, []);

  const stopScreenShare = useCallback(() => {
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current = null;
    setIsScreenSharing(false);
  }, []);

  useEffect(() => {
    if (!isIncoming) {
      startCamera();
      const t = setTimeout(() => setCallState('active'), 2500);
      return () => { clearTimeout(t); stopCamera(); stopScreenShare(); };
    }
    return () => { stopCamera(); stopScreenShare(); };
  }, [isIncoming, startCamera, stopCamera, stopScreenShare]);

  useEffect(() => {
    if (callState === 'active') {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [callState]);

  const handleAccept = () => {
    startCamera();
    setCallState('active');
    onAccept?.();
  };

  const handleEnd = () => {
    setCallState('ended');
    stopCamera();
    stopScreenShare();
    clearInterval(timerRef.current);
    setTimeout(onEnd, 1500);
  };

  const handleDecline = () => {
    stopCamera();
    onDecline?.();
    onEnd();
  };

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    }
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    }
    setIsVideoOn(!isVideoOn);
  };

  const toggleScreenShare = () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    const msg: ChatMsg = {
      id: crypto.randomUUID(),
      text: chatInput,
      isMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages(prev => [...prev, msg]);
    setChatInput('');
  };

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-center justify-center"
    >
      <div className={`relative w-full h-full max-w-6xl max-h-[90vh] mx-auto flex flex-col ${isFullscreen ? 'max-w-none max-h-none' : 'p-4'}`}>
        {/* Main video area */}
        <div className="flex-1 relative rounded-2xl overflow-hidden bg-gradient-to-br from-muted to-secondary">
          {/* Screen share display (takes over main area when active) */}
          {isScreenSharing && callState === 'active' && (
            <div className="absolute inset-0 bg-background">
              <video
                ref={screenVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/90 text-primary-foreground text-sm font-medium shadow-lg">
                <Monitor className="w-4 h-4" />
                Sharing your screen
              </div>
            </div>
          )}

          {/* Remote participant (simulated) */}
          {(!isScreenSharing || callState !== 'active') && (
            <div className="absolute inset-0 flex items-center justify-center">
              {callState === 'active' ? (
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 ring-4 ring-primary/20">
                    {participantRole === 'doctor' ? <Heart className="w-16 h-16" /> : <Users className="w-16 h-16" />}
                  </div>
                  <p className="text-xl font-display font-semibold text-foreground">{participantName}</p>
                  <p className="text-sm text-muted-foreground mt-1 capitalize">{participantRole}</p>
                  <div className="flex items-center gap-1.5 justify-center mt-2 text-success">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-sm font-mono">{formatElapsed(elapsed)}</span>
                  </div>
                </div>
              ) : callState === 'ringing' ? (
                <div className="text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-28 h-28 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 ring-4 ring-primary/20"
                  >
                    {participantRole === 'doctor' ? <Heart className="w-14 h-14" /> : <Users className="w-14 h-14" />}
                  </motion.div>
                  <p className="text-xl font-display font-semibold text-foreground">{participantName}</p>
                  <motion.p
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-sm text-primary mt-2"
                  >
                    {isIncoming ? 'Incoming video call...' : 'Calling...'}
                  </motion.p>
                </div>
              ) : callState === 'connecting' ? (
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent mx-auto mb-4"
                  />
                  <p className="text-foreground font-medium">Connecting to {participantName}...</p>
                </div>
              ) : (
                <div className="text-center">
                  <PhoneOff className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-foreground font-medium">Call ended</p>
                  <p className="text-sm text-muted-foreground mt-1">Duration: {formatElapsed(elapsed)}</p>
                </div>
              )}
            </div>
          )}

          {/* Local video (PiP) */}
          {callState === 'active' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`absolute bottom-4 right-4 rounded-xl overflow-hidden border-2 border-border shadow-lg bg-muted ${
                isScreenSharing ? 'w-36 h-28' : 'w-48 h-36'
              }`}
            >
              {isVideoOn ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary">
                  <VideoOff className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-background/70 text-foreground text-[10px] font-medium">
                You
              </div>
            </motion.div>
          )}

          {/* Status bar */}
          {callState === 'active' && !isScreenSharing && (
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background/70 text-foreground text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Connected — End-to-end encrypted
              </span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-4 flex items-center justify-center gap-3">
          {callState === 'ringing' && isIncoming ? (
            <>
              <button onClick={handleDecline}
                className="w-14 h-14 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:opacity-90 transition shadow-lg">
                <PhoneOff className="w-6 h-6" />
              </button>
              <button onClick={handleAccept}
                className="w-14 h-14 rounded-full bg-success text-primary-foreground flex items-center justify-center hover:opacity-90 transition shadow-lg">
                <Phone className="w-6 h-6" />
              </button>
            </>
          ) : callState === 'active' ? (
            <>
              <button onClick={toggleMute}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-md ${
                  isMuted ? 'bg-destructive/20 text-destructive' : 'bg-secondary text-secondary-foreground hover:bg-muted'
                }`}>
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button onClick={toggleVideo}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-md ${
                  !isVideoOn ? 'bg-destructive/20 text-destructive' : 'bg-secondary text-secondary-foreground hover:bg-muted'
                }`}>
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
              <button onClick={toggleScreenShare} title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-md ${
                  isScreenSharing ? 'bg-primary/20 text-primary' : 'bg-secondary text-secondary-foreground hover:bg-muted'
                }`}>
                {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
              </button>
              <button onClick={() => setShowChat(!showChat)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-md ${
                  showChat ? 'bg-primary/20 text-primary' : 'bg-secondary text-secondary-foreground hover:bg-muted'
                }`}>
                <MessageSquare className="w-5 h-5" />
              </button>
              <button onClick={toggleFullscreen}
                className="w-12 h-12 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center hover:bg-muted transition shadow-md">
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
              <button onClick={handleEnd}
                className="w-14 h-14 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:opacity-90 transition shadow-lg">
                <PhoneOff className="w-6 h-6" />
              </button>
            </>
          ) : callState === 'connecting' ? (
            <button onClick={handleEnd}
              className="w-14 h-14 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:opacity-90 transition shadow-lg">
              <PhoneOff className="w-6 h-6" />
            </button>
          ) : null}
        </div>

        {/* In-call chat sidebar */}
        <AnimatePresence>
          {showChat && callState === 'active' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-4 right-4 bottom-20 w-72 bg-card rounded-2xl border border-border shadow-lg flex flex-col overflow-hidden"
            >
              <div className="h-12 px-4 flex items-center border-b border-border">
                <span className="text-sm font-medium text-card-foreground">In-call chat</span>
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-2">
                {chatMessages.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center mt-8">Send quick messages during the call</p>
                ) : (
                  chatMessages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs ${
                        msg.isMe ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                      }`}>
                        <p>{msg.text}</p>
                        <p className={`text-[9px] mt-1 ${msg.isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>{msg.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 border-t border-border flex gap-2">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Type a message..."
                  className="flex-1 h-9 px-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button onClick={sendChatMessage} disabled={!chatInput.trim()}
                  className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition disabled:opacity-40">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default VideoCall;
