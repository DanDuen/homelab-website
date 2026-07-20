let calendarEvents = [];


function updateClock() {

    const now = new Date();

    document.getElementById("clock").textContent =
        now.toLocaleTimeString();

    document.getElementById("date").textContent =
        now.toLocaleDateString([], {
            weekday: "long",
            month: "long",
            day: "numeric"
        });

}


updateClock();

setInterval(updateClock, 1000);


function formatDateString(date) {

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


function createCalendar() {

    const calendarGrid = document.getElementById("calendar-grid");
    const calendarHeader = document.getElementById("calendar-header");

    const today = new Date();

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const formatShort = (d) =>
        d.toLocaleDateString([], { month: "short", day: "numeric" });

    calendarHeader.textContent =
        `${formatShort(startOfWeek)} - ${formatShort(endOfWeek)}`;

    calendarGrid.innerHTML = "";

    const todayString = formatDateString(today);

    for (let i = 0; i < 7; i++) {

        const dayDate = new Date(startOfWeek);
        dayDate.setDate(startOfWeek.getDate() + i);

        const dateString = formatDateString(dayDate);

        const dayRow = document.createElement("div");
        dayRow.className = "day-row";

        if (dateString === todayString) {
            dayRow.classList.add("today");
        }

        const dayLabel = dayDate.toLocaleDateString([], {
            weekday: "long",
            month: "short",
            day: "numeric"
        });

        const eventsForDay = calendarEvents.filter(event =>
            event.date === dateString
        );

        let eventHTML = "";

        if (eventsForDay.length === 0) {

            eventHTML = `<div class="no-events">No events</div>`;

        } else {

            eventsForDay.forEach(event => {

                eventHTML += `
                    <div class="event">
                        <div class="event-time">${event.time}</div>
                        <div class="event-title">${event.title}</div>
                    </div>
                `;

            });

        }

        dayRow.innerHTML = `
            <div class="day-label">${dayLabel}</div>
            <div class="day-events">${eventHTML}</div>
        `;

        calendarGrid.appendChild(dayRow);

    }

}


async function loadCalendar() {

    try {

        const response = await fetch(
            `calendar.json?t=${Date.now()}`
        );

        calendarEvents = await response.json();

    } catch (error) {

        console.error(
            "Calendar loading error:",
            error
        );

        calendarEvents = [];

    }

    createCalendar();

}


// Initial load
loadCalendar();

// Refresh every 5 minutes
setInterval(loadCalendar, 60000);


// ----------------------
// Weather
// ----------------------

// Fallback location used if browser geolocation fails or is denied
const FALLBACK_LATITUDE = 29.9841;
const FALLBACK_LONGITUDE = -90.1529;

// WMO weather codes -> simple description + emoji icon
// Reference: https://open-meteo.com/en/docs
const WEATHER_CODES = {
    0: { text: "Clear sky", icon: "☀️" },
    1: { text: "Mainly clear", icon: "🌤️" },
    2: { text: "Partly cloudy", icon: "⛅" },
    3: { text: "Overcast", icon: "☁️" },
    45: { text: "Fog", icon: "🌫️" },
    48: { text: "Fog", icon: "🌫️" },
    51: { text: "Light drizzle", icon: "🌦️" },
    53: { text: "Drizzle", icon: "🌦️" },
    55: { text: "Heavy drizzle", icon: "🌦️" },
    61: { text: "Light rain", icon: "🌧️" },
    63: { text: "Rain", icon: "🌧️" },
    65: { text: "Heavy rain", icon: "🌧️" },
    71: { text: "Light snow", icon: "🌨️" },
    73: { text: "Snow", icon: "🌨️" },
    75: { text: "Heavy snow", icon: "🌨️" },
    80: { text: "Rain showers", icon: "🌦️" },
    81: { text: "Rain showers", icon: "🌦️" },
    82: { text: "Violent showers", icon: "⛈️" },
    95: { text: "Thunderstorm", icon: "⛈️" },
    96: { text: "Thunderstorm w/ hail", icon: "⛈️" },
    99: { text: "Thunderstorm w/ hail", icon: "⛈️" }
};


function describeWeatherCode(code) {

    return WEATHER_CODES[code] || { text: "Unknown", icon: "❓" };

}


async function fetchWeather(latitude, longitude) {

    const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${latitude}&longitude=${longitude}` +
        `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
        `&temperature_unit=fahrenheit` +
        `&timezone=auto` +
        `&forecast_days=2`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Open-Meteo request failed: ${response.status}`);
    }

    return response.json();

}


async function fetchLocationName(latitude, longitude) {

    try {

        const url =
            `https://api.bigdatacloud.net/data/reverse-geocode-client` +
            `?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Reverse geocode failed: ${response.status}`);
        }

        const data = await response.json();

        // Prefer city/town name, fall back to broader region if unavailable
        return data.city || data.locality || data.principalSubdivision || "Unknown location";

    } catch (error) {

        console.error("Location lookup error:", error);
        return "Unknown location";

    }

}


