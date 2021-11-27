const fs = require('fs')
const { ApiClient } = require('@twurple/api');
var emotes = JSON.parse(fs.readFileSync("./files/emotes.json", "UTF-8"));
var broadcasterName = process.env.CHANNEL;
var broadcasterId;

const { ClientCredentialsAuthProvider } = require('@twurple/auth');
const authProvider = new ClientCredentialsAuthProvider(process.env.TWITCHAPI_ID, process.env.TWITCHAPI_SECRET);
const apiClient = new ApiClient({ authProvider });

// =====================================================================================================
// This makes calls to the general twitch API which is done with my app's credentials.
// These things, such as finding out what they were last playing, or what their emotes
// are, aren't 
// =====================================================================================================


exports.getBroadcasterId = async function() {
  
  try {
    var user = await apiClient.users.getUserByName(process.env.CHANNEL);
   console.debug(`Broadcaster Object: ${JSON.stringify(user)}`)
    if (!user) {
      console.log("No user found")
      return "";
    }
    broadcasterId = user;
    getEmotes()
    return user;
    
  } catch (err) {
    console.log(err);
    return "";
  }
  
}


//this.getBroadcasterId();

setTimeout(() => {this.getBroadcasterId()}, 1000);  //Object.getOwnPropertyNames(broadcasterId);

exports.getGameInfo = async function(gamename) {
  try {
    const game = await apiClient.games.getGameByName(gamename)
    if(!game) {
      return "...I'm not sure"
    }
  }catch(e){
    return "...I'm not sure"
  }
  
}


exports.lastPlaying = async function(userName, found, nouserfound) {
  try {
    const user = await apiClient.users.getUserByName(userName);
    console.log(user['displayName'])
    if (!user) {
      nouserfound();
    }
    const val = await apiClient.channels.getChannelInfo(user.id);

    //console.log(val["gameName"]);
    found(val);
    return;
  } catch (err) {
    console.log(err)
    nouserfound();
  }
}


async function getEmotes() {

  //bitemotes = new Array();
  emotes = await apiClient.chat.getChannelEmotes(broadcasterId);
  
  if(!emotes) {
    console.log("No emotes found");
    return;
  }
  
  for(var e in emotes) {
    
    if(emotes[e].type === 'subscriptions') {
      console.log({tier:emotes[e].tier, name:emotes[e].name})
    }
    
    
  }
}