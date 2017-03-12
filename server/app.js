var express = require('express');
var http = require('http');
var path = require('path');
var config = require('./config');
var mongoose = require('./lib/mongoose');
var app = express();
var db = require('./createDb');
var log4js = require('log4js');
var logger = log4js.getLogger();


app.engine('ejs', require('ejs-locals'));
app.set('views', __dirname + '/template');
app.set('view engine', 'ejs');


require('./routes')(app);

app.use(express.static(path.join(__dirname, '/public')));



var server = http.createServer(app);
server.listen(config.get('port'), function () {
  console.log('Express server listening on port ' + config.get('port'));
});

var io = require('socket.io').listen(server);

io.on('connection', function (socket) {


  socket.on('createUser', function (userData) { //запрос на регистрацию
    db.createUser(userData.username, userData.pass).then(function (data) {
      socket.emit('createUser', data);
      logger.info('User Created! \n' + 'User name: ' + data.username);
    });
  });

  socket.on('login', function (userData) { //запрос на 
    db.login(userData.username, userData.pass).then(function (data) {
      socket.emit('login', data);
      logger.info('User Connected! \n' + 'User name: ' + data.username);
    });
  });

  socket.on('createMessage',function(messageData){
    db.createMessage(messageData.message, messageData.chatID,messageData.from).then(function(data) {
        io.sockets.emit('sendMessage',data);
        logger.info('New Message from: '+data.from + " In chat: "+ data.chatID + " Message: " + data.message);
    });
  
  })
});