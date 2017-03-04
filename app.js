var express = require('express');
var http = require('http');
var path = require('path');
var config = require('./config');
var mongoose = require('./lib/mongoose');
var app = express();

app.engine('ejs', require('ejs-locals'));
app.set('views', __dirname + '/template');
app.set('view engine', 'ejs');


require('./routes')(app);

app.use(express.static(path.join(__dirname, '/public')));



var server = http.createServer(app);
server.listen(config.get('port'), function(){
  console.log('Express server listening on port ' + config.get('port'));
});
