

const socketConnection=(io)=>{

    let users = [];
  
  const addUser = (userId, socketId) => {
    if (users.some((user) => user.userId === userId) === false) {
      users.push({ userId, socketId });
    } else {
      const { userId: uid } = findUser(userId);
      for (let i = 0; i < users.length; i++) {
        if (users[i].userId === uid) {
          users[i].socketId = socketId;
        }
      }
    }
  };
  
  const findUser = (userId) => {
    return users.find((user) => user.userId === userId);
  };
  
  const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
  };
  
      io.on("connection", (socket) => {
          console.log(`new user connected with socket id :  ${socket.id}`);
        
           socket.on("add-user", (userId) => {
              if (userId !== null && userId!=="") {
                console.log("USER ID : " + userId);
                console.log("JOINED ROOM BY SOCKET ID: " + socket.id);
                addUser(userId, socket.id);
        
                console.log("USERS : ", users);
              }
            });
        
        
          socket.on("send-message", (data) => {
           const user = findUser(data.receiver);
             // data = {sender : .... , receiver : ..... , text : ......}
  
             console.log("sent message : " , data)
            if (user) {
              console.log(data);
              const sid = user.socketId;
              data._id = Math.random();
              console.log(sid);
              io.to(sid).emit("receive-message", data);
            }
        
            // console.log(data);
            // data[0]._id = Math.random();
            // io.emit("recieve-msg", data);
          });
  
        
          socket.on("remove-user", () => {
           removeUser(socket.id);
          });
          
        
          socket.on("disconnect", () => {
            console.log("User disconnected");
            removeUser(socket.id);
          });
        });
  };
  
  module.exports = {socketConnection};
  
