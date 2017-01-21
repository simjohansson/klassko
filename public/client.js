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
            socket.emit('createRoom', {roomName: roomName, userName: userName}, newRoomFromSocket);
            socket.on('updateList', updateListFromSocket);
        }

        function newRoomFromSocket(result) {
            if (typeof result !== 'string') {
                $("#intro").remove();
                $("#roomHeader").text(result.roomName).removeClass("noneDisplay");
            }
            else {                
                $(".alert").remove();
                $("#connectBtnDiv").append("<div class='alert alert-danger'>" + result + "</div>")
            }
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
            socket.emit('joinRoom', {roomName: roomName, userName: userName}, joinedRoomFromSocket);
            socket.on('updateList', updateListFromSocket);
        }

        function joinedRoomFromSocket(result) {
            if (typeof result !== 'string') {
                $("#intro").remove();
                $("#list").append(result.list);
                $("#createLiBtn").addClass("btn");
                $("#roomHeader").text(result.name).removeClass("noneDisplay");
            }
            else {
                $(".alert").remove();
                $("#connectBtnDiv").append("<div class='alert alert-danger'>" + result + "</div>")
            }
        }

        function updateListFromSocket(li) {
            $("#list").empty().append(li);
            if ($("#" + userName).length == 0) {
                $("#createLiBtn").prop('disabled', false);
                $("#createLiBtn").removeAttr("title");
            }
            else {
                $("#createLiBtn").prop('disabled', true);
                $("#createLiBtn").attr('title', 'Du står redan i kö');

            }
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
