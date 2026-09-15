const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join specific room (e.g., admin dashboard)
    socket.on('join_admin_room', () => {
      socket.join('admin_room');
      console.log(`🛡️ Socket ${socket.id} joined admin_room`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
};

export default socketHandler;