import axios from "axios";

const API_KEY =
  process.env.EXPO_PUBLIC_WEATHER_API_KEY || process.env.WEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

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
