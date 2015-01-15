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
          console.log("song: " + song.get('song_name'))
        });
      });
    });
  }).then(function() {
      status.success("awesome");
    }, function(err) {
      status.error(err);
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