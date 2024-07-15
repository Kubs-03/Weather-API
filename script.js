document.addEventListener("DOMContentLoaded", function() {
    var map = L.map('map').setView([28.531759, 77.293973], 10);
    var marker = null; 

    // Define the satellite tile layer
    var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });

    // Define the OpenStreetMap tile layer
    var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Define the dark mode tile layer
    var Drk_map = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    });

    googleTerrain = L.tileLayer('http://{s}.google.com/vt?lyrs=p&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });

    // Add the satellite tile layer to the map as the default
    osm.addTo(map);

    // Add layer control to switch between satellite, OSM, and dark mode layers
    var baseMaps = {
        'Satellite': Esri_WorldImagery,
        'OpenStreetMap': osm,
        'Dark mode': Drk_map,
        'Terrain':googleTerrain
    };

    // Define the India GeoJSON overlay
    var indiadata = L.geoJSON(indiaJson, {
        style: {
            fillColor: '#e6f598',
            fillOpacity: 0.5,
            color: 'blue',
            weight: 2
        }
    });

    var overlayMaps = {
        "India": indiadata
    };

    // Add layer control with base maps and overlay maps
    var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

    // Add locate control to the map
    L.control.locate().addTo(map);

    // Zoom to feature when checkbox is clicked
    indiadata.on('add', function () {
        map.fitBounds(indiadata.getBounds());
    });

    const apikey = '9c0553fb336b140adfef5a42bcd2d93e'; // Replace with your actual API key
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?units=metric&q=`;
    const apiUrlByCoords = `https://api.openweathermap.org/data/2.5/weather?units=metric&lat={lat}&lon={lon}&appid=${apikey}`;

    const searchBox = document.querySelector(".search input");
    const searchBtn = document.querySelector(".search button");
    const weatherIcon = document.querySelector(".weather-icon");

    async function checkWeather(city) {
        const response = await fetch(apiUrl + city + `&appid=${apikey}`);

        if (response.status == 404) {
            document.querySelector(".error").style.display = "block";
            document.querySelector(".weather").style.display = "none";
        } else {
            var data = await response.json();

            document.querySelector(".city").innerHTML = data.name;
            document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
            document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
            document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";

            if (data.weather[0].main == "Clouds") {
                weatherIcon.src = "/weather-app-img/images/clouds.png";
            } else if (data.weather[0].main == "Drizzle") {
                weatherIcon.src = "/weather-app-img/images/drizzle.png";
            } else if (data.weather[0].main == "Clear") {
                weatherIcon.src = "/weather-app-img/images/clear.png";
            } else if (data.weather[0].main == "Rain") {
                weatherIcon.src = "/weather-app-img/images/rain.png";
            } else if (data.weather[0].main == "Mist") {
                weatherIcon.src = "/weather-app-img/images/mist.png";
            }

            document.querySelector(".weather").style.display = "block";
            document.querySelector(".error").style.display = "none";

            // Update map view and marker
            const lat = data.coord.lat;
            const lon = data.coord.lon;

            updateMap(lat, lon);
        }
    }

    async function checkWeatherByCoords(lat, lon) {
        const response = await fetch(apiUrlByCoords.replace('{lat}', lat).replace('{lon}', lon));

        if (response.status == 404) {
            document.querySelector(".error").style.display = "block";
            document.querySelector(".weather").style.display = "none";
        } else {
            var data = await response.json();

            document.querySelector(".city").innerHTML = data.name;
            document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
            document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
            document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";

            if (data.weather[0].main == "Clouds") {
                weatherIcon.src = "/weather-app-img/images/clouds.png";
            } else if (data.weather[0].main == "Drizzle") {
                weatherIcon.src = "/weather-app-img/images/drizzle.png";
            } else if (data.weather[0].main == "Clear") {
                weatherIcon.src = "/weather-app-img/images/clear.png";
            } else if (data.weather[0].main == "Rain") {
                weatherIcon.src = "/weather-app-img/images/rain.png";
            } else if (data.weather[0].main == "Mist") {
                weatherIcon.src = "/weather-app-img/images/mist.png";
            }

            document.querySelector(".weather").style.display = "block";
            document.querySelector(".error").style.display = "none";

            // Update map view and marker
            updateMap(lat, lon);
        }
    }

    function updateMap(lat, lon) {
        // Clear previous marker
        if (marker) {
            map.removeLayer(marker);
        }

        // Update map view and add new marker
        map.setView([lat, lon], 10);
        marker = L.marker([lat, lon]).addTo(map)
            .bindPopup(`${document.querySelector(".city").innerHTML}`)
            .openPopup();

        // Clear search box
        searchBox.value = '';
    }

    searchBtn.addEventListener("click", () => {
        checkWeather(searchBox.value);
    });

    map.on('locationfound', function(e) {
        const lat = e.latitude;
        const lon = e.longitude;

        // Check weather for the current location
        checkWeatherByCoords(lat, lon);

        // Clear search box
        searchBox.value = '';
    });

    map.on('locationerror', function() {
        alert("Location access denied.");
    });

    // Content toggling

    const homeLink = document.getElementById("home-link");
    const contactLink = document.getElementById("contact-link");
    const aboutLink = document.getElementById("about-link");

    const homeContent = document.getElementById("home-content");
    const contactContent = document.getElementById("contact-content");
    const aboutContent = document.getElementById("about-content");

    function toggleContent(contentElement) {
        homeContent.style.display = "none";
        contactContent.style.display = "none";
        aboutContent.style.display = "none";

        contentElement.style.display = "block";
    }

    homeLink.addEventListener("click", function(e) {
        e.preventDefault();
        toggleContent(homeContent);
    });

    contactLink.addEventListener("click", function(e) {
        e.preventDefault();
        toggleContent(contactContent);
    });

    aboutLink.addEventListener("click", function(e) {
        e.preventDefault();
        toggleContent(aboutContent);
    });

    // Hide contact and about content initially
    contactContent.style.display = "none";
    aboutContent.style.display = "none";
});
