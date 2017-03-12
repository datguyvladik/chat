var port = 3000;
var socket = io.connect('http://192.168.0.101:' + port);
var electron = require('electron');
const ipcRenderer = require('electron').ipcRenderer;

$(document).ready(function () {
   var chatID = 'generalChat';
   var userData = {
       username: electron.remote.getGlobal('user').username,
       chats: electron.remote.getGlobal('user').chats,
       isAdmin: electron.remote.getGlobal('user').isAdmin
   }

   $('#sendMsg').on('click', function () {
      var msg = $('#msg').val();
      var msgToServer = {
          message: msg,
          chatID: chatID,
          from: userData.username
      }
      socket.emit('createMessage', msgToServer);
   });

   socket.on('sendMessage', function (msgData) {

       var msg = document.createTextNode(msgData.from + ": " + msgData.message);
       var newMsg = document.createElement('li');
       newMsg.appendChild(msg);
       $('#'+chatID).append(newMsg);
   })
});

/*
*TODO MAX:
1)список юзеров онлайн
2)если админ удаляет сообщения из DOM

*TODO VLAD:
1)добалвять новый чат на клиенте
2)сообщения в разные чаты
*/