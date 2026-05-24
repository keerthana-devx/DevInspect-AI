import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Link2, X, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import useCollaboration from '@/hooks/useCollaboration';
import { useAuth } from '@/contexts/AuthContext.jsx';

const CollabPanel = ({ code, onCodeChange }) => {
  const { currentUser } = useAuth();
  const [roomId, setRoomId] = useState('');
  const [inputRoom, setInputRoom] = useState('');
  const [copied, setCopied] = useState(false);

  const { connected, users, typingUser, sendCode } = useCollaboration(
    roomId,
    currentUser?.name || 'Anonymous',
    (remoteCode) => onCodeChange?.(remoteCode)
  );

  const handleCreate = () => {
    const id = Math.random().toString(36).slice(2, 10).toUpperCase();
    setRoomId(id);
    setInputRoom(id);
    toast.success(`Room ${id} created!`);
  };

  const handleJoin = () => {
    if (!inputRoom.trim()) return;
    setRoomId(inputRoom.trim().toUpperCase());
    toast.success(`Joined room ${inputRoom.trim().toUpperCase()}`);
  };

  const handleLeave = () => {
    setRoomId('');
    setInputRoom('');
    toast.info('Left collaboration room');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/analyzer?room=${roomId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Room link copied!');
  };

  const handleBroadcast = () => {
    if (roomId) sendCode(code);
  };

  return (
    <div className="card-glass p-4 rounded-2xl border border-border/30 space-y-3">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-primary" />
        <span className="text-sm font-bold">Live Collaboration</span>
        {connected && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse ml-auto" />}
      </div>

      {!roomId ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input value={inputRoom} onChange={(e) => setInputRoom(e.target.value.toUpperCase())}
              placeholder="Room ID" className="h-9 text-xs input-premium font-mono" maxLength={8} />
            <Button onClick={handleJoin} size="sm" className="btn-secondary h-9 text-xs px-3">Join</Button>
          </div>
          <Button onClick={handleCreate} size="sm" variant="outline" className="w-full h-9 text-xs border-primary/30 text-primary hover:bg-primary/10">
            <Link2 className="w-3.5 h-3.5 mr-1.5" /> Create Room
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg border border-primary/20">
            <span className="text-xs font-mono font-bold text-primary flex-1">Room: {roomId}</span>
            <button onClick={handleCopyLink} className="text-muted-foreground hover:text-primary transition-colors">
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button onClick={handleLeave} className="text-muted-foreground hover:text-destructive transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {users.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {users.map((u, i) => (
                <span key={i} className="px-2 py-0.5 bg-muted/50 rounded-full text-[10px] font-semibold border border-border/20">
                  {u.name}
                </span>
              ))}
            </div>
          )}

          {typingUser && (
            <p className="text-[10px] text-muted-foreground italic animate-pulse">{typingUser} is typing...</p>
          )}

          <Button onClick={handleBroadcast} size="sm" className="btn-primary w-full h-8 text-xs">
            Broadcast My Code
          </Button>
        </div>
      )}
    </div>
  );
};

export default CollabPanel;
