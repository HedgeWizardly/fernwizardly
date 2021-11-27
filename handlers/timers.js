const fs = require('fs');
var settings = JSON.parse(fs.readFileSync('./files/settings.json'));  // ORDER: random or sequence. DELAYMODE: split or fixed "splitduration":2,"fixedminutedelay":15}
var timermessages = JSON.parse(fs.readFileSync('./files/timermessages.json'))
const chat = require('./chat');

var enabledMessages = [];

var minsDelayBeforeInactiveMode = 20;  // maybe 20 minutes?
var defaultTick = 5;  // in seconds
var slowTicker = 1;  // in minutes

var myLastMessageSentAt;
var lastUserMessageSentAt = new Date();
var lastTimedMessages = [{name:"",time:new Date()}];

module.exports.myLastMessageSentAt = myLastMessageSentAt;
module.exports.lastUserMessageSentAt = lastUserMessageSentAt;


var interval;



module.exports.resetTicker = () => {
  interval = setInterval(function() {  // Every 5 seconds, 
   tickCheck()
 }, 5000);
  
}

setTimeout(()=>{
  this.sync();
  tickCheck();
},1000);


var messageDelay;


// These commands will work with !timers and !timer interchangeably:

//   !timer add namehere messagehere
//   !timer add namehere !commandhere
//   !timer set [fixed / fixedminute / minute / fixedminutedelay] [05 / 5 / quarter past ]
//   !timer set [split / splittime / splithour / divide] [1 / 2 / 2.5]

module.exports.set = async function(args) {
  if(args[0].toLowerCase()=="set") { args.shift(); }
  
  
  switch(args[0]) {
    case "mode":
    case "delaymode":
    case "type":
      
      if(args.length<2) return;
      
            switch(args[1]) {  // Split or Fixed
              case "fixed":
              case "fixedminute":
              case "fixedtime":
              case "fixeddelay":
              case "delay":  

                settings.timers.delaymode="fixed";
                if(args.length>2) {
                  if(isNumeric(args[2])) {
                    settings.timers.fixedminutedelay = args[2];
                  }
                }
                
                chat.message(`Okay! I'll send the timed messages every ${settings.timers.fixedminutedelay} minutes!`)

                break;
              case "split":
              case "divide":
              case "divided":
              case "even":
              case "splitduration":

                settings.timers.delaymode="split";
                if(args.length>2) {
                  if(isNumeric(args[2])) {
                    settings.timers.splitduration = args[2];
                  }
                }
                chat.message(`Okay! I'll split the timed messages evenly across ${settings.timers.splitduration} hour(s)! This means they'll send every ${(settings.timers.splitduration*60) / enabledMessages.length} minutes!`)

                break;

            }
      break;
      
      
      case "fixedminute":
      case "minute":
      case "fixed":
      case "delay":

        settings.timers.delaymode="fixed";
                if(args.length>1) {
                  if(isNumeric(args[1])) {
                    settings.timers.fixedminutedelay = args[1];
                  }
                }
      break;
      
    case "order":
      if(args[1]=="random") {
        settings.timers.order="random";
      } else {
        settings.timers.order="sequence";
        
      }
      chat.message(`The timed messages order has been set to ${settings.timers.order}!`)
      break;
      
      
  }
  sync()
}


module.exports.add = async function(args){
  if(args[0].toLowerCase()=="add") { args.shift(); }
  
  let existingNames = timermessages.map((e) => {
    return e.name;
  });
  
  if(existingNames.includes(args[0].toLowerCase())) {
    chat.message(`A timer called '${args[0].toLowerCase()}' already exists! To edit it, use !timer edit ${args[0].toLowerCase()} <property> <value>.`)
    return;
  }
  
  let newTimerMessage = {"name":args[0].toLowerCase()}
  
  args.shift();
  
  if(args[1].startsWith("!")) {  // Is it a command?
    
  } else if(args[1].startsWith("?")) {  // Is it a function name?
    
  } else {
    newTimerMessage.message=args.join(" ");
  }
  
  timermessages.push(newTimerMessage);
  console.log(JSON.stringify(timermessages));
  fs.writeFileSync('./files/timermessages.json',JSON.stringify(timermessages))
  
  chat.message(`New timer '${newTimerMessage.name}' added! Use !timer edit ${newTimerMessage.name} <property> <value> to update the message or change other conditions!`)
  
}

module.exports.edit = async function(args){
  if(args[0].toLowerCase()=="edit") { args.shift(); }
  
  
}

module.exports.remove = async function(args){
  if(args[0].toLowerCase()=="remove") { args.shift(); }
  
}

// =========================================================
// ======================= SYNC ============================
// =========================================================


