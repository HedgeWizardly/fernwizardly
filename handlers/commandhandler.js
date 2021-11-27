const chat = require('./chat');
const apicalls = require('./apicalls');
const fs = require('fs');
const twitchapi = require('./twitchapi');
const shoutout = require('./shoutout');
const timers = require('./timers');

// Our variables
var setmessages = JSON.parse(fs.readFileSync('./files/setmessages.json'))

module.exports.$ = async function(displayname, username, message, tags, isMod) {
  
  // This identifies the command, splits up the args, and then also trims out the command from that message. 
  // For example, !addquote Insert Funny Comment
  var args = message.slice(1).split(' ');  // Means the args would be an array containing ['Insert','Funny','Comment']
  const command = args.shift().toLowerCase();  // The command would be 'addquote'
  message = args.join(' ');  // And the message is the converted to "Insert Funny Comment"
  
  console.debug(JSON.stringify(args))
  
  switch(command) {
      
      // =======================================================================================================
      // ===================================== Start of Commands Switch ========================================
      // =======================================================================================================
      
      
    case "joke": //These must always be written in lowercase here, because we're forcing the command variable to be lowercase above
    case "dadjoke":
    case "jokes":  // You can list a ton of different aliases if you like, just like this.
      
      apicalls.dadjoke((body) => { // I like to do this with a callback to account for delays or lag in the external api call
        chat.message(`${displayname}, ${body.setup}`);        
        setTimeout(()=>{ // Pause 4 seconds for effect
          chat.message(`${displayname}, ${body.punchline}`)
            //  // You can nest this timeout function in itself if you want it to keep going with more stuff;
            // setTimeout(()=>{ // Pause 4 seconds for effect
            // chat.message(`${displayname}, ${Badum-tiss!}`)
            //}, 4000) 
        }, 4000) 
        
      }); 
      break;
      
      
    case "marco":
      chat.message(`@${displayname} Polo!`);
      break;
      
    case "hug":
      
      if(args.length>0) {  // If there's at least one "argument" 
        chat.message(`${displayname} hugged ${args[0].replace(/\W/g, '')}! <3`)
      } else {  // Otherwise make the bot hug the person using the !hug command.
        chat.message(`*hugs ${displayname}* <3`)
      }
      
      break;
      
    case "order66":
      if(!isMod) return; //This line stops the command going through unless the user is a mod
      
      chat.message(`@${displayname} Yes, my lord.`);
      break;
      
      
    case "bar":  // This is how you send multiple messages in rapid succession. See the above jokes command for how to send multiple with specific timing though. I use this for the WELCOME RAIDERS message and such.
                // The BEST practice is to put these into the setmessages file, because then all your messages are in one place if you ever want to change them, but I'm lazy and it doesn't really matter that much.
      chat.message([`A horse walks into a bar.`, `The shocked bartender points a finger his way in alarm and yells, “Hey!”`, `The horse says, “You read my mind, buddy.” `])
      break;
      
    case "shoutout":  
    case "so":
      if(!isMod) return; //This line stops the command going through unless the user is a mod
      
      shoutout.$(args[0]);  // This gets complicated, so go to the shoutout handler

      break; 
      
    case "timer":
    case "timers":
      if(!isMod) return;
      if(args.length<2) return;
      
        switch(args[0]) {
          case "set":
            timers.set(args);
          break;
          case "add":
            timers.add(args);
          break;
        }
      
      break;
    case "settimer":
    case "settimers":
      timers.set(args);
      break;
    case "addtimer":
    case "addtimers":
      timers.add(args);
      break;
      
      
      
      // =======================================================================================================
      // ===================================== End of Commands Switch ==========================================
      // =======================================================================================================
      
  } 
}


// =======================================================================================================
// ===================================== Stick useful functions here =====================================
// =======================================================================================================


function  greeting() {  // Random greeting
  return setmessages.greetings[Math.floor(Math.random()*setmessages.greetings.length)];
}

function randomconversation() {  // Random bit of extra message
    return setmessages.conversation[Math.floor(Math.random()*setmessages.conversation.length)];

}