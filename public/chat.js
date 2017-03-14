var port = 3000;
var socket = io.connect('http://192.168.0.102:' + port);
var electron = require('electron');
const ipcRenderer = require('electron').ipcRenderer;


$(document).ready(function () {
    var chatID;
    var userData = {
        username: electron.remote.getGlobal('user').username,
        chats: electron.remote.getGlobal('user').chats,
        isAdmin: electron.remote.getGlobal('user').isAdmin
    }
    
    function changeCurrentChat(chat) {
        console.log('Change current chat => ' + chat)
        socket.emit('getMessages', chat);
    }

    $('#chatList').on('click', function (event) {
            chatID = event.target.id;
            console.log(chatID);
            changeCurrentChat(chatID);
    });

    socket.on('getMessages', (messageData) => {
        console.log(messageData);
        $('#mainChat').children().remove();
        messageData.forEach(function (element) {
            var msg = document.createTextNode(element.from + ": " + element.message);
            var newMsg = document.createElement('li');
            newMsg.appendChild(msg);
            $('#mainChat').append(newMsg);
        });
    });

    $('#sendMsg').on('click', function () {
        var msg = $('#msg').val();
        var msgToServer = {
            message: msg,
            chatID: chatID,
            from: userData.username
        }
        socket.emit('createMessage', msgToServer);
    });



    $('#createChatBtn').on('click', function () {
        var chatData = {
            chatname: $('#createChatInput').val(),
            members: userData.username
        }
        socket.emit('createChat', chatData);
    });

    socket.emit('getChats', userData.username); //запрос на получение чатов для юзера

    socket.on('getChats', function (chatData) {
        var chats = chatData;
        for (var i = 0; i < chats.length; i++) {
            var chatName = document.createTextNode(chats[i].name);
            var newChat = document.createElement('li');
            newChat.appendChild(chatName);
            newChat.setAttribute('id', chats[i]._id);
            $('#chatList').append(newChat);
        }
    });

    socket.on('chatCreated', function (chatData) {
        var chatName = document.createTextNode(chatData.name);
        var newChat = document.createElement('li');
        newChat.appendChild(chatName);
        newChat.setAttribute('id', chatData._id);
        $('#chatList').append(newChat);

    });

    socket.on('sendMessage', function (msgData) {
        console.log(msgData);
        if (msgData.chatID == chatID) {
            var msg = document.createTextNode(msgData.from + ": " + msgData.message);
            var newMsg = document.createElement('li');
            newMsg.appendChild(msg);
            $('#mainChat').append(newMsg);
        }
    });

    socket.on('checkUserForChat', (chatData) => {
        console.log(chatData);
       chatData.members.forEach((el) => {
          if (el == userData.username) {
              var chatName = document.createTextNode(chatData.name);
              var newChat = document.createElement('li');
              newChat.appendChild(chatName);
              newChat.setAttribute('id', chatData._id);
              $('#chatList').append(newChat);
          }
       });
    });


    $('#addUserToChat').on('click', function () {
        var chat = chatID;
        var username = $('#specUserToAdd').val();
        var obj = {
            chat: chat,
            username: username
        }
        socket.emit('addMember', obj);
    });

});





/*
*TODO MAX:
1)список юзеров онлайн
2)если админ удаляет сообщения из DOM

*TODO VLAD:
1)добалвять новый чат на клиенте
2)сообщения в разные чаты
*/