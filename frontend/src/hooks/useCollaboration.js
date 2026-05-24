import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { API_ORIGIN } from '@/lib/apiConfig';

/**
 * useCollaboration — connects to /collab Socket.io namespace
 * @param {string|null} roomId — null means disconnected
 * @param {string} userName
 * @param {function} onCodeUpdate — called when remote code changes
 */
const useCollaboration = (roomId, userName, onCodeUpdate) => {
  const socketRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [connected, setConnected] = useState(false);
  const typingTimer = useRef(null);

  useEffect(() => {
    if (!roomId) return;

    const socket = io(`${API_ORIGIN}/collab`, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join-room', { roomId, name: userName });
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('room-state', ({ code, users: u }) => {
      onCodeUpdate?.(code);
      setUsers(u);
    });

    socket.on('code-update', ({ code }) => onCodeUpdate?.(code));
    socket.on('users-update', (u) => setUsers(u));
    socket.on('user-joined', ({ name }) => setUsers((prev) => [...prev, { name }]));
    socket.on('user-left', ({ name }) => setUsers((prev) => prev.filter((u) => u.name !== name)));
    socket.on('user-typing', ({ name }) => {
      setTypingUser(name);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setTypingUser(null), 2000);
    });

    return () => {
      clearTimeout(typingTimer.current);
      socket.off();
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
      setUsers([]);
      setTypingUser(null);
    };
  }, [roomId, userName]); // onCodeUpdate intentionally excluded — use ref pattern below

  // Keep onCodeUpdate ref fresh to avoid stale closure without reconnecting
  const onCodeUpdateRef = useRef(onCodeUpdate);
  useEffect(() => { onCodeUpdateRef.current = onCodeUpdate; }, [onCodeUpdate]);

  const sendCode = useCallback((code) => {
    socketRef.current?.emit('code-change', { roomId, code });
    socketRef.current?.emit('typing', { roomId });
  }, [roomId]);

  const sendCursor = useCallback((position) => {
    socketRef.current?.emit('cursor-move', { roomId, position });
  }, [roomId]);

  return { connected, users, typingUser, sendCode, sendCursor };
};

export default useCollaboration;
