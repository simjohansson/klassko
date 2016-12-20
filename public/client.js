$(function () {
    var socket = io();

    function HideStart() {
        $(".buttonGroup").hide();
        $(".roomNameGroup").fadeIn(1000);
    }

    var createRoomModule = (function () {
        'use strict';
        var roomName = '';
        var userName = '';

        function init() {
            $('#firstCreateRoomBtn').click(firstCreateClicked);
            $("#secondCreateRoomBtn").click(secondCreateClicked);
        }

        function firstCreateClicked() {
            HideStart();
            $("#secondJoinRoomBtn").hide();
            $("#secondCreateRoomBtn").show();
        }

        function secondCreateClicked(e) {
            e.preventDefault();
            roomName = $("#roomName").val();
            userName = $("#userName").val();
            socket.emit('createRoom', roomName);
            socket.once('newRoom', newRoomFromSocket);
            socket.on('updateList', updateListFromSocket);
        }

        function newRoomFromSocket(roomName) {
            $("#intro").remove();
            $("#roomHeader").text(roomName).removeClass("noneDisplay");
        }

        function updateListFromSocket(li) {
            $("#list").empty().append(li);
            $("#list").children().removeClass("noneDisplay");
            Sortable.create(list, {
                onUpdate: function (/**Event*/evt) {
                    $("#list").children().removeClass("active");
                    $("li").first().addClass("active");
                    sendListChanged();
                }
            });
            $("li").unbind("click");
            $("li").click(function (e) {
                e.preventDefault();
                $(e.target).remove();
                $("li").first().addClass("active");
                sendListChanged();
            });
        }

        function sendListChanged() {
            var list = $("#list").html();
            socket.emit('listChanged', { roomName: roomName, list: list });
        }

        return {
            init: init
        };
    } ());

    var joinRoomModule = (function () {
        'use strict';
        var roomName = '';
        var userName = '';

        function init() {
            $('#firstJoinRoomBtn').click(firstJoinClicked);
            $("#secondJoinRoomBtn").click(secondJoinClicked);
        }

        function firstJoinClicked() {
            HideStart();
            $("#secondJoinRoomBtn").show();
            $("#secondCreateRoomBtn").hide();
            $("#createLiBtn").click(createListItem);
        }

        function secondJoinClicked(e) {
            e.preventDefault();
            roomName = $("#roomName").val();
            userName = $("#userName").val();
            socket.emit('joinRoom', roomName);
            socket.once('joinedRoom', joinedRoomFromSocket);
            socket.on('updateList', updateListFromSocket);
        }

        function joinedRoomFromSocket(li) {
            $("#intro").remove();
            $("#list").append(li);
            $("#createLiBtn").addClass("btn");
            $("#roomHeader").text(roomName).removeClass("noneDisplay");
        }

        function updateListFromSocket(li) {
            $("#list").empty().append(li);
        }

        function createListItem(e) {
            e.preventDefault();
            socket.emit('queued', { roomName: roomName, userName: userName });
        }
        
        function sendListChanged() {
            var list = $("#list").html();
            socket.emit('listChanged', { roomName: roomName, list: list });
        }

        return {
            init: init
        };
    } ());

    $(".buttonGroup").fadeIn(1500);
    createRoomModule.init();
    joinRoomModule.init();
});
