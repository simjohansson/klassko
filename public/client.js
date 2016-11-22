
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
        socket.emit('createRoom', $("#roomName").val());
    });
});