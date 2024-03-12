let io;
const { Server } = require("socket.io");
module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer, { cors: {} });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  },
};
