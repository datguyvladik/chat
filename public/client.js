var port = 3000;
var socket = io.connect('http://localhost:' + port);

function send() {
    // Handler for .ready() called.

   var users = {
       username: document.getElementById('userName').value,
       pass: document.getElementById('pass').value
    }
    socket.emit('fillUsers', users);

};

socket.on('res', function (data) {
    console.log(data);
});

