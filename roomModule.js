module.exports = (function () {
    'use strict';
    var roomObjects = [];

    function getRoom(roomName) {
        return roomObjects.filter(function (room) {
            return room.name === roomName;
        })[0];
    }

    function joinRoom(roomObject) {
        var room = getRoom(roomObject.roomName);
        if (!room) {            
            return "roomNotExists";
        }
        else if(room.users.indexOf(roomObject.userName) !== -1) {
            return "userNameExists";
        }
        else{
            room.users.push(roomObject.userName);
            return room;
        }
    }

    function listChanged(roomName, list) {
        var room = getRoom(roomName);
        if (room) {
            room.list = list;
            return true;
        }
        else {
            return false;
        }
    }

    function createRoom(roomObject) {
        var room = getRoom(roomObject.roomName);
        if (!room) {
            roomObjects.push({ name: roomObject.roomName, list: [], users: [roomObject.userName] });
            return true;
        }
        else {
            return false;
        }
    }

    function addListItem(roomName, userName) {
        var room = getRoom(roomName);
        if (room) {
            var isActive = room.list.length == 0 ? 'active' : '';
            room.list += "<li id='"+ userName +"' class='list-group-item " + isActive + "'>" + userName + "<button type='button' class='close' aria-label='Close'><span aria-hidden='true'>&times;</span></button></li>"
            return room.list;
        }
        else {
            return '';
        }
    }

    return {
        listChanged: listChanged,
        createRoom: createRoom,
        addListItem: addListItem,
        joinRoom: joinRoom
    };
} ());