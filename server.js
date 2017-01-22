var express = require('express');
var app = express();
var http = require('http').Server(app);
var fs = require('fs');

app.use(express.static(__dirname));
app.use(function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
});

app.get('/', function(request, response){
    response.sendFile(__dirname + '/index.html');
});

app.get('/gameDatas', function(request, response){
    var Creature = fs.readFileSync('./src/Assets/Database/Creature.json', 'utf8');
    var CreatureTemplate = fs.readFileSync('./src/Assets/Database/CreatureTemplate.json', 'utf8')
    var Models = fs.readFileSync('./src/Assets/Database/Models.json', 'utf8')
    var Sounds = fs.readFileSync('./src/Assets/Database/Sounds.json', 'utf8')
    var Spells = fs.readFileSync('./src/Assets/Database/Spells.json', 'utf8')
    var Texts = fs.readFileSync('./src/Assets/Database/Texts.json', 'utf8')

    var result = '{';
    result += '"Creature": ' + Creature +', ';
    result += '"CreatureTemplate": ' + CreatureTemplate +', ';
    result += '"Models": ' + Models +', ';
    result += '"Sounds": ' + Sounds +', ';
    result += '"Spells": ' + Spells +', ';
    result += '"Texts": ' + Texts +' ';
    result += '}';

    response.setHeader('Content-Type', 'application/json');
    response.send(result);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});