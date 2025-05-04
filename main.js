// Select DOM elements
const weathercity = document.querySelector("#city");
const weathericon = document.querySelector("#weathericon");
const weatherDisc = document.querySelector(".weatherDisc");
const temp = document.querySelector(".temp");
const gust = document.querySelector("#gust");
const feel = document.querySelector(".feel");
const weatherWind = document.querySelector("#wind");
const air = document.querySelector("#air");
const weatherhum = document.querySelector("#hum");
const press = document.querySelector("#press");
const uv = document.querySelector("#uv");
const date = document.querySelector("#date");
const time = document.querySelector(".dayTime");
const icon = document.createElement("img");

const apiKey = import.meta.env.VITE_API_KEY;
const baseUrl = "https://api.openweathermap.org/data/2.5";

// Default city
let city = "Azamgarh";

// Fetch weather based on city name
async function fetchWeatherByCity(city) {
  try {
    const response = await fetch(
      `${baseUrl}/weather?q=${city}&appid=${apiKey}`
    );
    if (!response.ok) throw new Error("Failed to fetch weather data");
    loadingOff();

    const data = await response.json();
    const { lon, lat } = data.coord;
    await fetchFullWeatherInfo(data, lat, lon);
  } catch (error) {
    console.log("Error fetching city weather:", error);
  }
}

// Fetch weather based on coordinates
async function fetchWeatherByCoordinates(lat, lon) {
  try {
    const response = await fetch(
      `${baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`
    );
    if (!response.ok) throw new Error("Failed to fetch weather data");
    loadingOff();

    const data = await response.json();
    await fetchFullWeatherInfo(data, lat, lon);
  } catch (error) {
    console.log("Error fetching location weather:", error);
  }
}

// Fetch UV and AQI data
async function fetchFullWeatherInfo(data, lat, lon) {
  try {
    const { weather, wind, name, dt, main } = data;

    // Fetch UV data
    const uvResponse = await fetch(
      `${baseUrl}/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`
    );
    const uvData = await uvResponse.json();

    // Fetch Air Quality Index (AQI)
    const aqiResponse = await fetch(
      `${baseUrl}/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
    );
    const aqiData = await aqiResponse.json();

    // Update UI
    updateWeatherUI(weather, wind, name, dt, main, uvData.value, aqiData.list);
  } catch (error) {
    console.log("Error fetching full weather info:", error);
  }
}

// Update UI elements with weather data
function updateWeatherUI(weather, wind, name, dt, main, uvValue, aqiList) {
  weathercity.innerHTML = `${name}`;
  icon.setAttribute("src", './icons/arrow.png');
  weathercity.appendChild(icon);
  weathercity.addEventListener("click", addCitySearch);
  weathericon.src = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;
  temp.innerHTML = `+${Math.floor(main.temp - 273.15)}°C`;
  weatherDisc.innerHTML = `${weather[0].description}`;
  feel.innerHTML = `Feels Like +${Math.ceil(main.feels_like - 273.15)}°C`;
  weatherWind.innerHTML = `${Math.floor(wind.speed * 3.6)} km/h`;
  weatherhum.innerHTML = `${main.humidity} %`;
  if (wind.hasOwnProperty("gust")) {
    gust.innerHTML = `${Math.round(wind.gust)} km/h`;
  } else {
    gust.innerHTML = `${0}`;
  }
  press.innerHTML = `${main.pressure} mb`;
  uv.innerHTML = `${Math.round(uvValue)}`;
  air.innerHTML = `${aqiList[0].main.aqi} AQI`;
  const dateVal = new Date(dt * 1000);
  const actDat = dateVal.toString().split(" ");
  const actTime = actDat[4].split(":");
  date.innerHTML = `Today, ${actDat[1]} ${actDat[2]} `;
  time.innerHTML = `${actDat[0]} ${actTime[0]}:${actTime[1]}`;
}

// Get user's location
function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        fetchWeatherByCoordinates(latitude, longitude);
      },
      (error) => {
        console.log("Geolocation error:", error);
        fetchWeatherByCity(city); // Fetch default city if location denied
      }
    );
  } else {
    console.log("Geolocation is not supported.");
    fetchWeatherByCity(city); // Fetch default city if geolocation not available
  }
}

// Add input box for searching a city
function addCitySearch() {
  const div = document.createElement("div");
  const input = document.createElement("input");
  const btn = document.createElement("button");
  const form = document.createElement("form");
  // form.setAttribute("action", "");
  div.classList.add("city");
  btn.innerHTML = "Search";
  weathercity.replaceWith(div);
  form.appendChild(input);
  form.appendChild(btn);
  div.appendChild(form);

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const inputCity = input.value.trim();
    if (inputCity) {
      fetchWeatherByCity(inputCity);
      div.replaceWith(weathercity);
    }
  });

  window.addEventListener("click", (e) => {
    if (!div.contains(e.target) && e.target != weathercity) {
      div.replaceWith(weathercity);
    }
  });
}

function loadingOff() {
  let loader = document.getElementById("loader");
  loader.style.display = "none";
}

// Initialize app
function init() {
  getUserLocation(); // Fetch weather based on user's location
}

init();
