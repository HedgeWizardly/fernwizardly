const apicalls = require('./apicalls');
const fs = require('fs');

const cacheRefreshFrequency = 120;  // In Minutes

var pronounsCache = JSON.parse(fs.readFileSync('./files/pronounscache.json'))

const defaultPronoun = "theythem";

module.exports.$ = async function(username, callback) {
  
  let today = new Date();
  // If we can't find it in the cache, make a new api call for it. If they don't have their pronoun set, default to they/them (it's politer that way)
  
  if(username in pronounsCache) {
  
    //console.debug(`today (${today}) - pronounsCache[username].lastupdated (${pronounsCache[username].lastupdated} = ${today - new Date(pronounsCache[username].lastupdated)}`)
    
    if(today - new Date(pronounsCache[username].lastupdated) < cacheRefreshFrequency*1000) {  // If the cacheRefreshFrequency time has not yet passed since the last time we grabbed their pronouns, use the pronouns from the cache
      callback(pronounsCache[username].pronouns)
      return;  // Exit the function now we've sent the pronouns back, otherwise it'll try and call the pronouns api again before it's needed
    }
  
  }
  
  
  apicalls.pronouns(username, (r)=> {
    if(r==null) r=defaultPronoun;
    pronounsCache[username]={}
    pronounsCache[username].pronouns = r;
    pronounsCache[username].lastupdated = today;
    fs.writeFileSync('./files/pronounscache.json', JSON.stringify(pronounsCache))
    
    callback(r);
  });
  
}

module.exports.convert = async function(username, message, callback) {
  
  this.$(username,(r)=>{
    
    message = message.replace("theyre","they're")
    .replace("theyve","they've");
    
    if(r.startsWith("she")) {  
      message = message.replace(/(?<=[^a-zA-Z]*)they're(?=[^a-zA-Z]+)/gi, function(match) {
    return matchCase("she's", match);
    });

    message = message.replace(/(?<=[^a-zA-Z]*)they were(?=[^a-zA-Z]+)/gi, function(match) {
        return matchCase("she was", match);
    });

    message = message.replace(/(?<=[^a-zA-Z]*)they are(?=[^a-zA-Z]+)/gi, function(match) {
        return matchCase("she is", match);
    });

    message = message.replace(/(?<=[^a-zA-Z]*)they have(?=[^a-zA-Z]+)/gi, function(match) {
        return matchCase("she is", match);
    });

    message = message.replace(/(?<=[^a-zA-Z]*)they've(?=[^a-zA-Z]+)/gi, function(match) {
        return matchCase("she's", match);
    });

    message = message.replace(/(?<=[^a-zA-Z]*)they(?=[^a-zA-Z]+)/gi, function(match) {
        return matchCase("she", match);
    });

    message = message.replace(/(?<=[^a-zA-Z]*)them(?=[^a-zA-Z]+)/gi, function(match) {
        return matchCase("her", match);
    });

    message = message.replace(/(?<=[^a-zA-Z]*)their(?=[^a-zA-Z]+)/gi, function(match) {
        return matchCase("her", match);
    });
      
      
    } if(r.startsWith("he")) {  
      message = message.replace(/(?<=[^a-zA-Z]*)they're(?=[^a-zA-Z]+)/gi, function(match) {
    return matchCase("he's", match);
    });

    message = message.replace(/(?<=[^a-zA-Z]*)they were(?=[^a-zA-Z]+)/gi, function(match) {
        return matchCase("he was", match);
    });

    message = message.replace(/(?<=[^a-zA-Z]*)they are(?=[^a-zA-Z]+)/gi, function(match) {
        return matchCase("he is", match);
    });

    message = message.replace(/(?<=[^a-zA-Z]*)they have(?=[^a-zA-Z]+)/gi, function(match) {
        return matchCase("he is", match);
    });

    message = message.replace(/(?<=[^a-zA-Z]*)they've(?=[^a-zA-Z]+)/gi, function(match) {
        return matchCase("he's", match);
    });

    message = message.replace(/(?<=[^a-zA-Z]*)they(?=[^a-zA-Z]+)/gi, function(match) {
        return matchCase("he", match);
    });

    message = message.replace(/(?<=[^a-zA-Z]*)them(?=[^a-zA-Z]+)/gi, function(match) {
        return matchCase("him", match);
    });

    message = message.replace(/(?<=[^a-zA-Z]*)their(?=[^a-zA-Z]+)/gi, function(match) {
        return matchCase("his", match);
    });
      
      
    } 
    
    callback(message);
 
    
    
  });
  
  
  
}



function matchCase(text, pattern) {
    var result = '';

    for(var i = 0; i < text.length; i++) {
        var c = text.charAt(i);
        var p = pattern.charCodeAt(i);

        if(p >= 65 && p < 65 + 26) {
            result += c.toUpperCase();
        } else {
            result += c.toLowerCase();
        }
    }

    return result;
}