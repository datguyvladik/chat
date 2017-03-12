/**
 * Created by maximpoleley on 12/03/2017.
 */
var port = 3000;
var socket = io.connect('http://localhost:' + port);
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