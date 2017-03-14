var port = 3000;
var socket = io.connect('http://192.168.0.102:' + port);
const ipcRenderer = require('electron').ipcRenderer;

$('#btn-login').on('click', function () {
    if ($('#inputLogin').val() == "" || $('#inputPassword').val() == "") {
        alert('error');
    } else {
        var userData = {
            username: document.getElementById('inputLogin').value,
            pass: document.getElementById('inputPassword').value
        }
        socket.emit('login', userData);

    }
});

function login(data) {
    require('electron').remote.getGlobal('user').username = data.username;
    require('electron').remote.getGlobal('user').chats = data.chats;
    require('electron').remote.getGlobal('user').isAdmin = data.isAdmin;
    ipcRenderer.sendSync('synchronous-message', 'ping');
}

$('#btn-reg').on('click', function () {
    var userData = {
        username: document.getElementById('regLog').value,
        pass: document.getElementById('regPass').value
    }
    socket.emit('createUser', userData);
});


$('#confPass').on("input propertychange", function () {
    if ($('#regPass').val() == $('#confPass').val()) {
        $('#ok-valid').show('fast');
        $("#btn-reg").prop("disabled", false);
    } else {
        $('#ok-valid').hide('fast');
        $("#btn-reg").prop("disabled", true);
    }
});

$('#switch').on('click', function () {
    if ($('#login').css('display') == 'block') {
        $('#login').hide('slow');
        $('#registration').show('slow');
    } else {
        $('#registration').hide('slow');
        $('#login').show('slow');
    }
})


socket.on('login', function (userData) {
    if (userData) {
        login(userData);
    } else {
        alert('Error!');
    }
});

socket.on('createUser', function (userData) {
    if (userData) {
        login(userData);
    } else {
        alert("Some errr!");
    }

});