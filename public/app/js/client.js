let config = (() => {
    let config = require('../config');
    let port = config.port;
    let socket = io.connect(config.host + port);
    let ipcRenderer = require('electron').ipcRenderer;
    return {
        socket,
        ipcRenderer
    }
})();

let clientModule = (() => {
    let loginListener = () => {
        if ($('#inputLogin').val() == "" || $('#inputPassword').val() == "") {
            alert('error');
        } else {
            let userData = {
                username: document.getElementById('username').value,
                pass: document.getElementById('userpass').value
            };
            config.socket.emit('login', userData);

        }
    };

    let login = (data) => {
        require('electron').remote.getGlobal('user').username = data.username;
        require('electron').remote.getGlobal('user').chats = data.chats;
        require('electron').remote.getGlobal('user').isAdmin = data.isAdmin;
        config.ipcRenderer.sendSync('synchronous-message', 'ping');
    };

    let createNewUser = () => {
        let userData = {
            username: document.getElementById('username').value,
            pass: document.getElementById('userpass').value
        };
        config.socket.emit('createUser', userData);
    };


    let passwordConfimation = () => {
        let regPass = $('#regPass');
        let btnReg = $("#btn-reg");
        let valid = $('#ok-valid');
        if (regPass.val() == $('#confPass').val()) {
            valid.show('fast');
            btnReg.prop("disabled", false);
        } else {
            valid.hide('fast');
            btnReg.prop("disabled", true);
        }
    };

    let loginRegSwitch = () => {
        let login = $('#login');
        let registration = $('#registration');
        if (login.css('display') == 'block') {
            login.hide('slow');
            registration.show('slow');
        } else {
            registration.hide('slow');
            login.show('slow');
        }
    };

    let onLogin = (userData) => {
        if (userData) {
            login(userData);
        } else {
            alert('Error!');
        }
    };

    let onCreateUser = (userData) => {
        if (userData) {
            clientModule.login(userData);
        } else {
            alert('Error!');
        }
    };

    let checkUsername = () => {
        let user = $('#username-container');
        if (user.hasClass('signin')) {
            let parsedUsername = $('#username').val().trim();
            config.socket.emit('userExist', parsedUsername);
        }
    };

    let goToPass = () => {
        $('#username-container').fadeOut('slow', function () {
            $('#password').fadeIn('slow');
            $('#userpass').focus();
            $('#password').addClass('current');
            $('#username-container').removeClass('current');
        });
    };


    let getUserChoise = (e) => {
        let userContainer = $('#username-container');
        userContainer.addClass(e.target.id);
        $('#password').addClass(e.target.id);
        $('#ch').hide();
        $('#username').focus();
        userContainer.fadeIn('slow');
        $('.info').fadeIn('slow');
    };

    return {
        login,
        loginListener,
        createNewUser,
        passwordConfimation,
        loginRegSwitch,
        onLogin,
        onCreateUser,
        checkUsername,
        getUserChoise,
        goToPass

    }
})();

$('#btn-login').on('click', clientModule.loginListener);
$('#btn-reg').on('click', clientModule.createNewUser);
$('#confPass').on("input propertychange", clientModule.passwordConfimation);
$('#switch').on('click', clientModule.loginRegSwitch);
$(document).keypress((e) => {
    if (e.which == 13) {
        if ($('#password').hasClass('current')) {

            if ($('#password').hasClass('signin')) {
                clientModule.loginListener();
            } else {
                clientModule.createNewUser();
            }
        }

        if ($('#username-container').hasClass('current')) {
            if ($('#username-container').hasClass('signup')) {
                config.socket.emit('userExist', $('#username').val());
            } else {
                clientModule.goToPass();
            }
        }


    }
});
config.socket.on('login', clientModule.onLogin);
config.socket.on('createUser', clientModule.onCreateUser);
config.socket.on('userExist', function (data) {
    if (data) {
        $('#username-container span').css('color', 'red');
    }
    else {
        clientModule.goToPass();
    }
});
config.ipcRenderer.on('before-close', () => {
    config.ipcRenderer.send('closed');
});

$('#ch').on('click', clientModule.getUserChoise);
