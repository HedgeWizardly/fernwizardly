const { createLogger, format, transports } = require('winston');
const { combine, timestamp, prettyPrint } = format;

const logger = createLogger({
  
  transports: [ 
    new transports.Console({level:'debug', format: format.simple()}),
    new transports.File({format: combine(
    timestamp(),
    prettyPrint()
  ),
      filename: '/app/files/winston.json'
    })]
});

console.warn = function(){return logger.warn.apply(logger, arguments)}
console.info = function(){return logger.info.apply(logger, arguments)}    /* Use this for chat messages to have them be saved*/
console.log = function(){return logger.verbose.apply(logger, arguments)}  /* Use this for general log stuff*/ 
console.debug = function(){return logger.debug.apply(logger, arguments)}  /* Use this for breakpointing and trying to figure out problems */ 

// const levels = { 
//   error: 0,
//   warn: 1,
//   info: 2,
//   http: 3,
//   verbose: 4,
//   debug: 5,
//   silly: 6
// };


// Require relevant packages
const path                                            = require("path");
const express                                         = require('express');
const app                                             = express();
const fs                                              = require('fs');
const cookieSession                                   = require('cookie-session');
const request                                         = require('request');
const { ClientCredentialsAuthProvider, exchangeCode } = require("@twurple/auth");
const { ApiClient }                                   = require("@twurple/api");
const passport                                        = require('passport');
require('dotenv').config();

// Require our individual scripts
const chat = require('./handlers/chat')  // This is going to be our output. Mainly using chat.message("Your Text Here");
const commandhandler = require('./handlers/commandhandler');
const messagehandler = require('./handlers/messagehandler');
const twitchapi = require('./handlers/twitchapi');
const shoutout = require('./handlers/shoutout');
const timers = require('./handlers/timers');
const passportsetup  = require('./site/config/passport-setup')
const authRoutes     = require('./site/routes/auth-routes');
const profileRoutes     = require('./site/routes/profile-routes');
const messageRoutes = require('./site/routes/message-routes');
const overlayRoutes = require ('./site/routes/overlay-routes');

// Get files
var setmessages = JSON.parse(fs.readFileSync('./files/setmessages.json'))
var settings = JSON.parse(fs.readFileSync('./files/settings.json'))


const { StaticAuthProvider } = require('@twurple/auth');
const authProvider = new StaticAuthProvider(process.env.TWITCHAPI_ID, process.env.BOT_TOKEN, ['chat:read', 'chat:edit', 'channel:moderate']);
const { ChatClient } = require('@twurple/chat');
const chatClient = new ChatClient({ authProvider, channels: [process.env.CHANNEL], isAlwaysMod:true });

chatClient.connect();

chatClient.onConnect(() => { 
  console.log("Connected to "+process.env.CHANNEL+"'s chat.")
  chat.client = chatClient;

});

app.set('view engine', 'ejs');

app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));

app.use(cookieSession({
  maxAge:24*60*60*1000,
  keys:[process.env.COOKIE_KEY]
}));

//initialise passport to use cookies
app.use(passport.initialize());
app.use(passport.session());
app.set('views', path.join(__dirname, 'site/views'));
app.use('/public', express.static('public'));
app.use('/auth',authRoutes);
app.use('/profile',profileRoutes);
app.use('/messages',messageRoutes);
app.use('/overlay',overlayRoutes);

app.get('/',function(req,res){
  res.render('login');
});


app.listen(process.env.PORT, async () => {
  //console.log(`Listening on port: ${process.env.PORT}`);
  
});




// // ==========================================================================================================
// // ============================ START LISTENING FOR STUFF ===================================================
// // ==========================================================================================================




chatClient.onMessage(async (channel, user, message, tags) => {

    let now = new Date();
    console.info(`${user}: ${message}`)
    let pureMessage = tags.parseEmotes().filter(obj => {  // pureMessage is whatever the message is but WITHOUT any emotes.
      return (obj.type=="text" && obj.text!=" ");
    }).map((obj)=>{
      
      return obj.text.trim()
    }).join(" ");
      //console.debug(pureMessage)

      if(user==process.env.BOT_USERNAME) {  // Don't do anything if we're picking up our own messages. Like a dog being startled by its own fart. We do wanna log the timestamp though for reference with our timers
        timers.myLastMessageSentAt = new Date();
        
        return;
      }

  
      timers.lastUserMessageSentAt = now;
      timers.resetTicker();
  
  if(message.startsWith('!')) {  // If it starts with a ! (you can change this, but it'll need changing in the commandhandler too) then we're saying it's a command. 
    commandhandler.$(tags.userInfo.displayName, user, message, tags, tags.isMod || user == process.env.CHANNEL);  // For some reason, broadcasters don't technically carry the MOD tag, so we have to check if it's a moderator OR the broadcaster
    
  } else {  // Otherwise, send the message to the messagehandler
    messagehandler.$(tags.userInfo.displayName, user, message, tags);
    
  }
});


chatClient.onRaid((channel, user, raidInfo, msg) => {
  
  chat.message(setmessages.raidbuffer);
  chat.message(setmessages.welcomeraiders);
  chat.message(setmessages.raidbuffer);
  shoutout.$(user);

});


chatClient.onResub((channel, user, subInfo, msg) => { /* ... */ })
chatClient.onRewardGift((channel, user, rewardGiftInfo, msg) => { /* ... */ })
chatClient.onSub((channel, user, subInfo, msg) => { /* ... */ })
chatClient.onSubExtend((channel, user, subInfo, msg) => { /* ... */ })
chatClient.onSubGift((channel, user, subInfo, msg) => { /* ... */ })