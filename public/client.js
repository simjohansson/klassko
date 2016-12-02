
var socket = io();
$('form').submit(function () {
    socket.emit('chat message', $('#nickname').val() + $('#m').val());
    $('#m').val('');
    return false;
});
socket.on('chat message', function (msg) {
    $('#messages').append($('<li>').text(msg));
});
socket.on('nickname', function (nickname) {
    $('#nickname').val(nickname);
});
$('#m').keyup(function () {
    socket.emit('typing', nickname);
});
socket.on('typing', function (msg) {
    $('#messages').append($('<li>').text(msg));
});

function HideStart() {
    $(".buttonGroup").hide();
    $(".roomNameGroup").fadeIn(1000);
}

$(function () {
    var roomName = '';
    $(".buttonGroup").fadeIn(1500);

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
        socket.emit('createRoom', roomName);

        socket.on('newRoom', function (li) {
            $("#intro").remove();
            console.log(li);
            $("#list").append(li);
        });

        socket.on('updateList', function (li) {
            console.log(li);
            $("#list").empty().append(li);
            $("li").unbind("click");
            $("li").click(function (e) {
                e.preventDefault();
                $(e.target).remove();
                $("li").first().addClass("active");
                var list = $("#list").html();
                socket.emit('itemRemoved', { roomName: roomName, list: list });
            });
        });

    });

    $("#secondJoinRoomBtn").click(function (e) {
        e.preventDefault();
        var name = $("#roomName").val();
        socket.emit('joinRoom', name);
        socket.once('joinedRoom', function (li) {
            roomName = name;
            $("#intro").remove();
            console.log(li);
            $("#list").append(li);
            $("#createLiBtn").show();
        });

        socket.on('updateList', function (li) {
            console.log(li);
            $("#list").empty().append(li);
        });

    });

    $("#createLiBtn").click(function (e) {
        e.preventDefault();
        socket.emit('queued', roomName);
    });

});