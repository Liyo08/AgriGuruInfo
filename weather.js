const dropdown = document.getElementById('locationDropdown');
const resultDiv = document.getElementById('weatherResult');
const apiKey = 'aae4bc02b87b63e390ae5ac01142ceb4'; // your working API key

dropdown.addEventListener('change', () => {
    const city = dropdown.value;
    if (city) {
        fetchWeather(city);
    } else {
        resultDiv.innerHTML = '';
    }
});

function fetchWeather(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            console.log(data); // check structure in console
            if (data.cod === 200) {
                const { name } = data;
                const { temp, humidity } = data.main;
                const { description, icon } = data.weather[0];
                const { lat, lon } = data.coord;

                // Create a fade-in container
                const container = document.createElement('div');
                container.classList.add('fade-in');
                container.innerHTML = `
                    <h3>Weather in ${name}</h3>
                    <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
                    <p>Temperature: ${temp} °C</p>
                    <p>Condition: ${description}</p>
                    <p>Humidity: ${humidity}%</p>
                `;

                // Clear previous results smoothly
                resultDiv.innerHTML = '';
                resultDiv.appendChild(container);

                // Now fetch the forecast with animation as before
                fetchForecast(lat, lon);
            } else {
                resultDiv.innerHTML = `<p>City not found.</p>`;
            }
        })
        .catch(error => {
            console.error(error);
            resultDiv.innerHTML = `<p>Could not fetch weather data.</p>`;
        });
}

function fetchForecast(lat, lon) {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    fetch(forecastUrl)
        .then(response => response.json())
        .then(data => {
            console.log(data); // Check structure
            let forecastHTML = `<h3>5-Day Forecast</h3><div class="forecast-container">`;

            const grouped = {};

            data.list.forEach(item => {
                const date = item.dt_txt.split(' ')[0]; // YYYY-MM-DD
                if (!grouped[date]) {
                    grouped[date] = [];
                }
                grouped[date].push(item);
            });

            Object.keys(grouped).slice(0, 5).forEach((date, idx) => {
                const dayData = grouped[date];
                let minTemp = Number.POSITIVE_INFINITY;
                let maxTemp = Number.NEGATIVE_INFINITY;
                let humiditySum = 0;
                let icon = dayData[0].weather[0].icon;
                let description = dayData[0].weather[0].description;

                dayData.forEach(item => {
                    const temp = item.main.temp;
                    minTemp = Math.min(minTemp, temp);
                    maxTemp = Math.max(maxTemp, temp);
                    humiditySum += item.main.humidity;
                });

                const avgHumidity = Math.round(humiditySum / dayData.length);
                const dayName = idx === 0 ? "Today" : new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

                forecastHTML += `
                    <div class="forecast-card">
                        <strong>${dayName}</strong><br>
                        <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${description}">
                        <div>${description}</div>
                        <div>🌡️ ${Math.round(maxTemp)}° / ${Math.round(minTemp)}°</div>
                        <div>💧 ${avgHumidity}%</div>
                    </div>
                `;
            });

            forecastHTML += `</div>`;

            // Create a temporary container with fade-in
            const container = document.createElement('div');
            container.classList.add('fade-in');
            container.innerHTML = forecastHTML;

            resultDiv.appendChild(container);
        })
        .catch(error => {
            console.error(error);
            resultDiv.innerHTML += `<p>Could not fetch forecast data.</p>`;
        });
}
