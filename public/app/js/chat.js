var config = require('../config');

var port = config.port;
var socket = io.connect(config.host + port);
var electron = require('electron');
const ipcRenderer = require('electron').ipcRenderer;


$(document).ready(function () {
    let chatID;
    let userData = {
        username: electron.remote.getGlobal('user').username,
        chats: electron.remote.getGlobal('user').chats,
        isAdmin: electron.remote.getGlobal('user').isAdmin
    };


    ipcRenderer.on('before-close', () =>{
       socket.emit('disconnectMe', userData.username);
       ipcRenderer.send('closed');
    });

    socket.on('connect', () => {
        if(socket.connected){
           // socket.username = userData.username;
            socket.emit('isOnline', {username: userData.username, status: true});
        }
    });

    function changeCurrentChat(chat) {
        console.log('Change current chat => ' + chat)
        socket.emit('getMessages', chat);
        socket.emit('getUsers', chat);
    }


    function eventListener (event) {
        chatID = event.target.id;
        console.log(chatID);
        changeCurrentChat(chatID);
    }


    function createChat(chatData) {
        chatData.forEach((chat) => {

            var contatiner = document.createElement('div');
            contatiner.classList = 'chat';

            var chatName = document.createElement('span');
            chatName.setAttribute('id', chat._id);
            chatName.innerHTML = chat.name;
            chatName.style.display = 'inline-block';
            contatiner.appendChild(chatName);

            var addUser = document.createElement('button');
            addUser.className = 'fa fa-plus';
            addUser.onclick = () =>{
                $('#addUser').modal('toggle');
            };
            contatiner.appendChild(addUser);
            chatName.addEventListener('click', eventListener);
            $('#chatList').append(contatiner);

        });
    }

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
       createChat(chatData);
    });

    socket.on('chatCreated', function (chat) {
      createChat(chat);
        $('#myModal').modal('hide');
    });

    socket.on('sendMessage', function (msgData) {
            var msg = document.createTextNode(msgData.from + ": " + msgData.message);
            var newMsg = document.createElement('li');
            newMsg.appendChild(msg);
            $('#mainChat').append(newMsg);
    });

    socket.on('checkUserForChat', (chatData) => {
       if (chatData != null) {
           chatData[0].members.forEach((el) => {
               if (el == userData.username) {
                   createChat(chatData);
               }
           });
       } else {
           alert('Error cant add user');
       }
    });

    socket.on('userExsist',function (data) {
        console.log('Cant add user');
    })


    $('#addUserToChat').on('click', function () {
        var chat = chatID;
        var username = $('#specUserToAdd').val();
        var obj = {
            chat: chat,
            username: username
        }
        socket.emit('addMember', obj);
        $('#addUser').modal('hide');
        socket.emit('getUsers', chat);
    });


    socket.on('getUsers', function (members) {
        $('#userList').children().remove();
        members.forEach((user)=>{
           var container = document.createElement('div');
           container.style.color = 'white';
           var userBlock = document.createElement('span');
           userBlock.classList = 'fa fa-user-secret';
           userBlock.innerHTML = user;
           container.appendChild(userBlock);
           $('#userList').append(container);
        });
    })


    socket.on('addMember',function () {
        console.log('Cant find user');
    })



/////////////
});



/*
*TODO MAX:
1)список юзеров онлайн
2)если админ удаляет сообщения из DOM

*TODO VLAD:
1)добалвять новый чат на клиенте
2)сообщения в разные чаты
*/