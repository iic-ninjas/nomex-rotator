var _ = require('underscore');

var getSongByDay = require('cloud/weekday.js');
var getSongByWeather = require('cloud/weather.js');

Parse.Cloud.job("update_songs", function(request, status) {
  // Set up to modify user data
  Parse.Cloud.useMasterKey();

  var query = new Parse.Query(Parse.User);
  return query.find().then(function(users) {
    var promise = Parse.Promise.as();
    _.each(users, function(user) {
      promise = promise.then(function() {
        return updateSongForUser(user);
      });
    });
    return promise;
  }).then(function() {
      status.success("Cool.");
    }, function(err) {
      status.error(err.message);
    }
  );

});

function updateSongForUser(user) {
  var getSongFunction = null;
  if (user.get('update_method') === 'weekday') {
    getSongFunction = getSongByDay;
    console.log("updating songs for " + user.get('username') + " by weekday.");
  } else if (user.get('update_method') === 'weather') {
    getSongFunction = getSongByWeather;
    console.log("updating songs for " + user.get('username') + " by weather.");
  }

  return getSongFunction(user).then(function(song){
    if (song != null) {
      return updateSongInNomex(user, song);
    } else {
      return Parse.Promise.as();
    }
  });
}

function updateSongInNomex(user, song) {
  return Parse.Config.get().then(function(parseConfig) {
    console.log("Updating " + user.get('username') + "'s song to '" + song.get('artist_name') + " - " + song.get('song_name') + "'");
    return Parse.Cloud.httpRequest({
      method: 'POST',
      url: "https://api.parse.com/1/functions/changeSong",
      headers: {
        "X-Parse-Application-Id": parseConfig.get('nomex_application_id'),
        "X-Parse-REST-API-Key": parseConfig.get('nomex_api_key'),
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: {
        "token": user.get('nomex_id'),
        "song": user.get('song_id'),
        "name": song.get('song_name'),
        "artist": song.get('artist_name'),
        "youtubeId": song.get('youtube_id'),
        "startAtInSeconds": song.get('second_offset')*1
      }
    });
  });
}

