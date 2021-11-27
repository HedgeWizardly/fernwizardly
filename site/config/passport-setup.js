const passport       = require('passport');
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
const request        = require('request');
const TWITCH_CLIENT_ID = process.env.TWITCHAPI_ID;
const TWITCH_SECRET    = process.env.TWITCHAPI_SECRET;
const CALLBACK_URL     = `https://${process.env.PROJECT_DOMAIN}.glitch.me/auth/twitch/redirect`;  // http://localhost:3000/auth/twitch/callback



// Override passport profile function to get user profile from Twitch API
OAuth2Strategy.prototype.userProfile = function(accessToken, done) {
  var options = {
    url: 'https://api.twitch.tv/helix/users',
    method: 'GET',
    headers: {
      'Client-ID': TWITCH_CLIENT_ID,
      'Accept': 'application/vnd.twitchtv.v5+json',
      'Authorization': 'Bearer ' + accessToken
    }
  };

  request(options, function (error, response, body) {
    if (response && response.statusCode == 200) {
      console.log(body)
      done(null, JSON.parse(body));
    } else {
      console.log(body)
      done(JSON.parse(body));
    }
  });
}

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use('twitch', new OAuth2Strategy({
    authorizationURL: 'https://id.twitch.tv/oauth2/authorize',
    tokenURL: 'https://id.twitch.tv/oauth2/token',
    clientID: process.env.TWITCHAPI_ID,
    clientSecret: process.env.TWITCHAPI_SECRET,
    callbackURL: CALLBACK_URL,
    //state: true
  },
  function(accessToken, refreshToken, profile, done) {
  //console.log("passport callback function")
  //console.log(profile)
  //airtabledb.getCodes(profile.label)
    profile.accessToken = accessToken;
    profile.refreshToken = refreshToken;

    done(null, profile);
  }
));