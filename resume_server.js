
var net = require('net');
var resume = require('./modules/gbresume.js');
var resumeFile = './assets/resume.txt';
var port = 11111;
var server = net.createServer();
var c;
var lineBuffer = '';

server.listen(port, function(){
    console.log("listening on port "+port);
    // resume.readFile(resumeFile);
});

server.on('connection',function(connex){
    c =connex;
    hi(connex);
    connex.on('data', function(data){
        lineBuffer+=data;

        if(lineBuffer.indexOf('\n') != -1 || lineBuffer.indexOf('\r') != -1){
            lineBuffer = lineBuffer.replace(/\r\n|\n\r/gm,"");
            resume.onOptions(lineBuffer.toLowerCase(),connex);
            lineBuffer = '';
        }

    });
});


var hi = function(c){
    if(!c | typeof c == 'undefined' | typeof c != 'object'){
        console.log('something bad happend');
        return;
    }
    resume.utils.hello(c);
    resume.utils.showMenu(c);
}


