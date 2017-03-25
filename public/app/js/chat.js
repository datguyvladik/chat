$(document).ready(function () {
    let config = require('../config');
    let port = config.port;
    let socket = io.connect(config.host + port);
    let electron = require('electron');
    let ipcRenderer = require('electron').ipcRenderer;
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

            let contatiner = document.createElement('div');
            contatiner.classList = 'chat';

            let chatName = document.createElement('span');
            chatName.setAttribute('id', chat._id);
            chatName.innerHTML = chat.name;
            chatName.style.display = 'inline-block';
            contatiner.appendChild(chatName);

            let addUser = document.createElement('button');
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
        let mainChat = $('#mainChat');
        console.log(messageData);
        mainChat.children().remove();
        messageData.forEach(function (element) {
            let msg = document.createTextNode(element.from + ": " + element.message);
            let newMsg = document.createElement('li');
            newMsg.appendChild(msg);
            mainChat.append(newMsg);
        });
    });

    $('#sendMsg').on('click', function () {
        let msg = $('#msg').val();
        let msgToServer = {
            message: msg,
            chatID: chatID,
            from: userData.username
        }
        socket.emit('createMessage', msgToServer);
    });



    $('#createChatBtn').on('click', function () {
        let chatData = {
            chatname: $('#createChatInput').val(),
            members: userData.username
        };
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
            let msg = document.createTextNode(msgData.from + ": " + msgData.message);
            let newMsg = document.createElement('li');
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
        let chat = chatID;
        let username = $('#specUserToAdd').val();
        let obj = {
            chat: chat,
            username: username
        };
        socket.emit('addMember', obj);
        $('#addUser').modal('hide');
        socket.emit('getUsers', chat);
    });


    socket.on('getUsers', function (members) {
        let userList =$('#userList');
            userList.children().remove();
        members.forEach((user)=>{
           let container = document.createElement('div');
           container.style.color = 'white';
           container.setAttribute('id', user.username);
           let userBlock = document.createElement('span');
           userBlock.classList = 'fa fa-user-secret';
           userBlock.innerHTML = user.username;
           if(user.isOnline){
               container.style.color = 'green';
           }
           container.appendChild(userBlock);
           userList.append(container);
        });
    });


    socket.on('addMember',function () {
        console.log('Cant find user');
    });

    socket.on('userDisconnected', (user) => {
        $('#' + user).css('color', 'white');
    });

    socket.on('userConnected', (user) =>{
        $('#' + user).css('color', 'green');
    });



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