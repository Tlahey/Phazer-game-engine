var express = require('express');
//var server = express.createServer();
// express.createServer()  is deprecated. 
var server = express(); // better instead
server.use('/', express.static(__dirname));

const serverPort = 3000;
server.listen(serverPort);
console.log(`Server listen port ${serverPort}`)