var mongoose = require('./lib/mongoose');
var User = require('./models/user').User;
var Chat = require('./models/chat').Chat;
var Message = require('./models/message').Message;


function createUser(username, pass, successCallback) { //создать юзера
    var user = new User({
        username: username,
        password: pass
    });
    user.save(function (err, user) {
        if (err) {
            console.error(err);
            successCallback(false);
        } else {
            successCallback(true);
        }
    });
}


function login(username, pass, successCallback) { //логин
    User.findOne({
        username: username
    }, function (err, user) {
        if (user && user.checkPassword(pass)) {
            successCallback(user);
        } else {
            successCallback(false);
        }
    });
}

function parsedLogin(name, pass, successCallback) { //получить данные по логину(нужные)
    var username = name;
    var pass = pass;
    login(username, pass, function (user) {
        if (user) {
            var parsedUser = {
                username: user.username,
                isAdmin: user.isAdmin,
                chats: user.chats
            }
            successCallback(parsedUser);
        } else {
            successCallback(false);
        }
    });
}

function findAllUsers(successCallback) { //найти всех юзеров
    User.find({}, function (err, users) {
        if (err) {
            console.log(err);
        } else {
            successCallback(users);
        }
    })
}

function parsedlistUser(successCallback) { //получить лист юзеров (нужные поля)
    findAllUsers(function (data) {
        var parsedUsers = [];
        data.forEach(function (el) {
            parsedUsers.push({
                username: el.username,
                created: el.created,
                isAdmin: el.isAdmin,
                chats: el.chats
            })
        });
        successCallback(parsedUsers);
    })
}


/*parsedlistUser(function (data) {
    console.log(data);
});


parsedLogin('vlad', '1234', function (data) {
    console.log(data);
})*/

//max

function createChat(nameFromClient, membersFromClient, successCallback) { //создать чат
    var chat = new Chat({
        name: nameFromClient,
        members: membersFromClient
    });
    chat.save(function (err, chat) {
        if (err) {
            console.log(err);
            successCallback(false);
        } else {
            successCallback(chat);
        }

    });
}

function addMember(chatName, member, successCallback) { //добавить члена в чат
    Chat.findOneAndUpdate({
            name: chatName
        }, {
            $push: {
                members: member
            }
        }, {
            safe: true,
            upsert: true
        },
        function (err, chat) {
            if (err) {
                console.log(err);
                successCallback(false);
            } else {
                successCallback(chat);
            }
        }
    )
}

function getChatData(chatName, successCallback) { //получить дату чата
    Chat.findOne({
        name: chatName
    }, function (err, data) {
        if (err) {
            console.log(err);
            successCallback(false);
        } else {
            successCallback(data);
        }
    });
}



function createMessage(message, chatID, from, successCallback) { //создать сообщение
    var message = new Message({
        message: message,
        chatID: chatID,
        from: from
    });
    message.save(function (err, message) {
        if (err) {
            console.error(err);
            successCallback(false);
        } else {
            successCallback(true);
        }
    });
}

function getMessageData(successCallback) { //получить данные чата
    Message.find({}, function (err, message) {
        if (err) {
            console.log(err);
        } else {
            successCallback(message);
        }
    })
}

//TO DO: MAX 
/*
Функции для chata
1)Создать чат - done
2)Добавить нового пользователя в члены - done
3)вернуть все данные о чате - done
*/

//TO DO: VLAD
/*
Функции для месаг
1)Создать месагу - done
2) Получить мессагу - done
*/





module.exports.createUser = createUser;
module.exports.parsedLogin = parsedLogin;
module.exports.parsedlistUser = parsedlistUser;
module.exports.createChat = createChat;
module.exports.addMember = addMember;
module.exports.getChatData = getChatData;
module.exports.createMessage = createMessage;
module.exports.getMessageData = getMessageData;