const sync = async function() {
  timermessages = JSON.parse(fs.readFileSync('./files/timermessages.json'))
  //console.log("timermessages length = "+timermessages.length)
  console.log("Syncing Timers")
  console.log(JSON.stringify(timermessages))
  
  
  if(Array.isArray(timermessages)){
    enabledMessages = [];
  timermessages.forEach((t)=>{
    if(!('disableOverride' in t) ||t.disableOverride) {  // Also check all the other conditions against the title etc to see if any of those disqualify it
      enabledMessages.push(t);
      
    }  
  });
  }
  
//  console.log(`enabledMessages.length = ${enabledMessages.length}`)
  
  if(enabledMessages.length>0){
      try{
      switch(settings.timers.delaymode) {
        case "split":
          console.debug("Setting message delay...")
          console.debug(`${settings.timers.splitduration*60} / ${enabledMessages.length} *1000`)
          messageDelay = ((settings.timers.splitduration*60) / enabledMessages.length)*1000;
          break;
        case "fixed":
            messageDelay = settings.timers.fixedminutedelay * 1000 * 60;
          break;
        
        }
      }
      catch(e) {
        messageDelay = undefined;
        console.warn("error " + e);

      }
  }
  console.log("SETTINGS")
  console.log(JSON.stringify(settings))
  fs.writeFileSync('./files/settings.json',JSON.stringify(settings))
  
}



const template = {"name":"",
                  "message":"",  
                  "command":"",  // Run a message command
                  "function":"",  // Run a specific function from within timers.js
                  "fixedminute":"",  // Run this at the same minute time every hour
                  "disableOverride":false,  // If this is disabled fully, then don't ever use it.
                  "enableIfTitleContains":[],  // If the title contains something like "!pronouns", then add this command to the timer rotation
                  "enableForGames":[],
                  "enableForAnyOfTags":[],
                  "enableForCombinationOfTags":[],
                  "disableIfTitleContains":[],
                  "disableForGames":[],
                  "disableForAnyOfTags":[],
                  "disableForCombinationOfTags":[],
                  "lastsent":new Date()
                 };

const example1 = {"name":"backseat",
                  "command":"backseat",  //
                 "enableForAnyOfTags":["No Backseating","First Playthrough"]};



function sendMessage(now){
  // console.log(JSON.stringify(enabledMessages))
  let nextmessage;
  
  let lasttimedmessagenames = lastTimedMessages.map((m)=>{
    return m.name;
  });
  
  let enabledmessagesnames = enabledMessages.map((m)=>{
    return m.name;
  });
  
  let numMessages = enabledMessages.length;
  
  console.debug(JSON.stringify(enabledMessages))
  
  if(settings.timers.order=="sequence") {
  let index = enabledmessagesnames.indexOf(lastTimedMessages[0].name)
  
    if(enabledMessages.length <= index+1) { // If we're at the end, loop back around to the front
      index = 0; } else { index = index+1; }
    
    if(index==undefined || index==-1) { index = 0; }
    nextmessage = enabledMessages[index]
  } else {  // Pick a message at random!
    
    do {
      nextmessage = enabledMessages[Math.floor(Math.random()*enabledMessages.length)];
      console.debug(`Trying ${JSON.stringify(nextmessage)} out of ${JSON.stringify(enabledmessagesnames)} making sure to avoid ${JSON.stringify(lasttimedmessagenames)}`)
    }
    while (lasttimedmessagenames.includes(nextmessage.name))
    
  }
  
  
    chat.message(nextmessage.message)
    nextmessage.time = now;
    lastTimedMessages.unshift(nextmessage)
  
    if(lastTimedMessages.length > (Math.floor(enabledMessages.length*0.5)+1)) {  // Mainly for the random order one. Makes sure to keep the previous messages to at least 50% of what was recently sent to reduce the odds of duplicated messages
      lastTimedMessages.pop();
    }
  
    console.debug(JSON.stringify(lastTimedMessages))
    fs.writeFileSync('./files/settings.json',JSON.stringify(settings))
    
  
  
}


function tickCheck(){
  let now = new Date();
  // DO OUR REGULAR CHECKS
  
  // Are we ready to send out the next message?
      // Is the streamer online? Does the title or tags contain what's needed for certain timer messages?
  
  if(messageDelay==undefined) { sync(); }
  
  //console.log(`lastTimedMessages = ${JSON.stringify(lastTimedMessages)}`)
  
  if(lastTimedMessages.length==0) { lastTimedMessages = [{name:"",time:new Date()}];}
  if(lastTimedMessages[0].time==undefined) {lastTimedMessages.time = now}
  
  //console.debug(`now-lastTimedMessages[0].now (${now-lastTimedMessages[0].time}) > messageDelay (${messageDelay}) = ${now-lastTimedMessages[0].time > messageDelay}`)
  
  if(now-lastTimedMessages[0].time > messageDelay) {
    sendMessage(now);
  }
  

  
  // After 10 minutes of inactivity in chat, switch to the slow ticker mode, to reduce API calls.
  if(now - lastUserMessageSentAt > minsDelayBeforeInactiveMode*60*1000) {
    if(interval==undefined || interval._repeat!=slowTicker*60*1000) {
      console.debug("Slow mode activated")
      clearInterval(interval);
      interval = setInterval(tickCheck, slowTicker*60*1000);
    }
  } else {
    if(interval==undefined || interval._repeat!=defaultTick*1000) {
      console.debug("Regular tick mode activated")
      clearInterval(interval);
      interval = setInterval(tickCheck, defaultTick*1000);
      }
    }

}


function isNumeric(str) {
  if (typeof str != "string") return false // we only process strings!  
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
         !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}


module.exports.sync = sync;