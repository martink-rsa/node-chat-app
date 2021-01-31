const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');

const app = express();
const server = http.createServer(app);

const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
  // First argument ('message') is name of event that is being emitted
  // Second parameter ('Welcome!') is data being emitted
  socket.emit('message', 'Welcome!');
  console.log('New WebSocket connection');

  // broadcast.emit will send the data to all clients except the
  //    client that triggered it
  socket.broadcast.emit('message', 'A new user has joined');

  // Listen to the 'sendMessage' event that is being
  //    emitted by the front end. This message is then sent
  //    to all connected browsers using io.emit
  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed');
    }

    io.emit('message', message);
    // The callback will run when the message was delivered
    //    from the frontend script (sendMessage emitter)
    // It will send the arguments back to the sendMessage emitter
    //    which will be available in the callback there
    callback();
  });

  socket.on('sendLocation', (location, callback) => {
    const { latitude, longitude } = location;

    io.emit(
      'message',
      `User location: https://google.com/maps?q=${latitude},${longitude}`,
    );
    callback();
  });

  // Send a message when a user disconnects
  socket.on('disconnect', () => {
    io.emit('message', 'A user has disconnected');
  });
});

server.listen(port, () => {
  console.log('Server started on port', port);
});
