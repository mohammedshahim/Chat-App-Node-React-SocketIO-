const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");
const { addUser, removeUser, getUser, getUserInRoom } = require("./users");

const PORT = process.env.PORT || 5000;

const router = require("./router");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on("connection", (socket) => {
  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room }); // addUser have returning two conditions e
    if (error) {
      return callback(error);
    }

    socket.emit("message", {
      user: "admin",
      text: `${user.name}, welcome to the room ${user.room}`,
    }); // send welcome msg to the user

    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name} has joined!` }); //this will emit msg to all users in room without the user login

    socket.join(user.room); //add user to room

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id); //getting user from users list

    io.to(user.room).emit("message", { user: user.name, text: message });

    callback();
  });

  socket.on("disconnect", () => {
    console.log("User has left!!!");
  });
});

app.use(cors());
app.use(router);

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
