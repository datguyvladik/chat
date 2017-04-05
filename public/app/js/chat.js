$(document).ready(function () {
    let config = require('../config');
    let port = config.port;
    let socket = io.connect(config.host + port);
    let electron = require('electron');
    let dl = require('delivery');
    let delivery = dl.listen(socket);
    let ipcRenderer = require('electron').ipcRenderer;
    var remote = require('electron').remote;
    var windowManager = remote.require('electron-window-manager');
    let chatID;
    let fileID;
    let peer = new Peer({
        key: '66vri13tx0spp66r'
    });

    let userData = {
        username: electron.remote.getGlobal('user').username,
        chats: electron.remote.getGlobal('user').chats,
        isAdmin: electron.remote.getGlobal('user').isAdmin
    };

    peer.on('open', function () {
        $('#my-id').text(peer.id);
        socket.emit('peerSend', {
            username: userData.username,
            peerID: peer.id
        });
    });

    // Receiving a call
    peer.on('call', function (call) {
        // Answer the call automatically (instead of prompting user) for demo purposes
        call.answer(window.localStream);
        step3(call);
    });
    peer.on('error', function (err) {
        alert(err.message);
        // Return to step 2 if error occurs
        step2();
    });

    $(function () {
        $('#make-call').click(function () {
            // Initiate a call!
            var call = peer.call($('#callto-id').val(), window.localStream);

            step3(call);
        });

        $('#end-call').click(function () {
            window.existingCall.close();
            step2();
        });

        // Retry if getUserMedia fails
        $('#step1-retry').click(function () {
            $('#step1-error').hide();
            step1();
        });

        // Get things started
        step1();
    });

    function step1() {
        // Get audio/video stream
        navigator.getUserMedia({
            audio: true,
            video: true
        }, function (stream) {
            // Set your video displays
            $('#my-video').prop('src', URL.createObjectURL(stream));

            window.localStream = stream;
            step2();
        }, function () {
            $('#step1-error').show();
        });
    }

    function step2() {
        $('#step1, #step3').hide();
        $('#step2').show();
    }

    function step3(call) {
        // Hang up on an existing call if present
        if (window.existingCall) {
            window.existingCall.close();
        }

        // Wait for stream on the call, then set peer video display
        call.on('stream', function (stream) {
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
        $('#' + chatID).removeClass('active');
        chatID = event.currentTarget.id;
        let chat = event.currentTarget;
        $(chat).addClass('active');
        changeCurrentChat(chatID);
    }


    function createChat(chatData) {
        chatData.forEach((chat) => {

            let contatiner = document.createElement('div');
            contatiner.classList = 'chat';

            let chatName = document.createElement('span');
            contatiner.setAttribute('id', chat._id);
            chatName.innerHTML = chat.name;
            chatName.style.display = 'inline-block';
            contatiner.appendChild(chatName);

            let addUser = document.createElement('button');
            addUser.className = 'fa fa-plus';
            addUser.onclick = () => {
                $('#addUser').modal('toggle');
            };
            contatiner.appendChild(addUser);
            contatiner.addEventListener('click', eventListener);
            $('#chatList').append(contatiner);

        });
    }

    socket.on('getMessages', (messageData) => {
        console.log(messageData);
        $('#mainChat').children().remove();
        messageData.forEach(function (element) {
            if(element.from === userData.username){
                var msg = '<li class="msg-user">' + element.message + "</li>";
                $('#mainChat').append(msg);
                var chatContainer = $('.send-control');
                chatContainer.scrollTop(chatContainer[0].scrollHeight);
            } else {
                var msg = '<li class="msg-recived">' + element.from + ":" + element.message + "</li>";
                $('#mainChat').append(msg);
                var chatContainer = $('.send-control');
                chatContainer.scrollTop(chatContainer[0].scrollHeight);
            }
        });
    });

    $(document).keypress((e) =>{
       if(e.which === 13){
           e.preventDefault();
           var messageBox = $('#msg');
           var msg = messageBox.html();
           var msgToServer = {
               message: msg,
               chatID: chatID,
               from: userData.username
           }
           socket.emit('createMessage', msgToServer);
           var chatContainer = $('.send-control');
           chatContainer.scrollTop(chatContainer[0].scrollHeight);
           messageBox.html('');
       }
    });


    $('#createChatBtn').on('click', function () {
        let chatData = {
            chatname: $('#createChatInput').val(),
            members: userData.username
        };
        socket.emit('createChat', chatData);
    });

    $('#smile').on('click', function () {
        let emojiMenu = $('#emoticonMenu');
        if (emojiMenu.hasClass('hidden')) {
            emojiMenu.removeClass('hidden');
            let emojiPosition = getEmojiMenuPositon();
            emojiMenu.css('position', 'absolute');
            emojiMenu.css('top', emojiPosition.top);
            emojiMenu.css('right', emojiPosition.right);

        } else {
            $('#emoticonMenu').addClass('hidden');
        }

    });

    $("#emoticonMenu span").on('click', function (event) {
        var smile = event.target;
        $(smile).clone().appendTo('#msg');
        $('#emoticonMenu').addClass('hidden');
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
            if(msgData.from === userData.username){
                var msg = '<li class="msg-user">' + msgData.message + '</li>';
                $('#mainChat').append(msg);
                var chatContainer = $('.send-control');
                chatContainer.scrollTop(chatContainer[0].scrollHeight);
            }else {
                var msg = '<li>' + msgData.from + ": " + msgData.message + '</li>';
                $('#mainChat').append(msg);
                var chatContainer = $('.send-control');
                chatContainer.scrollTop(chatContainer[0].scrollHeight);
            }

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
            container.appendChild(userBlock);
            if (user.isOnline) {
                container.style.color = 'green';
                let callBtn = document.createElement('button');
                callBtn.classList.add('peer-call');
                callBtn.innerHTML = 'Call';
                callBtn.addEventListener('click', function () {
                   var callWindow = windowManager.createNew('Call', 'Call me maybe');
                   callWindow.open();
                });
                container.appendChild(callBtn);
            }
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

    var dropZone = $('#msg'),
        maxFileSize = 1000000; // максимальный размер файла - 1 мб.
    if (typeof (window.FileReader) == 'undefined') {
        dropZone.text('Не поддерживается браузером!');
        dropZone.addClass('error');
    }

    dropZone[0].ondragover = function () {
        dropZone.addClass('hover');
        return false;
    };

    dropZone[0].ondragleave = function () {
        dropZone.removeClass('hover');
        return false;
    };

    dropZone[0].ondrop = function (event) {
        event.preventDefault();
        dropZone.removeClass('hover');
        dropZone.addClass('drop');
        var file = event.dataTransfer.files[0];
        if (file.size > maxFileSize) {
            dropZone.text('Файл слишком большой!');
            dropZone.addClass('error');
            return false;
        }
        delivery.send({
            name: file.name,
            path: file.path
        });
        delivery.on('send.success', function (fileUID) {
            console.log("file was successfully sent.");
        });
    };



    socket.on('imgFromServer', (file) => {
        var img = document.createElement('img');
        img.setAttribute('src','data:image/png;base64,' + file);
        var imgDom = document.createElement('li');
        imgDom.classList = 'imgDom';
        $(imgDom).append(img);
        $('#mainChat').append(imgDom);
    });

    function getEmojiMenuPositon() {
        let textAreaContainer = document.getElementsByClassName('text-area-inner');
        let textAreaPositionTop = textAreaContainer[0].offsetTop;
        let textAreaPostiionRight = textAreaContainer[0].offsetLeft;
        return emojiPostion = {
            top: textAreaPositionTop - (textAreaPositionTop + 169) + 'px',
            right: textAreaPostiionRight - (textAreaPostiionRight) + 'px'
        }

    }
    /////////////
});
