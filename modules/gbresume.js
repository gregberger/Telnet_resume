/*
 * Copyright © 2013 Gregory Berger <greg@paperpixel.net>
 * This work is free. You can redistribute it and/or modify it under the
 * terms of the Do What The Fuck You Want To Public License, Version 2,
 * as published by Sam Hocevar. See the COPYING file for more details.
 */

var util = require('util');
var fs = require('fs');
var mailer = require('nodemailer');
// var config = require(__dirname+'/../config.js')
var prevCommand, text, mailContent, mailFrom = '';
var sleep = require('sleep');

var config = {
  mail:{
    user: process.env.MAIL_USERNAME,
    pwd : process.env.MAIL_PWD

  }
};

arr =[];

var utils = {
    hello: function(c){
        jumpLines(c, 5);
        this.wtc(c,'Hello, I\'m Gregory Berger. This is version 0.1 of my telnet resume');
        this.wtc(c,'this server has been developed with Node.js 0.10');
        this.wtc(c, 'you can find the source code on github: https://github.com/gregberger/Telnet_resume ');

    },
    showMenu: function(c){
        readFileAndWrite(__dirname+"/../assets/menu.txt", c);
    },
    wtc: function(c, text){
        c.write(text+"\r\n");
    },
    sendMail : function(to, from, what){
        if(!from)from = 'berger.gregory@gmail.com';
        if(!to)to = 'berger.gregory@gmail.com';
        var subject = '';
        var html = '';
        var att = [];
        if(what == 'cv'){
	    console.log('sending PDF resume to '+to);
            subject = "[Gregory Berger] Curriculum Vitae";
            html = "<h2>You requested my resume</h2><p>Here it is!</p><p>I hope we can meet soon.</p><br />Have a nice day ! <br /><br /> G. Berger";
            att = [{fileName:"CV_Gregory_Berger.pdf", filePath: __dirname+'/../assets/CV_Gregory_Berger.pdf'}];
        }else{
	    console.log("receiving bitbucket grant request from ",from);
            subject = 'Please grant me an access to your bitbucket';
            html = "You've got to grant an access to "+from;
        }
        var transport = mailer.createTransport("SMTP",{host:'smtp.gmail.com',secureConnection:false,auth:{user:config.mail.user, pass:config.mail.pwd} });
      transport.sendMail({
                from: from,
                to: to,
                subject: subject,
                html: html,
                attachments: att
            },
            function(error, response){
                if(error){
                    console.log(error);
                }else{
                    console.log("Message sent: " + response.message);
                }
            }
        );
       prevCommand = "menu";
    },

    lineNumber: 0,
    currentLine: 0

};
var actions = {
  '?': function(c){
    this.menu(c);
  },
  help: function(c){
      this.menu(c);
  },
  menu: function(c){
      clearTelnetScreen(c);
      utils.showMenu(c);
  },
  cv: function(c){
      clearTelnetScreen(c);
      readFileAndWrite(__dirname+'/../assets/resume.txt',c);
      // jumpLines(c,10);
      // utils.showMenu(c);
      jumpLines(c,5);
      utils.wtc(c,'[menu] to show commands');
  },
  real_cv: function(c){
      utils.wtc(c, "Please enter your email address: ");
  },
  projects: function(c){
      clearTelnetScreen(c);
      readFileAndWrite(__dirname+'/../assets/sources.txt', c);
  },
  contact: function(c){
      clearTelnetScreen(c);
      readFileAndWrite(__dirname+'/../assets/contact.txt',c);
  },

  hello: function(c){
      clearTelnetScreen(c);
      readFileAndWrite(__dirname+'/../assets/hello.txt',c);
  },
  portrait: function(c){
      clearTelnetScreen(c);
      readFileAndWrite(__dirname+'/../assets/contact.txt',c);
  },
  quit:function(c){
      utils.wtc(c, "You sure? [Y/N] ? please, don't (there's an easter egg, stay a little longer...  !!! :D)");
  },
  y:function(c){
    if(prevCommand == 'quit'){
        utils.wtc(c,"");
        c.end();
    }
  },
  get_bb_access: function(c){
      utils.wtc(c, "enter your email address or your bit bucket account");
  },
   real_cv_send:function(c, mail){
       if(mail){
           utils.wtc(c, "I'm sending you this email right away to "+mail);
           utils.sendMail(mail, '', 'cv');
       }else{
           console.log("Mail undefined");
       }

   },
   grant_bitBucket: function(c, mail){
        if(mail){
            utils.wtc(c, "Ok, i'll review your request and grant you an access asap.");
            utils.sendMail('',mail, 'bb');
        }else{
            console.log('unable to grant bitbucket access to '+mail);
        }

   }

};

module.exports.onOptions = function(d,c){
    if(actions[d] != 'undefined' && typeof actions[d] == 'function'){
        actions[d](c);
    }else{
        if(prevCommand == 'real_cv' | prevCommand == 'get_bb_access'){
            if(d.match(/.*@.*\..{2,4}/gm)){
                var mail = d;
                d = prevCommand == 'real_cv' ? "real_cv_send":'grant_bitBucket';
                if(typeof actions[d] == 'function'){
                    actions[d](c, mail);
                }
            }else{
                utils.wtc(c, "enter a valid email");
                d = prevCommand;
            }
        }
    }

    prevCommand = d;
};


var manageDefaults = function(c, command){

    switch(command){
        case "real_cv_send":{
            utils.wtc(c, "I'm sending you this email right away to "+mail);
            utils.sendMail(mail, '', 'cv');
            break;
        }
        case 'grant_bitBucket':{
            utils.wtc(c, "I'm sending you this email right away to "+mail);
            utils.sendMail('',mail, 'bb');
            break;
        }
        default:{
            utils.wtc(c,'sorry there\'s non action mapped to your command. -> '+command+'\n\rIf you think this is a big mistake, drop me a line at greg@paperpixel.net [or type mailto] I\'ll be glad to implement whatever you might have in mind\r\n');
        }
    }
}
/**
 * Read file and write on socket
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
    
    if ( arr.length > 0) {
        c.write(arr[utils.currentLine] + "\r\n");
        arr.splice(0,1);
        sleep.msleep(150);
        writeLineByLine(c,arr);

    }
    else {
    //    utils.currentLine = 0;
        c.write(footerText + '\r\n');
    }
};

var clearTelnetScreen = function (c) {
    c.write("\u001B[2J");
};

var jumpLines = function(c,number){
    if(number == 'undefined'){
        number = 5;
    }
    for(var i = 0; i < number; i++){
        utils.wtc(c,'');
    }
}

module.exports.clearTelnetScreen = clearTelnetScreen;
module.exports.readFile = readFileAndWrite;
module.exports.utils = utils;
