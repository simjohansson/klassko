module.exports = (function () {
    'use strict';
    var roomObjects = [];

    function getRoom(roomName) {
        return roomObjects.filter(function (room) {
            return room.name === roomName;
        })[0];
    }

    function joinRoom(roomObject, socketId) {
        var room = getRoom(roomObject.roomName);
        if (!room) {
            return "roomNotExists";
        }

        var user = room.users.filter(function (user) {
            return roomObject.userName === user.name
        })[0];

        if (user) {
            return "userNameExists";
        }
        else {
            room.users.push({ name: roomObject.userName, id: socketId });
            return room;
        }
    }

    function listChanged(roomObject) {
        var room = getRoom(roomObject.roomName);
        if (room) {
            room.list = roomObject.list;
            return true;
        }
        else {
            return false;
        }
    }

    function createRoom(roomObject, socketId) {
        var room = getRoom(roomObject.roomName);
        if (!room) {
            roomObjects.push({ name: roomObject.roomName, list: [], users: [{ name: roomObject.userName, id: socketId }], roomCreator: socketId });
            return true;
        }
        else {
            return false;
        }
    }

    function addListItem(roomObject, socketId) {
        var room = getRoom(roomObject.roomName);
        if (room) {
            var isActive = room.list.length == 0 ? 'active' : '';
            room.list += "<li id='"+ socketId +"' class='list-group-item " + isActive + "'>" + roomObject.userName + "<button type='button' class='close' aria-label='Close'><span aria-hidden='true'>&times;</span></button></li>"
            return room.list;
        }
        else {
            return '';
        }
    }

    function leaveRoom(roomName, socketId) {
        var room = getRoom(roomName);
        if (room) {
            if (room.roomCreator == socketId) {
               return deleteRoom(roomName) ? "roomDeleted" : false;
            }
            else {
                var oldSize = room.users.length;
                room.users = room.users.filter(function (user) {
                    return user.id !== socketId;
                });
                return oldSize > roomObjects.length ? "userRemoved" : false;
            }
        }
        else {
            return false;
        }
    }

    function deleteRoom(roomName) {
        var oldSize = roomObjects.length;
        roomObjects = roomObjects.filter(function (room) {
            return room.name !== roomName;
        });
        return oldSize > roomObjects.length;
    }

    return {
        listChanged: listChanged,
        createRoom: createRoom,
        addListItem: addListItem,
        joinRoom: joinRoom,
        leaveRoom: leaveRoom
    };
} ());