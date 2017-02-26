var express = require('express'); // Подключаем express
var app = express();
var server = require('http').Server(app); // Подключаем http через app
var io = require('socket.io')(server); // Подключаем socket.io и указываем на сервер
var log4js = require('log4js'); // Подключаем наш логгер
var logger = log4js.getLogger(); // Подключаем с модуля log4js сам логгер
var port = 3000;
logger.debug('Script has been started...');
server.listen(port); // Теперь мы можем подключиться к нашему серверу через localhost:3000 при запущенном скрипте
app.use(express.static(__dirname + '/public'));

io.on('connection', function (socket) { // Создаем обработчик события 'connection' которое создает io.connect(port); с аргументом socket
  var name = 'U' + (socket.id).toString().substr(1,4); // Создаем никнейм нашему клиенту. В начале буква 'U' дальше берем 3 символа ID (сокета) после первого символа, и все это клеим с помощью '+'
  socket.broadcast.emit('newUser', name); // Отсылает событие 'newUser' всем подключенным, кроме текущего. На клиенте навешаем обработчик на 'newUser' (Отправляет клиентам событие о подключении нового юзера)
  socket.emit('userName', name); // Отправляем текущему клиенту событие 'userName' с его ником (name) (Отправляем клиенту его юзернейм)
  logger.info(name + ' connected to chat!'); // Логгирование
});
