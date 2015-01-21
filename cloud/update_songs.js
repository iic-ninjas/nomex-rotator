var _ = require('underscore');

Parse.Cloud.job("update_songs", function(request, status) {
  // Set up to modify user data
  Parse.Cloud.useMasterKey();

  var query = new Parse.Query(Parse.User);
  return query.find().then(function(users) {
    var promise = Parse.Promise.as();
    _.each(users, function(user) {
      promise = promise.then(function() {
        return getSongByDay(user).then(function(song){
          return updateSong(user, song);
        });
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

function updateSong(user, song) {
  return Parse.Config.get().then(function(parseConfig) {
    console.log("Updating " + user.get('username') + "'s song to '" + song.get('artist_name') + " - " + song.get('song_name') + "'")
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

function getSongByDay(user) {
  var weekday = new Date().getDay();
  
  var scheduleQuery = new Parse.Query("WeekdaySchedule");
  scheduleQuery.equalTo("weekday", weekday);
  scheduleQuery.equalTo("user", user);


  return scheduleQuery.first().then(function(schedule) {
    var songQuery = new Parse.Query("Song");
    return songQuery.get(schedule.get('song').id);
  });
}