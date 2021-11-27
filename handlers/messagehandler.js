const chat = require('./chat');
const apicalls = require('./apicalls');
const pronouns = require('./pronouns');
const fs = require('fs');

// Our variables
var setmessages = JSON.parse(fs.readFileSync('./files/setmessages.json'))

module.exports.$ = async function(displayname, username, message, tags) {
  
  // pronouns.$(username, (r) => {
  //   console.debug(r)
  // });
  
  if(message.toLowerCase().includes("whats up") || message.toLowerCase().includes("what's up")) {  // I use this if it just needs to CONTAIN a word somewhere. You can use this to try and form FAQs
    chat.message(`Nothing much, what's updog with you, @${displayname}?`)
  }
  
  if(message.toLowerCase().replace(/\W/g, "")=="hello") {  
    // Use this if you want this to be the entirety of the message (Excluding any symbols anyway- that's what the .replace(/\W/g, "") does. Strips out symbols before comparing.)
    // I.e. This will respond to Hello! but not to Hello friends!
    chat.message(`${greeting()}, ${displayname}! ${randomconversation()}`)

  }
  
}

function  greeting() {  // Random greeting
  return setmessages.greetings[Math.floor(Math.random()*setmessages.greetings.length)];
}

function randomconversation() {  // Random bit of extra message
    return setmessages.conversation[Math.floor(Math.random()*setmessages.conversation.length)];

}