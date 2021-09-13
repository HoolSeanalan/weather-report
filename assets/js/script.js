//API Keys
const WEATHER_KEY = "b8eeb0b2a72eecc8838eb01079dcfd19"
const MAP_KEY = "bY4xLHUy7tBGNTdWRd0D4DHpXeCIKfwr"

//Start of localStorage functionality scripts
function saveCity(city) {
    var savedCities = JSON.parse(window.localStorage.getItem("SavedCities")) ?? "";
    savedCities = `<button onclick="getCoordinatesSaved('${city}')" >${city}</button><br>${savedCities}`
    window.localStorage.setItem("SavedCities", JSON.stringify(savedCities));
}

function loadCities() {
    document.getElementById("savedCities").innerHTML = JSON.parse(window.localStorage.getItem("SavedCities")) ?? "";
}

function clearCities() {
    window.localStorage.setItem("SavedCities", JSON.stringify(""));
    loadCities();
}
//End of localStorage functionality scripts

//Sets current day weather info
function setCurrent(city, currentWeather) {
    var currentDate = new Date(currentWeather.dt*1000);
    document.getElementById("currentWeather").innerHTML =
        `<h2>${city} (${currentDate.getMonth()}/${currentDate.getDate()}/${currentDate.getFullYear()})</h2><img src="https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}.png"></img><br>
        <div>Temp: ${currentWeather.temp} &#176;F</div>
        <div>Wind: ${currentWeather.wind_speed} MPH</div>
        <div>Humidity: ${currentWeather.humidity} %</div>
        <div class="uv">
            <div>UV Index:</div>
            <div id="uvIndex">${currentWeather.uvi}</div>
        </div>`;
    if (currentWeather.uvi < 0.25) {
        document.getElementById("uvIndex").style.backgroundColor = 'green';
    }
    else if (currentWeather.uvi > 0.25 && currentWeather.uvi < 0.50) {
        document.getElementById("uvIndex").style.backgroundColor = 'yellow'
    }
    else if (currentWeather.uvi < 0.50 && currentWeather.uvi < 0.75) {
        document.getElementById("uvIndex").style.backgroundColor = 'orange'
    }
    else {
        document.getElementById("uvIndex").style.backgroundColor = 'red'
    }
}

//Sets weather info for next 5 days
function setDaily(dailyWeather) {
    var fiveDays = ""
    var date = new Date()
    for (var i = 1; i<6; i++) {
        date.setTime(dailyWeather[i].dt*1000)
        fiveDays =
            `${fiveDays}
            <div class="futureDay">
                <h3>${date.getMonth()}/${date.getDate()}/${date.getFullYear()}</h3>
                <img src="https://openweathermap.org/img/wn/${dailyWeather[i].weather[0].icon}.png"></img><br>
                <div>Temp: ${dailyWeather[i].temp.max} &#176;F</div>
                <div>Wind: ${dailyWeather[i].wind_speed} MPH</div>
                <div>Humidity: ${dailyWeather[i].humidity} %</div>
            </div>`
    }
    document.getElementById("fiveTitle").innerHTML = "5-Day Forecast:"
    document.getElementById("dailyWeather").innerHTML = fiveDays
}

//Calls the methods which set weather info
function getWeather(city, latLng) {
    $.ajax({
        url:`https://api.openweathermap.org/data/2.5/onecall?lat=${latLng.lat}&lon=${latLng.lng}&exclude=minutely,hourly,alerts&units=imperial&appid=${WEATHER_KEY}`,
        success: function(res) {
            setCurrent(city, res.current)
            setDaily(res.daily)
        }
    })
}

//Obtains coordinates for city user entered and calls getWeather()
//also updates localStorage
function getCoordinates() {
    var city = document.getElementById("searchText").value
    $.ajax({
        url:`https://www.mapquestapi.com/geocoding/v1/address?location=${city.split(" ").join("")}&key=${MAP_KEY}`,
        success: function(res) {
            var city = res.results[0].locations[0].adminArea5
            if (city == "") {
                city = "No City Name Found"
            }
            loadCities()
            saveCity(city)
            getWeather(city, res.results[0].locations[0].latLng)
        }
    })
}

//getCoordinates() but called by saved city buttons
function getCoordinatesSaved(city) {
    $.ajax({
        url:`https://www.mapquestapi.com/geocoding/v1/address?location=${city.split(" ").join("")}&key=${MAP_KEY}`,
        success: function(res) {
            var city = res.results[0].locations[0].adminArea5
            loadCities()
            getWeather(city, res.results[0].locations[0].latLng)
        }
    })
}

//Gives buttons functions and loads saved cities
window.onload = function() {
    document.getElementById("citySearch").addEventListener("click", getCoordinates);
    document.getElementById("clearCities").addEventListener("click", clearCities);
    loadCities();
}