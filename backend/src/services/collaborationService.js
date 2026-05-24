/**
 * Real-time collaboration rooms via Socket.io
 * Rooms are keyed by roomId; each room holds code state + active users
 */

const rooms = new Map(); // roomId -> { code, users: Map<socketId, { name, cursor }> }

const getOrCreateRoom = (roomId) => {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { code: '', users: new Map() });
  }
  return rooms.get(roomId);
};

export const setupCollaboration = (io) => {
  const collab = io.of('/collab');

  collab.on('connection', (socket) => {
    let currentRoom = null;
    let userName = 'Anonymous';

    /* Join a room */
    socket.on('join-room', ({ roomId, name }) => {
      if (!roomId) return;
      currentRoom = roomId;
      userName = name || 'Anonymous';

      socket.join(roomId);
      const room = getOrCreateRoom(roomId);
      room.users.set(socket.id, { name: userName, cursor: 0 });

      // Send current code state to the joining user
      socket.emit('room-state', {
        code: room.code,
        users: [...room.users.values()],
      });

      // Notify others
      socket.to(roomId).emit('user-joined', { id: socket.id, name: userName });
      collab.to(roomId).emit('users-update', [...room.users.values()]);
    });

    /* Code change broadcast */
    socket.on('code-change', ({ roomId, code }) => {
      if (!roomId) return;
      const room = rooms.get(roomId);
      if (room) room.code = code;
      socket.to(roomId).emit('code-update', { code, from: socket.id });
    });

    /* Cursor position */
    socket.on('cursor-move', ({ roomId, position }) => {
      if (!roomId) return;
      const room = rooms.get(roomId);
      if (room?.users.has(socket.id)) {
        room.users.get(socket.id).cursor = position;
      }
      socket.to(roomId).emit('cursor-update', { id: socket.id, name: userName, position });
    });

    /* Typing indicator */
    socket.on('typing', ({ roomId }) => {
      socket.to(roomId).emit('user-typing', { id: socket.id, name: userName });
    });

    /* Disconnect */
    socket.on('disconnect', () => {
      if (currentRoom) {
        const room = rooms.get(currentRoom);
        if (room) {
          room.users.delete(socket.id);
          collab.to(currentRoom).emit('user-left', { id: socket.id, name: userName });
          collab.to(currentRoom).emit('users-update', [...room.users.values()]);
          // Clean up empty rooms
          if (room.users.size === 0) rooms.delete(currentRoom);
        }
      }
    });
  });
};
