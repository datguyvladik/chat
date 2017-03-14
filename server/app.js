var express = require('express');
var http = require('http');
var path = require('path');
var config = require('./config');
var mongoose = require('./lib/mongoose');
var app = express();
var db = require('./createDb');
var log4js = require('log4js');
var logger = log4js.getLogger();






var server = http.createServer(app);
server.listen(config.get('port'), function () {
  console.log('Express server listening on port ' + config.get('port'));
});

var io = require('socket.io').listen(server);

io.on('connection', function (socket) {


  socket.on('createUser', function (userData) { //запрос на регистрацию
    db.createUser(userData.username, userData.pass).then(function (data) {
      socket.emit('createUser', data);
      logger.info('User Created! \n' + 'User name: ' + data.username);
    });
  });

  socket.on('login', function (userData) { //запрос на логин
    db.login(userData.username, userData.pass).then(function (data) {
      socket.emit('login', data);
      logger.info('User Connected! \n' + 'User name: ' + data.username);
    });
  });



  socket.on('createMessage', function (messageData) { //запрос на сообщение 
    db.createMessage(messageData.message, messageData.chatID, messageData.from).then(function (data) {
      io.sockets.emit('sendMessage', data);
      logger.info('New Message from: ' + data.from + " In chat: " + data.chatID + " Message: " + data.message);
    });
  });

  socket.on('createChat', function(chatData){ //создать чат
    db.createChat(chatData.chatname,chatData.members).then(function(chatData){
      socket.emit('chatCreated',chatData);
      logger.info('New chat created! Chat name: '+chatData.chatname+" Members: "+ chatData.members);
    }); 
  });

  socket.on('getChats',function (username) {
    db.getChatDataforUser(username).then(function(chatData){
      socket.emit('getChats',chatData);
    });
  });

  socket.on('getMessages' , function(chatName) {
    db.getMessages(chatName).then(function(messageData) {
      socket.emit('getMessages',messageData);
    })
  });

  socket.on('addMember', (data) => {
    db.addMember(data.chat, data.username)
        .then(
        (data) => {
          io.sockets.emit('checkUserForChat',data);
        }
    );
  });


});