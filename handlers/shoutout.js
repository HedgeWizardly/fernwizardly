const fs = require('fs');
const twitchapi = require('./twitchapi');
const chat = require('./chat');
const pronouns = require('./pronouns');


var shoutoutmessages = JSON.parse(fs.readFileSync('./files/shoutoutmessages.json'))  // Our keywords for replacing are USERNAME and CATEGORY


module.exports.$ = async function(username) {
  
 

  switch(username) {
    case "somerandomdude":
        chat.message(`This is how you'd do a custom shoutout for a specific person instead of going through the usual stuff.`)
        return;
      break;
    case process.env.CHANNEL:
      chat.message(`Listen here, wiseguy.`);
      break;
      
  }
  
  
  twitchapi.lastPlaying(username,(brObj)=>{
    
    let customMessage = "";
    
    if(username in shoutoutmessages.custommessages) {
      customMessage = shoutoutmessages.custommessages[username];
    }
    
    let streamingMessage = "";
    let category = brObj['gameName'].toLowerCase();
    let displayName = brObj['displayName'];
    
    switch(category) {
      case "":
        chat.message(`${shoutoutmessages.nonstreamer.replace(/USERNAME/g,displayName)} ${customMessage}`)
        break;
      case "art":
          streamingMessage = "They were getting up to all kinds of creative arty crafty goodness!";
        break;
      case "just chatting":
        streamingMessage = "They were just chatting and having a nice ol' time with their chat!"
        break;
      case "food and drink":
        streamingMessage = "They were whipping up or scarfing down something delicious in the kitchen, by the sounds of it!"
        break;
        
      case "the legend of zelda: skyward sword hd":
        streamingMessage = "They were last streaming Skord Sord!"
        break;
        
      default:
        streamingMessage = shoutoutmessages.streaming.replace(/CATEGORY/g,brObj['gameName'])
        break;
    }
    
    if(streamingMessage!="") { 
      streamingMessage = pronouns.convert(username, streamingMessage,(newmessage)=> {
        
        chat.message(`${shoutoutmessages.streamer.replace(/USERNAME/g,displayName)} ${newmessage} ${customMessage}`)
        
      });
    }
    
    //chat.message(`${shoutoutmessages.streamer.replace(/USERNAME/g,username)} ${streamingMessage} ${customMessage}`)
    
    
    
  },()=>{  // If we can't find the user at all
    
    chat.message(`${shoutoutmessages.notfound}`);
    
  });
  
  
}