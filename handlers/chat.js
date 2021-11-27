// This is what we use to output to chat. Typically you'll be using chat.message("your message here") etc

module.exports.client;  // This will be set from the server.js, upon successfully connecting to the client

const prefix = "/me ";  // Replace this with just "" if you don't want any prefix. Or you can make it so an emoji like 🤖 displays before every message. Make sure to end with a space.
const suffix = "";  // Same as above. If you're using this, make sure to include a space at the beginning, or incorporate it elsewhere in the message function.

const message = function (text) { // This accepts either a singular string, or an array of strings, if you want to send multiple messages one after the other.
  console.info(process.env.BOT_USERNAME + ": " +text)
  if (!Array.isArray(text)) {  // Force it into an array of one if it isn't an array
    text = [text];
  }
  
  for(let i=0; i<text.length; i++){
    this.client.say(process.env.CHANNEL,prefix + text[i] + suffix);
  }
}


const command = function(text) {
  // This is identical to the message function above, except it doesn't try to put the prefix or suffix in. Useful for doing mod commands like /ban apples756, or /followers 10
  
  this.client.say(process.env.CHANNEL, text)
  
}


// Different aliases you can use to call the same thing
module.exports.message = message;
module.exports.msg = message;
module.exports.$ = message;

