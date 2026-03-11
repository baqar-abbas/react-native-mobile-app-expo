import { useState, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";

import {
  getWeatherByCity,
  getWeatherByCoords,
} from "../services/weatherService";

export default function HomeScreen() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch weather by city
  const fetchWeather = async (selectedCity = city) => {
    try {
      setLoading(true);

      const data = await getWeatherByCity(selectedCity);

      setWeather(data);
      setCity(selectedCity);

      // Save last searched city
      await AsyncStorage.setItem("lastCity", selectedCity);
    } catch (error) {
      setWeather(null);
      alert(error.message || "Unable to fetch weather right now.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch weather using GPS location
  const fetchWeatherByLocation = async () => {
    try {
      setLoading(true);

      // Request location permission
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        alert("Location permission denied");
        return;
      }

      // Get coordinates
      const location = await Location.getCurrentPositionAsync({});

      const lat = location.coords.latitude;
      const lon = location.coords.longitude;

      // Call weather API
      const data = await getWeatherByCoords(lat, lon);

      setWeather(data);
      setCity(data.name);

      // Save detected city
      await AsyncStorage.setItem("lastCity", data.name);
    } catch (error) {
      console.log(error);
      alert("Unable to fetch location weather");
    } finally {
      setLoading(false);
    }
  };

  // Smart startup logic
  useEffect(() => {
    const initializeWeather = async () => {
      try {
        const savedCity = await AsyncStorage.getItem("lastCity");

        if (savedCity) {
          fetchWeather(savedCity);
        } else {
          fetchWeatherByLocation();
        }
      } catch (error) {
        console.log("Initialization error", error);
      }
    };

    initializeWeather();
  }, []);

  return (
    <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Weather App 🌦</Text>

        <TextInput
          placeholder="Enter city"
          value={city}
          onChangeText={setCity}
          style={styles.input}
        />

        <Button
          title="Search"
          onPress={() => fetchWeather()}
          disabled={loading}
        />

        <View style={{ marginTop: 10 }}>
          <Button title="Use My Location" onPress={fetchWeatherByLocation} />
        </View>

        {loading && (
          <ActivityIndicator size="large" style={{ marginTop: 20 }} />
        )}

        {weather && (
          <View style={styles.weatherBox}>
            <Text style={styles.city}>{weather.name}</Text>

            <Image
              style={styles.icon}
              source={{
                uri: `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`,
              }}
            />

            <Text style={styles.temp}>{weather.main.temp} °C</Text>

            <Text style={styles.desc}>{weather.weather[0].description}</Text>

            <Text>Humidity: {weather.main.humidity}%</Text>

            <Text>Wind: {weather.wind.speed} km/h</Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  innerContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "white",
    textAlign: "center",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },

  weatherBox: {
    marginTop: 30,
    padding: 20,
    borderRadius: 15,
    backgroundColor: "#ffffff",
    alignItems: "center",
    elevation: 5,
  },

  city: {
    fontSize: 24,
    fontWeight: "bold",
  },

  icon: {
    width: 100,
    height: 100,
  },

  temp: {
    fontSize: 40,
    fontWeight: "bold",
  },

  desc: {
    fontSize: 18,
    textTransform: "capitalize",
    marginBottom: 10,
  },
});
