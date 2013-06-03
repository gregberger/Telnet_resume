/**
 * Date: 2/06/13
 * Greg Berger
 * Time: 00:23
 */
var util = require('util');
var fs = require('fs');
var prevCommand, text, mailContent, mailFrom = '';
/*
var lineNumber = 500;
var currentLine = 700;
*/
arr =[];

var utils = {
    hello: function(c){
        this.wtc(c,'Hello, I\'m Gregory Berger. This is version 0.1 of my telnet resume');
        this.wtc(c,'this server has been developed with Node.js 0.10');
        this.wtc(c, 'you can find the source code on github: https://github.com/naabys/Telnet_resume ');

    },
    showMenu: function(c){
        this.wtc(c,'*** COMMANDS ***\n\r');
        this.wtc(c,"\t[cv] read a brief version of my resume");
        /*
        this.wtc(c,"\t[2] send me a tweet (yeah, it's possible !)");
        this.wtc(c,"\t[3] see my linked'in profile (as for now i'll send you an email with the url. Be kind enough to enter your address at the prompt)");
        this.wtc(c,"\t[mailto] ");
        */
        this.wtc(c,"\t[contact] Contact informations");
        this.wtc(c,"\t[portrait] Have a look at this breathtaking picture of me");
        this.wtc(c,"\t[menu] Show this menu");
        this.wtc(c,"\t[quit]");
    },
    wtc: function(c, text){
        c.write(text+"\r\n");
    },
    lineNumber: 0,
    currentLine: 0

};

module.exports.onOptions = function(d,c){
    if(d[0] == '@'){
        d = "@";
    }

  switch(d){
      case "cv":{
          clearTelnetScreen(c);
          readFileAndWrite(__dirname+'/../assets/resume.txt',c);
          jumpLines(c,10);
          utils.showMenu(c);

          break;
      }
      case "2":{
          // utils.wtc(c,"Will tweet from an unknown account. Please sign this tweet (= give your username ;) ) ...");
          break;
      }

      case "3":{
          // utils.wtc(c, "mailto");
          break;
      }
      case "@":{
          if(prevCommand == '2'){
              utils.wtc(c,'thanks i\'ll tweet myself :p');
          }
          break;
      }
      case "mailto":{
          utils.wtc(c,"")
          break;
      }
      case 'quit':{
          utils.wtc(c, "You sure? [Y/N] ? please, don't (there's an easter egg, stay a little longer...  !!! :D)");
          break;
      }
      case 'portrait':{
          clearTelnetScreen(c);
          readFileAndWrite(__dirname+'/../assets/greg.txt',c);
          break;
      }
      case 'contact':{
          clearTelnetScreen(c);
          readFileAndWrite(__dirname+'/../assets/contact.txt',c);
          break;
      }
      case 'help':
      case '?':
      case 'menu':{
          clearTelnetScreen(c);
          utils.showMenu(c);
          break;
      }
      case 'hello':{
          clearTelnetScreen(c);
          readFileAndWrite(__dirname+'/../assets/hello.txt',c);
          break;
      }
      case 'y':{
          switch(prevCommand){
              case 'quit':{
                  utils.wtc(c,"");
                  c.end();
                  break;
              }
          }
          break;
      }
      default:{
          if(d.toLowerCase() != 'n'){
            utils.wtc(c,'sorry there\'s non action mapped to your command. -> '+d+'\n\rIf you think this is a big mistake, drop me a line at greg@paperpixel.net [or type mailto] I\'ll be glad to implement whatever you might have in mind\r\n');
          }
      }
  }
  prevCommand = d;

};

/**
 * Read file
 */
var readFileAndWrite = function(resumeFile, c){

    fs.readFile(resumeFile, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }

        arr = data.split("\n");
        arr.pop(); /** remove line end entry from array */
        footerText = arr.pop(); /** set last line of text as footer text */
        text = arr.join('\r\n');
        writeLineByLine(c, arr);
    });

}

var writeLineByLine = function (c, arr) {

    if (utils.currentLine < arr.length) {
        c.write(arr[utils.currentLine] + "\r\n");
        utils.currentLine++;
        setTimeout(writeLineByLine(c,arr), 300);
    }
    else {
        utils.currentLine = 0;
       // c.write(footerText + '\r\n');
    }
};

var clearTelnetScreen = function (c) {
    c.write("\u001B[2J");
};

var resetBeforeRead = function(){
    text = '';
    currentLine = 0;
}

var jumpLines = function(c,number){
    if(number == 'undefined'){
        number = 5;
    }
    for(var i = 0; i < number; i++){
        utils.wtc(c,'');
    }
}

module.exports.readFile = readFileAndWrite;
module.exports.utils = utils;
