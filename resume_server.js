/*
 * Copyright © 2013 Gregory Berger <greg@paperpixel.net>
 * This work is free. You can redistribute it and/or modify it under the
 * terms of the Do What The Fuck You Want To Public License, Version 2,
 * as published by Sam Hocevar. See the COPYING file for more details.
 */
var net = require('net');
var resume = require('./modules/gbresume.js');
var resumeFile = './assets/resume.txt';
var port = 11111;
var server = net.createServer();
var c;
var lineBuffer = {};
subscribers = [];

server.listen(port, function(){
    console.log("listening on port "+port);
    // resume.readFile(resumeFile);
});

server.on('connection',function(connex){
    console.log("New connection");
    subscribers.push(connex);
  //  c =connex;
    hi(connex);
    connex.on('data', function(data){

        lineBuffer[connex]+=data;

        if(lineBuffer[connex].indexOf('\n') != -1 || lineBuffer[connex].indexOf('\r') != -1){
            lineBuffer[connex] = lineBuffer[connex].replace(/\r\n|\n\r/gm,"");
            resume.onOptions(lineBuffer[connex].toLowerCase(),subscribers[subscribers.indexOf(connex)]);
            lineBuffer[connex] = '';
        }

    });
    connex.on('end', function(){
       closeConnex(connex);
    });


});

function closeConnex(connex) {
    var i = subscribers.indexOf(connex);
    if (i != -1) {
        subscribers.splice(i, 1);
    }
}
var hi = function(c){
    if(!c | typeof c == 'undefined' | typeof c != 'object'){
        console.log('something bad happend');
        return;
    }
    resume.clearTelnetScreen(c);
    resume.utils.hello(c);
    resume.utils.showMenu(c);
}
