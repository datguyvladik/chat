var mongoose = require('./lib/mongoose');
var User = require('./models/user').User;
var Chat = require('./models/chat').Chat;
var Message = require('./models/message').Message;
mongoose.Promise = Promise;

function createUser(username, pass, successCallback) { //создать юзера
    var user = new User({
        username: username,
        password: pass
    });
    user.save()
        .then(function (user) {
            if (user) {
                successCallback(true);
            } else {
                successCallback(false);
            }
        })
        .catch(function (err) {
            console.log(err);
        });
}


function login(username, pass, successCallback) {
    User.findOne({
            username: username
        })
        .then(function (user) {
            if (user && user.checkPassword(pass)) {
                var parsedUser = {
                    username: user.username,
                    isAdmin: user.isAdmin,
                    chats: user.chats
                }
                successCallback(parsedUser);
            } else {
                successCallback(false);
            }
        })
        .catch(function (err) {
            console.log(err);
        });
}



function findAllUsers(successCallback) { //найти всех юзеров
    User.find({})
        .then(function (users) {
            var parsedUsers = [];
            users.forEach(function (el) {
                parsedUsers.push({
                    username: el.username,
                    created: el.created,
                    isAdmin: el.isAdmin,
                    chats: el.chats
                })
            });
            successCallback(parsedUsers);
        })
        .catch(function (err) {
            console.log(err);
        });
}



function addChatToUser(username, chatName, successCallback) { //добавить чат юзеру
    User.findOneAndUpdate({
            username: username
        }, {
            $push: {
                chats: chatName
            }
        }, {
            safe: true,
            upsert: true,
            new: true
        })
        .then(function (user) {
            var parsedUser = {
                username: user.username,
                chats: user.chats
            };
            successCallback(parsedUser);
        })
        .catch(function (err) {
            console.log(err);
        });
}


function createChat(nameFromClient, membersFromClient, successCallback) { //создать чат
    var chat = new Chat({
        name: nameFromClient,
        members: membersFromClient
    });
    chat.save()
        .then(function (user) {
            if (user) {
                successCallback(true);
            } else {
                successCallback(false);
            }
        })
        .catch(function (err) {
            console.log(err);
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
            upsert: true,
            new: true
        })
        .then(function (chat) {
            if (chat) {
                successCallback(true);
            } else {
                successCallback(false);
            }
        })
        .catch(function (err) {
            console.log(err);
        });
}

function getChatData(chatName, successCallback) { //получить дату чата
    Chat.findOne({
            name: chatName
        })
        .then(function (chat) {
            if (chat) {
                successCallback(chat);
            } else {
                successCallback(false);
            }
        })
        .catch(function (err) {
            console.log(err);
        })
}



function createMessage(message, chatID, from, successCallback) { //создать сообщение
    var message = new Message({
        message: message,
        chatID: chatID,
        from: from
    });
    message.save()
        .then(function (message) {
            if (message) {
                successCallback(message);
            } else {
                successCallback(false);
            }

        })
        .catch(function (err) {
            console.log(err);
        })
}

function getMessages(chatName, successCallback) { //получить данные определенного чата
    Message.find({
            chatID: chatName
        })
        .then(function (messages) {
            if (messages) {
                successCallback(messages);
            } else {
                successCallback(false);
            }
        })
        .catch(function (err) {
            console.log(err);
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
module.exports.login = login;
module.exports.findAllUsers = findAllUsers;
module.exports.createChat = createChat;
module.exports.addMember = addMember;
module.exports.getChatData = getChatData;
module.exports.createMessage = createMessage;
module.exports.getMessages = getMessages;