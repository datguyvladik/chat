var mongoose = require('./lib/mongoose');
var User = require('./models/user').User;
var Chat = require('./models/chat').Chat;
var Message = require('./models/message').Message;


function createUser(username, pass, successCallback) {
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


function login(username, pass, successCallback) {
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

function parsedLogin(name, pass, successCallback) {
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

function findAllUsers(successCallback) {
    User.find({}, function (err, users) {
        if (err) {
            console.log(err);
        } else {
            successCallback(users);
        }
    })
}

function parsedlistUser(successCallback) {
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

function createChat(nameFromClient, membersFromClient, successCallback) {
    var chat = new Chat({
        name: nameFromClient,
        members: membersFromClient
    });
    chat.save( function (err, chat){
        if (err){
            console.log(err);
            successCallback(false);
        } else {
            successCallback(chat);
        }

    });
}

function addMember(chatName, member, callback) {
    Chat.findOneAndUpdate(
        {name: chatName},
        {$push:{members:member}},
        {safe:true, upsert:true},
        function (err, chat) {
            if (err){
                console.log(err);
                callback(false);
            }
            else {
                callback(chat);
            }
        }
    )
}

function getChatData(chatName, callback) {
    Chat.findOne({
        name: chatName
    }, function (err, data) {
        if (err){
            console.log(err);
        } else {
            callback(data);
        }
    });
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
1)Создать месагу
2) Получить мессагу
*/





module.exports.login = login;
module.exports.createUser = createUser;
module.exports.parsedLogin = parsedLogin;
module.exports.parsedlistUser = parsedlistUser;
module.exports.createChat = createChat;
module.exports.addMember = addMember;
module.exports.getChatData = getChatData;