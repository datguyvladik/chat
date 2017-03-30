$(document).ready(function () {
    let config = require('../config');
    let port = config.port;
    let socket = io.connect(config.host + port);
    let electron = require('electron');
    let ipcRenderer = require('electron').ipcRenderer;
    let chatID;
    let peer = new Peer({key: '66vri13tx0spp66r'});

    let userData = {
        username: electron.remote.getGlobal('user').username,
        chats: electron.remote.getGlobal('user').chats,
        isAdmin: electron.remote.getGlobal('user').isAdmin
    };

    peer.on('open', function(){
        $('#my-id').text(peer.id);
        socket.emit('peerSend', {username: userData.username, peerID: peer.id});
    });

    // Receiving a call
    peer.on('call', function(call){
        // Answer the call automatically (instead of prompting user) for demo purposes
        call.answer(window.localStream);
        step3(call);
    });
    peer.on('error', function(err){
        alert(err.message);
        // Return to step 2 if error occurs
        step2();
    });

    $(function(){
        $('#make-call').click(function(){
            // Initiate a call!
            var call = peer.call($('#callto-id').val(), window.localStream);

            step3(call);
        });

        $('#end-call').click(function(){
            window.existingCall.close();
            step2();
        });

        // Retry if getUserMedia fails
        $('#step1-retry').click(function(){
            $('#step1-error').hide();
            step1();
        });

        // Get things started
        step1();
    });

    function step1 () {
        // Get audio/video stream
        navigator.getUserMedia({audio: true, video: true}, function(stream){
            // Set your video displays
            $('#my-video').prop('src', URL.createObjectURL(stream));

            window.localStream = stream;
            step2();
        }, function(){ $('#step1-error').show(); });
    }

    function step2 () {
        $('#step1, #step3').hide();
        $('#step2').show();
    }

    function step3 (call) {
        // Hang up on an existing call if present
        if (window.existingCall) {
            window.existingCall.close();
        }

        // Wait for stream on the call, then set peer video display
        call.on('stream', function(stream){
            $('#their-video').prop('src', URL.createObjectURL(stream));
        });

        // UI stuff
        window.existingCall = call;
        $('#their-id').text(call.peer);
        call.on('close', step2);
        $('#step1, #step2').hide();
        $('#step3').show();
    }

ipcRenderer.on('before-close', () => {
    socket.emit('disconnectMe', userData.username);
    ipcRenderer.send('closed');
});

socket.on('connect', () => {
    if (socket.connected) {
        // socket.username = userData.username;
        socket.emit('isOnline', {
            username: userData.username,
            status: true
        });
    }
});

function changeCurrentChat(chat) {
    console.log('Change current chat => ' + chat);
    socket.emit('getMessages', chat);
    socket.emit('getUsers', chat);
}


function eventListener(event) {
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
        addUser.onclick = () => {
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
        var msg = '<li>' + element.from + ":" + element.message + "</li>";
        $('#mainChat').append(msg);
    });
});

$('#sendMsg').on('click', function () {
    var msg = $('#msg').html();
    var msgToServer = {
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

$('#smile').on('click', function () {
    if ($('#emoticonMenu').hasClass('hidden')) {
        $('#emoticonMenu').removeClass('hidden');
    } else {
        $('#emoticonMenu').addClass('hidden');
    }

});

$("#emoticonMenu span").on('click', function (event) {
    var smile = event.target;
    $(smile).clone().appendTo('#msg');
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
    if (msgData.chatID == chatID) {
        var msg = '<li>' + msgData.from + ": " + msgData.message + '</li>';
        $('#mainChat').append(msg);
    }
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

socket.on('userExsist', function (data) {
    console.log('Cant add user');
});


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
    let userList = $('#userList');
    userList.children().remove();
    members.forEach((user) => {
        let container = document.createElement('div');
        container.style.color = 'white';
        container.setAttribute('id', user.username);
        let userBlock = document.createElement('span');
        userBlock.classList = 'fa fa-user-secret';
        userBlock.innerHTML = user.username;
        userBlock.setAttribute('data-peer', user.peer);
        if (user.isOnline) {
            container.style.color = 'green';
        }
        container.appendChild(userBlock);
        userList.append(container);
    });
});


socket.on('addMember', function () {
    console.log('Cant find user');
});

socket.on('userDisconnected', (user) => {
    $('#' + user).css('color', 'white');
});

socket.on('userConnected', (user) => {
    $('#' + user).css('color', 'green');
});


/////////////
})
;