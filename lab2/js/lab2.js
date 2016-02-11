var apiQueryBase = "https://api.forecast.io/forecast/c270d67d6a5d2b953ba7b597d3da24b4/"; //forecast.io api query string
var jsonGlobal; //global variable where the json data will be stored
var locationGlobal; //current location information
var currentDay = 0; //index of most recently added day in the scrolling forecast
var nextToDelete = 0; //id of the day next to be removed from the scrolling forecast
var skycons; //a global that holds an instance of skycons by forecast.io

/*
	Function that writes the current weather to the screen
*/
function drawCurrentWeather() {
    var current = jsonGlobal.currently;
    skycons.add("wicon", current.icon);
    skycons.play();
    var s_html = "<p><h3>" + current.summary + "</h3></p>";
    var temp_html = "<p><h4>" + current.temperature + "°f</h4></p>";
    var wind_html = "<p><h4>" + current.windSpeed + " mph</h4></pa>";
    var hum_html = "<p><h4>" + current.humidity + "% humidity</h4></pa>";
    $("#weather_info").append(s_html + temp_html + wind_html + hum_html);
}

/*
	Function that writes "numElements" number of daily forecasts to the forecasts div.
		-This function is what is used to create the initial 4 forecasts
		-This function's possible uses are not restricted to creating the initial forecasts
*/
function drawInitialForecast(numElements) {
    var daily = jsonGlobal.daily.data;
    var i;
    for (i = currentDay; i < currentDay + numElements; i++) {
        var date = new Date(daily[i].time * 1000);
        var final_html = '<li class="list-group-item" id="forecastElement' + i + '"><h4>' + date.toLocaleDateString() + '</h4><h5> low ' + daily[i].temperatureMin + '°f high ' + daily[i].temperatureMax + '°f</h5><h5>' + daily[i].summary + ' ' + '</h5></li>';
        $("#forecast").prepend(final_html);
    }
    currentDay += i;
}

/*
	Function that removes the oldest forecast element and then places the newest forecast element in the forecasts area
*/
function forecastCycle() {
    $("#forecastElement" + nextToDelete).hide(200, function() {
        $("#forecastElement" + nextToDelete).remove();
        nextToDelete += 1;
        if (nextToDelete > jsonGlobal.daily.data.length - 1)
            nextToDelete = 0;
        var curDay = jsonGlobal.daily.data[currentDay];
        var date = new Date(curDay.time * 1000);
        var final_html = '<li style="display:none;" class="list-group-item" id="forecastElement' + currentDay + '"><h4>' + date.toLocaleDateString() + '</h4> <h5>' + curDay.temperatureMin + '°f low ' + curDay.temperatureMax + '°f high</h5><h5>' + curDay.summary + '</h5> ' + '</li>';
        $("#forecast").prepend(final_html);
        $("#forecastElement" + currentDay).show(200);
        currentDay += 1;
        if (currentDay > jsonGlobal.daily.data.length - 1)
            currentDay = 0;
    });
}

/*
  Function to retrieve user location
*/
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(locationRetrieved);
    } else {
        alert("Location not enabled!");
    }
}

/*
  Callback for getLocation function
*/
function locationRetrieved(position) {
    locationGlobal = position;
    var finalQuery = apiQueryBase + position.coords.latitude + ',' + position.coords.longitude;
    $.ajax({
        dataType: "jsonp",
        url: finalQuery,
        success: handleSetup
    });
}

/*
	Initial setup function called if the weather data is successfully retrieved
*/
function handleSetup(json) {
    jsonGlobal = json;
    skycons = new Skycons({
        "color": "black"
    });
    drawCurrentWeather();
    drawInitialForecast(4);
    setInterval(forecastCycle, 5000);
}

/*
	Initial request for the users location
*/
$(document).ready(function() {
    getLocation();
});
