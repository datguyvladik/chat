var mongoose = require('./lib/mongoose');
var User = require('./models/user').User;

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




 