function renderWeather(data, locationName) {

    const weatherEl = document.getElementById("weather");
    const locationEl = document.getElementById("weather-location");

    if (locationEl) {
        locationEl.textContent = locationName;
    }

    const days = data.daily;

    const labels = ["Today", "Tomorrow"];

    let html = "";

    for (let i = 0; i < 2; i++) {

        const { text, icon } = describeWeatherCode(days.weathercode[i]);

        const high = Math.round(days.temperature_2m_max[i]);
        const low = Math.round(days.temperature_2m_min[i]);
        const rainChance = days.precipitation_probability_max[i];

        html += `
            <div class="weather-day">
                <div class="weather-label">${labels[i]}</div>
                <div class="weather-icon">${icon}</div>
                <div class="weather-desc">${text}</div>
                <div class="weather-temps">
                    <span class="weather-high">${high}°</span>
                    <span class="weather-low">${low}°</span>
                </div>
                <div class="weather-rain">💧 ${rainChance}%</div>
            </div>
        `;

    }

    weatherEl.innerHTML = html;

}


async function loadWeather(latitude, longitude) {

    try {

        const [weatherData, locationName] = await Promise.all([
            fetchWeather(latitude, longitude),
            fetchLocationName(latitude, longitude)
        ]);

        renderWeather(weatherData, locationName);

    } catch (error) {

        console.error("Weather loading error:", error);

        document.getElementById("weather").textContent =
            "Weather unavailable";

    }

}


function initWeather() {

    if (!navigator.geolocation) {

        loadWeather(FALLBACK_LATITUDE, FALLBACK_LONGITUDE);
        return;

    }

    navigator.geolocation.getCurrentPosition(

        (position) => {
            loadWeather(
                position.coords.latitude,
                position.coords.longitude
            );
        },

        (error) => {
            console.warn(
                "Geolocation denied or failed, using fallback:",
                error
            );
            loadWeather(FALLBACK_LATITUDE, FALLBACK_LONGITUDE);
        }

    );

}


// Initial load
initWeather();

// Refresh every 30 minutes
setInterval(initWeather, 30 * 60 * 1000);


// Initial load
initWeather();

// Refresh every 30 minutes (weather doesn't change as fast as your calendar)
setInterval(initWeather, 30 * 60 * 1000);

// ----------------------
// Quotes
// ----------------------

let quotesList = [];


function renderRandomQuote() {

    const quoteEl = document.getElementById("quote-display");

    if (quotesList.length === 0) {
        quoteEl.textContent = "No quotes available";
        return;
    }

    const randomIndex = Math.floor(Math.random() * quotesList.length);
    const chosen = quotesList[randomIndex];

    quoteEl.innerHTML = `
        <div class="quote-text">"${chosen.quote}"</div>
        <div class="quote-author">— ${chosen.author}</div>
    `;

}


async function loadQuotes() {

    try {

        const response = await fetch(
            `quotes.json?t=${Date.now()}`
        );

        quotesList = await response.json();

    } catch (error) {

        console.error("Quotes loading error:", error);

        quotesList = [];

    }

    renderRandomQuote();

}


// Initial load
loadQuotes();

// Pick a new random quote every 60 seconds
setInterval(renderRandomQuote, 60000);

// Re-fetch the file every 10 minutes in case you've added new quotes
setInterval(loadQuotes, 10 * 60 * 1000);

// ----------------------
// In-Progress Projects
// ----------------------

// Same API the projects.html Kanban board talks to.
const PROJECTS_API_BASE = "http://192.168.2.64:5050";


async function loadInProgressProjects() {

    const container = document.getElementById("projects-inprogress");

    try {

        const response = await fetch(`${PROJECTS_API_BASE}/projects`);
        const allProjects = await response.json();

        const inProgress = allProjects.filter(
            p => p.column === "in-progress" && !p.archived
        );

        const professional = inProgress.filter(p => p.category === "professional");
        const personal = inProgress.filter(p => p.category === "personal");

        const renderGroup = (label, items) => {

            const itemsHTML = items.length === 0
                ? `<div class="no-events">Nothing in progress</div>`
                : items.map(p => `<div class="project-item">${p.title}</div>`).join("");

            return `
                <div class="project-group">
                    <div class="project-group-label">${label}</div>
                    ${itemsHTML}
                </div>
            `;

        };

        container.innerHTML =
            renderGroup("Professional", professional) +
            renderGroup("Personal", personal);

    } catch (error) {

        console.error("Failed to load in-progress projects:", error);
        container.textContent = "Unavailable";

    }

}


// Initial load
loadInProgressProjects();

// Refresh every 2 minutes — quick enough to reflect changes you make
// on the Kanban board without hammering the API
setInterval(loadInProgressProjects, 2 * 60 * 1000);