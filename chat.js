var express = require('express'); // Подключаем express
var app = express();
var server = require('http').Server(app); // Подключаем http через app
var io = require('socket.io')(server); // Подключаем socket.io и указываем на сервер
var log4js = require('log4js'); // Подключаем наш логгер
var logger = log4js.getLogger(); // Подключаем с модуля log4js сам логгер
var port = 3000; // Можно любой другой порт
logger.debug('Script has been started...'); // Логгируем.
server.listen(port); // Теперь мы можем подключиться к нашему серверу через localhost:3000 при запущенном скрипте
app.use(express.static(__dirname + '/public'));
//подключение базы
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', function (err) {
    logger.error('connection error:', err.message);
});
db.once('open', function callback () {
    logger.info("Connected to DB!");
});

var userSchema = mongoose.Schema({
    name: String
});
var User = mongoose.model('User', userSchema);

io.on('connection', function (socket) {
    var name = 'U' + (socket.id).toString().substr(1, 4);
    socket.broadcast.emit('newUser', name);

    logger.info(name + ' connected to chat!');
    socket.emit('userName', name);
    // Обработчик ниже // Мы его сделали внутри коннекта

    socket.on('message', function (msg) { // Обработчик на событие 'message' и аргументом (msg) из переменной message
        logger.warn('-----------'); // Logging
        logger.warn('User: ' + name + ' | Message: ' + msg[0] + ' | TextArea: ' + msg[1]);
        logger.warn('====> Sending message to other chaters...');
        io.sockets.emit('messageToClients', msg, name); // Отправляем всем сокетам событие 'messageToClients' и отправляем туда же два аргумента (текст, имя юзера)
    });

    socket.on('userNameMongo', function(userNameMongo) {
        var userMongo = new User({ name: userNameMongo });
        logger.warn("name:"+ userMongo.name);
    });



});