
var socket = io();

function HideStart() {
    $(".buttonGroup").hide();
    $(".roomNameGroup").fadeIn(1000);
}

$(function () {
    var roomName = '';
    var userName = '';
    $(".buttonGroup").fadeIn(1500);

    function sendListChanged() {
        var list = $("#list").html();
        socket.emit('listChanged', { roomName: roomName, list: list });
    }

    $('#firstCreateRoomBtn').click(function () {
        HideStart();
        $("#secondJoinRoomBtn").hide();
        $("#secondCreateRoomBtn").show();
    });

    $('#firstJoinRoomBtn').click(function () {
        HideStart();
        $("#secondJoinRoomBtn").show();
        $("#secondCreateRoomBtn").hide();
    });

    $("#secondCreateRoomBtn").click(function (e) {
        e.preventDefault();
        roomName = $("#roomName").val();
        userName = $("#userName").val();
        socket.emit('createRoom', roomName);

        socket.once('newRoom', function (roomName) {
            $("#intro").remove();
            $("#roomHeader").text(roomName).removeClass("noneDisplay");
        });

        socket.on('updateList', function (li) {
            $("#list").empty().append(li);
            Sortable.create(list, {
                onUpdate: function (/**Event*/evt) {
                    $("#list").children().removeClass("active")
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
        });

    });

    $("#secondJoinRoomBtn").click(function (e) {
        e.preventDefault();
        var name = $("#roomName").val();
        userName = $("#userName").val();
        socket.emit('joinRoom', name);
        socket.once('joinedRoom', function (li) {
            roomName = name;
            $("#intro").remove();
            console.log(li);
            $("#list").append(li);
            $("#createLiBtn").addClass("btn");
            $("#roomHeader").text(roomName).removeClass("noneDisplay");
        });

        socket.on('updateList', function (li) {
            console.log(li);
            $("#list").empty().append(li);
        });

    });

    $("#createLiBtn").click(function (e) {
        e.preventDefault();
        socket.emit('queued', {roomName: roomName, userName: userName });
    });

});
