const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {
  generateMessage,
  generateLocationMessage,
} = require('./utils/messages');
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require('./utils/users');

const app = express();
const server = http.createServer(app);

const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

// Todo: Change server messages to their own message template

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
  socket.on('join', ({ username, room }, callback) => {
    // socket.io has ids for each of the clients that are connected. Use this
    // for storing the id of each user
    const { error, user } = addUser({ id: socket.id, username, room });

    // Send an error to the client through the callback if there is an issue
    //    adding a user.
    if (error) {
      return callback(error);
    }

    // io.to.emit: Send a message to specific room
    // socket.broadcast.to: Send it everyone but sender in current room
    socket.join(user.room);

    // First argument ('message') is name of event that is being emitted
    // Second parameter ('Welcome!') is data being emitted
    socket.emit('message', generateMessage('Server', 'Welcome!'));

    // broadcast.emit.to will send the data to all clients in a room
    // except the client that triggered it
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        generateMessage('Server', `${user.username} has joined ${user.room}`),
      );

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    // Calling the callback to let client know user was able to join
    callback();
  });

  // Listen to the 'sendMessage' event that is being
  //    emitted by the front end. This message is then sent
  //    to all connected browsers using io.emit
  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter();

    const user = getUser(socket.id);

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed');
    }

    io.to(user.room).emit('message', generateMessage(user.username, message));
    // The callback will run when the message was delivered
    //    from the frontend script (sendMessage emitter)
    // It will send the arguments back to the sendMessage emitter
    //    which will be available in the callback there
    callback();
  });

  socket.on('sendLocation', (location, callback) => {
    const { latitude, longitude } = location;

    const user = getUser(socket.id);
    console.log(user);

    io.to(user.room).emit(
      'locationMessage',
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${latitude},${longitude}`,
      ),
    );
    callback();
  });

  // Send a message when a user disconnects
  socket.on('disconnect', () => {
    // Remove the user on disconnect otherwise they will always be
    //    in the list of users after disconnecting
    const user = removeUser(socket.id);

    // Only send a message if a user was removed
    if (user) {
      io.to(user.room).emit(
        'message',
        generateMessage('Server', `${user.username} has left the room.`),
      );
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log('Server started on port', port);
});
