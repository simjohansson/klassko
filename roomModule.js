module.exports = (function () {
    'use strict';
    var roomObjects = [];

    function getRoom(roomName) {
        return roomObjects.filter(function (room) {
            return room.name === roomName;
        })[0];
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

    function createRoom(roomName) {
        var room = getRoom(roomName);
        if (!room) {
            roomObjects.push({ name: roomName, list: [] });
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
            room.list += "<li class='list-group-item " + isActive + "'>" + userName + "</li>"
            return room.list;
        }
        else {
            return '';
        }
    }

    return {
        getRoom: getRoom,
        listChanged: listChanged,
        createRoom: createRoom,
        addListItem: addListItem
    };
} ());