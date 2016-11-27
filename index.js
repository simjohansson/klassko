var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var rooms = [];
app.use(express.static('public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + 'public/index.html');
});

function findClientsSocketByRoomId(roomId) {
  var res = []
    , room = io.sockets.adapter.rooms[roomId];
  if (room) {
    for (var id in room) {
      res.push(io.sockets.adapter.nsp.connected[id]);
    }
  }
return res;
}

io.on('connection', function (socket) {
  console.log('a user connected');
    
  socket.on('disconnect', function () {
    io.emit('chat message', 'a user disconnected');
  });
  
  socket.on('chat message', function (msg) {
    if (msg.startsWith("/nick ")) {
      io.emit('nickname', msg.substr(5));
    }
    else {
      io.emit('chat message', msg);
    }
  });

  socket.on('typing', function (nickname) {
    io.emit('chat message', nickname + " is typing...");
  });

  socket.on('btnClick', function (text) {
    console.log(text);
  });

  socket.on('createRoom', function (roomName) {
    var currentRoomSockets = findClientsSocketByRoomId(roomName);
    if (currentRoomSockets.length === 0) {
      socket.leaveAll();
      socket.join(roomName);
      rooms.push(roomName);
    } // Object.keys(socket.rooms)[0] Hur man får tag på roomnamnet
  });

  socket.on('joinRoom', function (roomName){
    var room = rooms.filter(function(x){ 
      return x==='roomName';
      })[0];
      
    if (room) {
      socket.leaveAll();
      socket.join(roomName);
    } // Object.keys(socket.rooms)[0] Hur man får tag på roomnamnet
  });
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});