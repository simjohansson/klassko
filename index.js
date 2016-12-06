var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static('public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + 'public/index.html');
});

var roomModule = require('./roomModule');

io.on('connection', function (socket) {
  console.log('a user connected');

  socket.on('disconnect', function () {
    io.emit('chat message', 'a user disconnected');
  });

  socket.on('createRoom', function (roomName) {
    if (!io.sockets.adapter.rooms[roomName] && roomModule.createRoom(roomName)) {
      socket.leaveAll();
      socket.join(roomName);
      io.to(roomName).emit('newRoom', roomName);
    }
  });

  socket.on('joinRoom', function (roomName) {
    var room = roomModule.getRoom(roomName);
    if (room) {
      socket.leaveAll();
      socket.join(roomName);
      io.to(roomName).emit('joinedRoom', room.list);
    } // Object.keys(socket.rooms)[0] Hur man får tag på roomnamnet
  });

  socket.on('queued', function (roomObject) {
    var roomList = roomModule.addListItem(roomObject.roomName, roomObject.userName)
    io.to(roomObject.roomName).emit('updateList', roomList);
  });

  socket.on('listChanged', function (roomObject) {
    if (roomModule.listChanged(roomObject.roomName, roomObject.list)) {
      io.to(roomObject.roomName).emit('updateList', roomObject.list);
    }
  });

});

http.listen(3000, function () {
  console.log('listening on *:3000');
});