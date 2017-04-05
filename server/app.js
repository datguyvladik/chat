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
var dl = require('delivery');
var fs = require('fs');
server.listen(config.get('port'), function () {
  console.log('Express server listening on port ' + config.get('port'));
});

var io = require('socket.io').listen(server);
var onlineUsers = [];
var peerList = [];
io.on('connection', function (socket) {
  var delivery = dl.listen(socket);
  
  socket.on('peerSend', function (data) {
    peerList.forEach(function (element) {
      if (element.username == data.username) {
        element = data;
      }
    });
    peerList.push(data);
  });

  socket.on('createUser', function (userData) { //запрос на регистрацию
    db.createUser(userData.username, userData.pass).then(function (data) {
      socket.emit('createUser', data);
      logger.info('User Created! \n' + 'User name: ' + data.username);
    });
  });

  socket.on('login', function (userData) { //запрос на логин
    onlineUsers.push(userData.username);
    db.login(userData.username, userData.pass).then(function (data) {
      socket.emit('login', data);
      socket.broadcast.emit('userConnected', data.username);
      logger.info('User Connected! \n' + 'User name: ' + data.username);
    });
  });

  socket.on('userExist', function (user) {
     db.findUser(user).then(function (data) {
         socket.emit('userExist', data);
     })
  });


  socket.on('createMessage', function (messageData) { //запрос на сообщение 
    db.createMessage(messageData.message, messageData.chatID, messageData.from).then(function (data) {
      io.sockets.emit('sendMessage', data);
      logger.info('New Message from: ' + data.from + " In chat: " + data.chatID + " Message: " + data.message);
    });
  });

  socket.on('createChat', function (chatData) { //создать чат
    db.createChat(chatData.chatname, chatData.members).then(function (chatData) {
      socket.emit('chatCreated', chatData);
      logger.info('New chat created! Chat name: ' + chatData[0].name + " Members: " + chatData[0].members);
    });
  });

  socket.on('getChats', function (username) {
    db.getChatDataforUser(username).then(function (chatData) {
      socket.emit('getChats', chatData);
    });
  });

  socket.on('getMessages', function (chatName) {
    db.getMessages(chatName).then(function (messageData) {
      socket.emit('getMessages', messageData);
    })
  });

  socket.on('addMember', (data) => {
    db.findUser(data.username).then(function (user) {
      if (user) {
        db.getChatData(data.chat).then(function (chatData) {
          if (chatData.members.includes(data.username)) {
            logger.info('User ' + data.username + ' already exsists in chat ' + data.chat);
            socket.emit('userExsist', null);
          } else {
            db.addMember(data.chat, data.username).then(function (chatData) {
              logger.info('User ' + data.username + ' added to chat ' + chatData[0].name)
              socket.broadcast.emit('checkUserForChat', chatData);
              socket.emit('closeModal', null);
            });
          }
        });
      } else {
        socket.emit('addMember', null);
      }
    })
  });

  function findPeer(username) {
    peerList.forEach(function (element) {
      if (element.username == username) {
        this.peerID = element.peerID;
        return peerID
      } else {
        return null;
      }
    });
    return this.peerID;
  }

  socket.on('getUsers', (data) => {
    db.getChatData(data).then(function (chatData) {
      let parsedMembers = [];
      chatData.members.forEach((member) => {
        let peerID = findPeer(member);
        if (onlineUsers.includes(member)) {
          let memberObj = {
            username: member,
            isOnline: true,
            peer: findPeer(member)
          };
          parsedMembers.push(memberObj);
        } else {
          let memberObj = {
            username: member,
            isOnline: false
          };
          parsedMembers.push(memberObj);
        }
      });
      socket.emit('getUsers', parsedMembers);
    })
  });

  socket.on('isOnline', (state) => {
    // logger.info(state);
  });
  socket.on('disconnectMe', (user) => {
    logger.info('User ' + user + ' disconnected');
    onlineUsers.splice(onlineUsers.indexOf(user), 1);
    socket.broadcast.emit('userDisconnected', user);
  });



  delivery.on('receive.success', function (file) {  
      io.sockets.emit('imgFromServer', file.data);
  });

  /////////////
});