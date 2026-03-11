import axios from "axios";

const API_KEY =
  process.env.EXPO_PUBLIC_WEATHER_API_KEY || process.env.WEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

/**
 * Converts raw 3-hourly forecast list into one entry per day (up to 5 days).
 * Prefers the noon (12:00:00) reading for each day's icon & description.
 * Tracks min/max temp across all readings for that day.
 */
const parseDailyForecast = (list) => {
  const byDate = {};

  list.forEach((entry) => {
    const [date, time] = entry.dt_txt.split(" ");
    if (!byDate[date]) {
      byDate[date] = { ...entry, minTemp: entry.main.temp_min, maxTemp: entry.main.temp_max };
    } else {
      byDate[date].minTemp = Math.min(byDate[date].minTemp, entry.main.temp_min);
      byDate[date].maxTemp = Math.max(byDate[date].maxTemp, entry.main.temp_max);
    }
    // prefer noon entry for icon & description
    if (time === "12:00:00") {
      byDate[date] = {
        ...byDate[date],
        weather: entry.weather,
        dt: entry.dt,
        minTemp: byDate[date].minTemp,
        maxTemp: byDate[date].maxTemp,
      };
    }
  });

  // Skip today, return up to 5 future days
  const today = new Date().toISOString().split("T")[0];
  return Object.entries(byDate)
    .filter(([date]) => date > today)
    .slice(0, 5)
    .map(([, entry]) => entry);
};

export const getWeatherByCity = async (city) => {
  const normalizedCity = city.trim();

  if (!normalizedCity) {
    throw new Error("Please enter a city name.");
  }

  if (!API_KEY) {
    throw new Error(
      "Missing API key. Add EXPO_PUBLIC_WEATHER_API_KEY to .env and restart Expo.",
    );
  }

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        q: normalizedCity,
        appid: API_KEY,
        units: "metric",
      },
    });

    return response.data;
  } catch (error) {
    const status = error?.response?.status;

    if (status === 404) {
      throw new Error("City not found. Please try again.");
    }

    if (status === 401) {
      throw new Error("Invalid API key. Check your OpenWeather API key.");
    }

    throw new Error("Unable to fetch weather right now. Please try again.");
  }
};

export const getWeatherByCoords = async (lat, lon) => {
  if (!API_KEY) {
    throw new Error(
      "Missing API key. Add EXPO_PUBLIC_WEATHER_API_KEY to .env and restart Expo.",
    );
  }
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units: "metric",
      },
    });

    return response.data;
  } catch (error) {
    const status = error?.response?.status;

    if (status === 404) {
      throw new Error("Location not found. Please try again.");
    }

    if (status === 401) {
      throw new Error("Invalid API key. Check your OpenWeather API key.");
    }

    throw new Error("Unable to fetch weather right now. Please try again.");
  }
};

export const getForecastByCity = async (city) => {
  const normalizedCity = city.trim();

  if (!normalizedCity) throw new Error("Please enter a city name.");
  if (!API_KEY) throw new Error("Missing API key. Add EXPO_PUBLIC_WEATHER_API_KEY to .env and restart Expo.");

  try {
    const response = await axios.get(FORECAST_URL, {
      params: { q: normalizedCity, appid: API_KEY, units: "metric" },
    });
    return parseDailyForecast(response.data.list);
  } catch (error) {
    const status = error?.response?.status;
    if (status === 404) throw new Error("City not found. Please try again.");
    if (status === 401) throw new Error("Invalid API key. Check your OpenWeather API key.");
    throw new Error("Unable to fetch forecast right now. Please try again.");
  }
};

export const getForecastByCoords = async (lat, lon) => {
  if (!API_KEY) throw new Error("Missing API key. Add EXPO_PUBLIC_WEATHER_API_KEY to .env and restart Expo.");

  try {
    const response = await axios.get(FORECAST_URL, {
      params: { lat, lon, appid: API_KEY, units: "metric" },
    });
    return parseDailyForecast(response.data.list);
  } catch (error) {
    const status = error?.response?.status;
    if (status === 404) throw new Error("Location not found. Please try again.");
    if (status === 401) throw new Error("Invalid API key. Check your OpenWeather API key.");
    throw new Error("Unable to fetch forecast right now. Please try again.");
  }
};
