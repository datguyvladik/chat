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

    $('#chatList').on('click', function (e) {
        e = e || window.event;
        var el = e.target || e.srcElement;
        chatID = el.id + 'Chat';
        var chatWindow = document.getElementById('generalChat');
        chatWindow.setAttribute('id', chatID);
        console.log(chatWindow);
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
            newChat.setAttribute('id', chats[i].name);
            $('#chatList').append(newChat);
        }
    });

    socket.on('chatCreated', function (chatData) {
        var chatName = document.createTextNode(chatData.name);
        var newChat = document.createElement('li');
        newChat.appendChild(chatName);
        newChat.setAttribute('id', chatData.name);
        $('#chatList').append(newChat);

    });

    socket.on('sendMessage', function (msgData) {
        if (msgData.chatID == chatID) {
            var msg = document.createTextNode(msgData.from + ": " + msgData.message);
            var newMsg = document.createElement('li');
            newMsg.appendChild(msg);
            $('#' + chatID).append(newMsg);
        }
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