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

  socket.on('disconnect', function () {
    io.emit('chat message', 'a user disconnected');
  });

  socket.on('createRoom', function (roomObject, fn) {
    if (!io.sockets.adapter.rooms[roomObject.roomName] && roomModule.createRoom(roomObject)) {
      socket.leaveAll();
      socket.join(roomObject.roomName);
      fn(roomObject);
    }
    else{
      fn('Rummet finns redan.');
    }
  });

  socket.on('joinRoom', function (roomObject, fn) {
    var room = roomModule.joinRoom(roomObject);
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
    var roomList = roomModule.addListItem(roomObject.roomName, roomObject.userName)
    io.to(roomObject.roomName).emit('updateList', roomList);
  });

  socket.on('listChanged', function (roomObject) {
    if (roomModule.listChanged(roomObject.roomName, roomObject.list)) {
      io.to(roomObject.roomName).emit('updateList', roomObject.list);
    }
  });

});
