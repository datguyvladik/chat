var mongoose = require('./lib/mongoose');
var User = require('./models/user').User;
var Chat = require('./models/chat').Chat;
var Message = require('./models/message').Message;
var File = require('./models/file').File;
mongoose.Promise = Promise;

function createUser(username, pass) { //создать юзера
    var user = new User({
        username: username,
        password: pass
    });
    return user.save()
        .then(function (user) {
            if (user) {
                return user;
            } else {
                return null;
            }
        })
        .catch(function (err) {
            console.log(err);
        });
}



function login(username, pass) {
    return User.findOne({
            username: username
        })
        .then(function (user) {
            if (user && user.checkPassword(pass)) {
                var parsedUser = {
                    username: user.username,
                    isAdmin: user.isAdmin,
                    chats: user.chats
                }
                return parsedUser;
            } else {
                return null;
            }
        })
        .catch(function (err) {
            console.log(err);
        });
}



function findAllUsers() { //найти всех юзеров
    return User.find({})
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
            return parsedUsers;
        })
        .catch(function (err) {
            console.log(err);
        });
}

function findUser(username) {
    return User.findOne({
            username: username
        })
        .then(function (user) {
            if (user) {
                return user;
            } else {
                return null;
            }
        })
        .catch(function (err) {
            console.log(err);
        })
}


function addChatToUser(username, chatName) { //добавить чат юзеру
    return User.findOneAndUpdate({
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
            return parsedUser;
        })
        .catch(function (err) {
            console.log(err);
        });
}


function createChat(nameFromClient, membersFromClient) { //создать чат
    var chat = new Chat({
        name: nameFromClient,
        members: membersFromClient
    });
    return chat.save()
        .then(function (chat) {
            if (chat) {
                return [chat];
            } else {
                return null;
            }
        })
        .catch(function (err) {
            console.log(err);
        });
}


function addMember(chatName, member) { //добавить члена в чат
    return Chat.findOneAndUpdate({
            _id: chatName
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
                return [chat];
            } else {
                return null;
            }
        })
        .catch(function (err) {
            console.log(err);
        });
}


function getChatData(chatName) { //получить дату чата
    return Chat.findOne({
            _id: chatName
        })
        .then(function (chat) {
            if (chat) {
                return chat;
            } else {
                return null;
            }
        })
        .catch(function (err) {
            console.log(err);
        })
}

function getChatDataforUser(username) {
    return Chat.find({
            members: username
        })
        .then(function (chat) {
            if (chat) {
                return chat;
            } else {
                return null;
            }
        })
        .catch(function (err) {
            console.log(err);
        })
}




function createMessage(message, chatID, from) { //создать сообщение
    var message = new Message({
        message: message,
        chatID: chatID,
        from: from
    });
    return message.save()
        .then(function (message) {
            if (message) {
                return message;
            } else {
                return null;
            }

        })
        .catch(function (err) {
            console.log(err);
        })
}

function getMessages(chatName) { //получить данные определенного чата
    return Message.find({
            chatID: chatName
        })
        .then(function (messages) {
            if (messages) {
                return messages;
            } else {
                return null;
            }
        })
        .catch(function (err) {
            console.log(err);
        })
}

module.exports.createUser = createUser;
module.exports.login = login;
module.exports.findAllUsers = findAllUsers;
module.exports.findUser = findUser;
module.exports.createChat = createChat;
module.exports.addMember = addMember;
module.exports.getChatData = getChatData;
module.exports.getChatDataforUser = getChatDataforUser;
module.exports.createMessage = createMessage;
module.exports.getMessages = getMessages;