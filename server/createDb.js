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
        var parsedUser = [];
        data.forEach(function (el) {
            parsedUser.push({
                username: el.username,
                created: el.created,
                isAdmin: el.isAdmin,
                chats: el.chats
            })
        });
        successCallback(parsedUser);
    })
}

parsedlistUser(function(data){
    console.log(data);
});

//TO DO: MAX 
/*
Функции для chata
1)Создать чат
2)Добавить нового пользователя в члены
3)вернуть все данные о чате 
*/

//TO DO: VLAD
/*
Функции для месаг
1)Создать месагу
2) Получить мессагу
*/





module.exports.login = login;
module.exports.createUser = createUser;