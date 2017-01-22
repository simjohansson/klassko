var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;
app.use(express.static('public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + 'public/index.html');
});

http.listen(PORT, function () {
   console.log(`Listening on ${PORT}`); 
  });

var roomModule = require('./roomModule');

io.on('connection', function (socket) {
  console.log('a user connected');

  socket.on('disconnecting', function () {
    var roomName = Object.keys(socket.rooms)[0];
    if (roomName && roomName != socket.id) {
      var result = roomModule.leaveRoom(roomName, socket.id);
      if (typeof result === 'string') {
        switch (result) {
          case 'roomDeleted':
            io.to(roomName).emit('roomDeleted');
            break;
          case 'userRemoved':
            io.to(roomName).emit('userRemoved', socket.id);
            break;
        }
      }
    }
  });
 
  socket.on('createRoom', function (roomObject, fn) {
    if (roomModule.createRoom(roomObject, socket.id)) {
      socket.leaveAll();
      socket.join(roomObject.roomName);
      fn(roomObject);
    }
    else{
      fn('Rummet finns redan.');
    }
  });

  socket.on('joinRoom', function (roomObject, fn) {
    var room = roomModule.joinRoom(roomObject, socket.id);
    switch (room) {
      case 'roomNotExists':
        fn('Rummet kunde inte hittas.');
        break;
      case 'userNameExists':        
      fn('Användarnamnet finns redan.');
        break;
      default:
        socket.leaveAll();
        socket.join(roomObject.roomName);
        fn(room);
        break;
    }
  });

  socket.on('queued', function (roomObject) {
    var roomList = roomModule.addListItem(roomObject, socket.id)
    io.to(roomObject.roomName).emit('updateList', roomList);
  });

  socket.on('listChanged', function (roomObject) {
    if (roomModule.listChanged(roomObject)) {
      io.to(roomObject.roomName).emit('updateList', roomObject.list);
    }
  });

});
