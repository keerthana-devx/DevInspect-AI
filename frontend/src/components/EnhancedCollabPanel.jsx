import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { 
  Users, 
  Share2, 
  Copy, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  MessageCircle,
  Crown,
  Eye,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { API_ORIGIN } from '@/lib/apiConfig';

const CollaborationPanel = ({ code, onCodeChange, language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [cursors, setCursors] = useState(new Map());
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [userName, setUserName] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastChangeRef = useRef(Date.now());

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(`${API_ORIGIN}/collab`, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to collaboration server');
    });

    newSocket.on('room-state', ({ code: roomCode, users }) => {
      if (roomCode !== code) {
        onCodeChange?.(roomCode);
      }
      setCollaborators(users);
    });

    newSocket.on('user-joined', ({ id, name }) => {
      toast.success(`${name} joined the session`);
      setCollaborators(prev => [...prev, { id, name }]);
    });

    newSocket.on('user-left', ({ name }) => {
      toast.info(`${name} left the session`);
    });

    newSocket.on('users-update', (users) => {
      setCollaborators(users);
    });

    newSocket.on('code-update', ({ code: newCode, from }) => {
      // Debounce updates to prevent infinite loops
      if (Date.now() - lastChangeRef.current > 100) {
        onCodeChange?.(newCode);
      }
    });

    newSocket.on('cursor-update', ({ id, name, position }) => {
      setCursors(prev => new Map(prev.set(id, { name, position })));
    });

    newSocket.on('user-typing', ({ id, name }) => {
      setTypingUsers(prev => new Set(prev.add(name)));
      setTimeout(() => {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(name);
          return newSet;
        });
      }, 2000);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Handle code changes with debouncing
  const handleCodeChange = useCallback((newCode) => {
    lastChangeRef.current = Date.now();
    onCodeChange?.(newCode);
    
    if (socket && isConnected && roomId) {
      // Debounce socket emissions
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('code-change', { roomId, code: newCode });
      }, 300);
      
      // Emit typing indicator
      socket.emit('typing', { roomId });
    }
  }, [socket, isConnected, roomId, onCodeChange]);

  // Handle cursor position
  const handleCursorMove = useCallback((e) => {
    if (socket && isConnected && roomId) {
      const position = e.target.selectionStart;
      socket.emit('cursor-move', { roomId, position });
    }
  }, [socket, isConnected, roomId]);

  // Create room
  const createRoom = () => {
    if (!userName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(newRoomId);
    setIsHost(true);
    joinRoom(newRoomId);
  };

  // Join room
  const joinRoom = (targetRoomId = roomId) => {
    if (!userName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    if (!targetRoomId.trim()) {
      toast.error('Please enter room ID');
      return;
    }

    if (socket) {
      socket.emit('join-room', { roomId: targetRoomId, name: userName });
      setIsConnected(true);
      setRoomId(targetRoomId);
      toast.success(`Joined room ${targetRoomId}`);
    }
  };

  // Leave room
  const leaveRoom = () => {
    if (socket) {
      socket.disconnect();
      socket.connect();
    }
    setIsConnected(false);
    setRoomId('');
    setCollaborators([]);
    setCursors(new Map());
    setIsHost(false);
    toast.info('Left collaboration room');
  };

  // Copy room link
  const copyRoomLink = () => {
    const link = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    navigator.clipboard.writeText(link);
    toast.success('Room link copied to clipboard');
  };

  // Send chat message
  const sendChatMessage = () => {
    if (!chatInput.trim() || !socket || !isConnected) return;
    
    const message = {
      id: Date.now(),
      user: userName,
      text: chatInput,
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, message]);
    setChatInput('');
    
    // In a real implementation, this would be sent via socket
    socket.emit('chat-message', { roomId, message });
  };

  return (
    <div className="card-glass rounded-2xl border border-border/30 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold">Live Collaboration</span>
          {isConnected && (
            <span className="px-2 py-0.5 bg-green-500/20 text-green-500 rounded-full text-[10px] font-bold">
              {collaborators.length} online
            </span>
          )}
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/20"
          >
            <div className="p-4 space-y-4">
              {!isConnected ? (
                // Connection Setup
                <div className="space-y-3">
                  <Input
                    placeholder="Your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="h-8 text-xs input-premium"
                  />
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={createRoom}
                      size="sm"
                      className="btn-primary h-8 text-xs flex-1"
                    >
                      <Crown className="w-3 h-3 mr-1" />
                      Create Room
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Room ID"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                      className="h-8 text-xs input-premium flex-1"
                    />
                    <Button
                      onClick={() => joinRoom()}
                      size="sm"
                      className="btn-secondary h-8 text-xs"
                    >
                      Join
                    </Button>
                  </div>
                </div>
              ) : (
                // Active Collaboration
                <div className="space-y-3">
                  {/* Room Info */}
                  <div className="flex items-center justify-between p-2 bg-primary/5 rounded-lg">
                    <div>
                      <p className="text-xs font-bold">Room: {roomId}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {collaborators.length} collaborator(s)
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        onClick={copyRoomLink}
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        onClick={leaveRoom}
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Active Users */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Active Users
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {collaborators.map((user, idx) => (
                        <div
                          key={user.id || idx}
                          className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-lg"
                        >
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-[10px] font-medium">
                            {user.name}
                            {isHost && idx === 0 && <Crown className="w-2.5 h-2.5 ml-1 text-yellow-500" />}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {typingUsers.size > 0 && (
                      <p className="text-[10px] text-muted-foreground italic">
                        {Array.from(typingUsers).join(', ')} typing...
                      </p>
                    )}
                  </div>

                  {/* Voice/Video Controls */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setMicEnabled(!micEnabled)}
                      size="sm"
                      variant={micEnabled ? "default" : "outline"}
                      className="h-8 text-xs flex-1"
                    >
                      {micEnabled ? <Mic className="w-3 h-3 mr-1" /> : <MicOff className="w-3 h-3 mr-1" />}
                      Mic
                    </Button>
                    <Button
                      onClick={() => setVideoEnabled(!videoEnabled)}
                      size="sm"
                      variant={videoEnabled ? "default" : "outline"}
                      className="h-8 text-xs flex-1"
                    >
                      {videoEnabled ? <Video className="w-3 h-3 mr-1" /> : <VideoOff className="w-3 h-3 mr-1" />}
                      Video
                    </Button>
                  </div>

                  {/* Quick Chat */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Quick Chat
                    </p>
                    
                    <div className="max-h-20 overflow-y-auto space-y-1 text-[10px]">
                      {chatMessages.length === 0 ? (
                        <p className="text-muted-foreground italic text-center py-2">
                          No messages yet
                        </p>
                      ) : (
                        chatMessages.slice(-3).map((msg) => (
                          <div key={msg.id} className="p-1.5 bg-muted/30 rounded">
                            <span className="font-bold text-primary">{msg.user}:</span>{' '}
                            <span className="text-foreground">{msg.text}</span>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <div className="flex gap-1">
                      <Input
                        placeholder="Type a message..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                        className="h-7 text-[10px] input-premium flex-1"
                      />
                      <Button
                        onClick={sendChatMessage}
                        size="sm"
                        className="h-7 px-2 text-[10px]"
                      >
                        <MessageCircle className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollaborationPanel;