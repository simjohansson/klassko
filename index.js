var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static('public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + 'public/index.html');
});

var roomQueue = [];

function findClientsSocketByRoomId(roomId) {
return io.sockets.adapter.rooms[roomId];
}

function getRoom(roomName) {
   return roomQueue.filter(function (room) {
        return room.Name === roomName;
      })[0];
}

io.on('connection', function (socket) {
  console.log('a user connected');
    
  socket.on('disconnect', function () {
    io.emit('chat message', 'a user disconnected');
  });

  socket.on('createRoom', function (roomName) {
    var roomExists = findClientsSocketByRoomId(roomName);
    if (!roomExists) {
      socket.leaveAll();
      socket.join(roomName);
      console.log("Created room " + roomName);
      var room = { Name: roomName, list: '' };
      roomQueue.push(room);
      io.to(roomName).emit('newRoom', roomName);
    } // Object.keys(socket.rooms)[0] Hur man får tag på roomnamnet
  });

  socket.on('joinRoom', function (roomName){
    var room = getRoom(roomName);
      
    if (room) {
      socket.leaveAll();
      socket.join(roomName);
      console.log("Joined room "+ roomName);
      io.to(roomName).emit('joinedRoom', room.list);
    } // Object.keys(socket.rooms)[0] Hur man får tag på roomnamnet
  });

  socket.on('queued', function (roomObject) {
    var room = getRoom(roomObject.roomName);
    var isActive = room.list.length == 0 ? 'active' : '';
    room.list += "<li class='list-group-item "+ isActive + "'>" + roomObject.userName + "</li>"
    io.to(roomObject.roomName).emit('updateList', room.list);
  });

  socket.on('itemRemoved', function (roomObject) {
    var room = getRoom(roomObject.roomName);
    room.list = roomObject.list;
    io.to(roomObject.roomName).emit('updateList', roomObject.list);
  });

});

http.listen(3000, function () {
  console.log('listening on *:3000');
});