var express = require('express');
var http = require('http');
var path = require('path');
var config = require('./config');
var mongoose = require('./lib/mongoose');
var app = express();
var db = require('./createDb');


app.engine('ejs', require('ejs-locals'));
app.set('views', __dirname + '/template');
app.set('view engine', 'ejs');


require('./routes')(app);

app.use(express.static(path.join(__dirname, '/public')));



var server = http.createServer(app);
server.listen(config.get('port'), function(){
  console.log('Express server listening on port ' + config.get('port'));
});

var io = require('socket.io').listen(server);

io.on('connection', function (socket) {
   socket.on('fillUsers', function (users) {
       db.parsedLogin(users.username, users.pass, function (data) {
           socket.emit('res', data);
       });
   });
});

