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
          var parseConfig = Parse.Config.get().then(function(parseConfig) {
            console.log('zomg zomg');
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
                "startAtInSeconds": song.get('second_offset')
              }
            }).then(function(result) {
              return Promise.as({
                'username': user.get('username'),
                'artist_name': song.get('artist_name'),
                'song_name': song.get('song_name')
              });
            });
          });
        });
      });
    });
    return promise;
  }).then(function(result) {
      status.success(result);
    }, function(err) {
      console.log(err);
      status.error(err.message);
    }
  );

});

function getSongByDay(user, callbacks) {
  var weekday = new Date().getDay();
  
  var scheduleQuery = new Parse.Query("WeekdaySchedule");
  scheduleQuery.equalTo("weekday", weekday);
  scheduleQuery.equalTo("user", user);


  return scheduleQuery.first().then(function(schedule) {
    var songQuery = new Parse.Query("Song");
    return songQuery.get(schedule.get('song').id);
  });
}