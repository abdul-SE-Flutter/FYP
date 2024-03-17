const { Server } = require("socket.io");
let io;
let socket;
let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId == userId) &&
    users.push({ userId, socketId });
};
const getUser = (userId) => {
  return users.find((user) => user.userId == userId);
};
module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer, { cors: {} });
    io.on("connection", (socketIO) => {
      console.log("Client connected");
      socketIO.on("addUser", (userId) => {
        addUser(userId, socketIO.id);
        socketIO.emit("getUsers", users);
      });

      socket = socketIO;

      socketIO.on("sendMessage", (data) => {
        const user = getUser(data.receiverId);
        io.to(user.socketId).emit("getMessage", data.message);
      });

      socketIO.on("disconnect", function () {
        console.log("User disconnected:", socketIO.id); // Access socket.id directly
        users = users.filter((user) => user.socketId != socketIO.id);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  },
  getSocket: () => {
    if (!socket) {
      throw new Error("Socket.io not initialized!");
    }

    return socket;
  },
};
