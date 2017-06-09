//Http
var http = require('http');

//Express.js
var express = require('express');
var app = express();

//ent. Pour bloquer les balises html et les codes javascript
var ent = require("ent");

//Crée une route pour la première connexion http (racine)
app.get('/', function (request, response) {
    //On recherche le fichier html qui sert de base. Il doit inclure le script de Socket.io
    response.sendFile(__dirname + '/index.html');
});

//Crée un serveur qui gère les connexions http et socket en utilisant la fonction app d'Express.js
var server = http.createServer(app);

//Socket.io
//Le serveur est associé à socket.io pour gérer la connexion des sockets
var io = require('socket.io')(server);

//Cette fonction s'exécute à chaque connexion sur la racine de l'application "/".
io.on('connection', function (socket) {

    //Ecoute l'evenement "new_client" envoyé par le client. Récupère le nom d'utilisateur entré sur la boite de dialogue.
    socket.on("new_client", function (usrName) {
        //le nom est filtré pour supprimer les codes
        usrName = ent.encode(usrName);
        socket.usrName = usrName;
        //on avertit tout le monde que quelqu'un se connecte. Envoie sur l'événement "messageFromServer" que le client écoute en continu.
        io.emit("messageFromServer", "<aside class='login'>" + "<strong>" + usrName + "</strong>" + "  a rejoint la conversation." + "</aside>");
        //note en console pour le serveur
        console.log(usrName + " connected!");
    });


    //Cette fonction est exécutée lorsqu'un client quitte la racine "/" (en rafraichissant la page ou en fermant la fenêtre)
    socket.on('disconnect', function (usrName) {
        //on avertit tout le monde que quelqu'un est parti
        io.emit("messageFromServer", "<aside class='logout'>" + "<strong>" + socket.usrName + "</strong>" + " a quitté la conversation." + "</aside>");
        //note en console pour le serveur
        console.log(socket.usrName + " has disconnected!");
    });

    //Cette fonction est exécutée lorsqu'un client envoie un message 
    socket.on('messageFromClient', function (data) {
        //Le message est filtré pour supprimer les codes
        data = ent.encode(data);
        //On renvoie le message avec le nom de l'utilisateur qui l'a écrit
        var text = "<span>" + "<strong>" + socket.usrName + " :</strong> " + data + "</span>";
        io.emit('messageFromServer', text);
        //Le serveur affiche aussi les messages en console. ça pourrait servir, peut-être pour des actions de modération rétroactives.
        console.log(socket.usrName + " : " + data);
    });
});

//On écoute le serveur créé sur le port 3000 (pas l'app Express.js)
server.listen(process.env.PORT || 3000, console.log("Listening to port 3000"));
