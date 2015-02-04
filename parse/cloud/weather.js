// See weather condition docs here:
// http://openweathermap.org/weather-conditions

function getCurrentWeatherCode() {
  return Parse.Cloud.httpRequest({
    method: 'GET',
    url: "http://api.openweathermap.org/data/2.5/weather?id=293397&units=metric",
    headers: {}
  }).then(function (response) {
    return response.data.weather[0].id;
  });
}

function getSongByWeatherCode(user, weatherCode) {
  var scheduleQuery = new Parse.Query("WeatherSchedule");
  scheduleQuery.equalTo("weather_codes", weatherCode); // This is actually an 'IN' query
  scheduleQuery.equalTo("user", user);

  return scheduleQuery.first().then(function(schedule) {
    var songQuery = new Parse.Query("Song");
    return songQuery.get(schedule.get('song').id);
  });
}

function getSongByWeather(user) {
  return getCurrentWeatherCode().then(function(weatherCode) {
    console.log("Got weather code = " + weatherCode);
    return getSongByWeatherCode(user, weatherCode);
  });
}

module.exports = getSongByWeather;