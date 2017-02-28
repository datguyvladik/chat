var express = require('express'); // Подключаем express
var app = express();
var server = require('http').Server(app); // Подключаем http через app
var io = require('socket.io')(server); // Подключаем socket.io и указываем на сервер
var log4js = require('log4js'); // Подключаем наш логгер
var logger = log4js.getLogger(); // Подключаем с модуля log4js сам логгер
var port = 3000; // Можно любой другой порт
var path = require('path');
logger.debug('Script has been started...'); // Логгируем.
server.listen(port); // Теперь мы можем подключиться к нашему серверу через localhost:3000 при запущенном скрипте
app.use(express.static(__dirname + '/public'));



app.get('/reg', function (req, res) {
    res.sendfile('public/reg.html')
});

//подключение базы
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', function (err) {
    logger.error('connection error:', err.message);
});
db.once('open', function callback() {
    logger.info("Connected to DB!");
});

var userSchema = mongoose.Schema({
    name: String,
    password: String
});


var User = mongoose.model('User', userSchema);

User.find(function (err, user) {      //вывод всей базы
    if (err) return logger.error(err);
    logger.info(user);
})


io.on('connection', function (socket) {
    var name;

    // Обработчик ниже // Мы его сделали внутри коннекта

    socket.on('message', function (msg) { // Обработчик на событие 'message' и аргументом (msg) из переменной message
        logger.warn('-----------'); // Logging
        logger.warn('User: ' + name + ' | Message: ' + msg[0] + ' | TextArea: ' + msg[1]);
        logger.warn('====> Sending message to other chaters...');
        io.sockets.emit('messageToClients', msg, name); // Отправляем всем сокетам событие 'messageToClients' и отправляем туда же два аргумента (текст, имя юзера)
    });

    socket.on('userDataMongo', function (userData) {
        var userMongo = new User({ name: userData[0], password: userData[1] });
        logger.warn("name: " + userMongo.name + " password: " + userMongo.password);
        userMongo.save(function (err) {
            if (err) return logger.info(err);
            logger.info('Запись успешно добавлена.')
        });
        name = userData[0];
        socket.broadcast.emit('newUser', name);
        logger.info(name + ' connected to chat!');
        socket.emit('userName', name);   
    });

    socket.on('userSearchDataMongo', function (searchData) {
        User.findOne({ name: searchData[0], password: searchData[1] }, function (err, user) {
            if (err) return logger.error(err);
            if (user == null) {
                logger.info('No user');
            } else {
                logger.info(user);
                name = searchData[0];
                socket.broadcast.emit('newUser', name);
                logger.info(name + ' connected to chat!');
                socket.emit('userName', name);
            }

        });
    });



});