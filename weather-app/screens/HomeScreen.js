import { useState, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  Dimensions,
} from "react-native";

import {
  getWeatherByCity,
  getWeatherByCoords,
} from "../services/weatherService";

const { width } = Dimensions.get("window");

const STAT_CARD_WIDTH = (width - 40 - 56 - 12) / 2;

const getGradient = (weatherMain) => {
  const c = weatherMain?.toLowerCase();
  if (c === "clear") return ["#f7971e", "#ffd200", "#f7971e"];
  if (c === "clouds") return ["#2c3e6b", "#4B6CB7", "#2c3e6b"];
  if (c === "rain" || c === "drizzle") return ["#0f2027", "#203a43", "#2c5364"];
  if (c === "thunderstorm") return ["#0F0C29", "#302B63", "#24243E"];
  if (c === "snow") return ["#757F9A", "#D7DDE8", "#757F9A"];
  if (c === "mist" || c === "fog" || c === "haze") return ["#3f4c6b", "#606c88", "#3f4c6b"];
  return ["#1a1a2e", "#16213e", "#0f3460"];
};

const StatCard = ({ icon, label, value }) => (
  <View style={styles.statCard}>
    <Ionicons name={icon} size={22} color="rgba(255,255,255,0.75)" />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function HomeScreen() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async (selectedCity = city) => {
    try {
      setLoading(true);
      const data = await getWeatherByCity(selectedCity);
      setWeather(data);
      setCity(selectedCity);
      await AsyncStorage.setItem("lastCity", selectedCity);
    } catch (error) {
      setWeather(null);
      alert(error.message || "Unable to fetch weather right now.");
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByLocation = async () => {
    try {
      setLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Location permission denied");
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const data = await getWeatherByCoords(
        location.coords.latitude,
        location.coords.longitude
      );
      setWeather(data);
      setCity(data.name);
      await AsyncStorage.setItem("lastCity", data.name);
    } catch (error) {
      console.log(error);
      alert("Unable to fetch location weather");
    } finally {
      setLoading(false);
    }
  };

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

  const gradient = getGradient(weather?.weather?.[0]?.main);

  return (
    <LinearGradient colors={gradient} style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Decorative background blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />
      <View style={styles.blob3} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* App Header */}
        <View style={styles.header}>
          <Ionicons name="partly-sunny-outline" size={26} color="white" />
          <Text style={styles.appTitle}>WeatherNow</Text>
        </View>

        {/* Search Row */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons
              name="search-outline"
              size={19}
              color="rgba(255,255,255,0.6)"
              style={{ marginRight: 8 }}
            />
            <TextInput
              placeholder="Search city..."
              placeholderTextColor="rgba(255,255,255,0.45)"
              value={city}
              onChangeText={setCity}
              onSubmitEditing={() => fetchWeather()}
              style={styles.searchInput}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity
            style={styles.locationBtn}
            onPress={fetchWeatherByLocation}
            disabled={loading}
            activeOpacity={0.75}
          >
            <Ionicons name="locate-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>

        {/* Loader */}
        {loading && (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color="rgba(255,255,255,0.9)" />
            <Text style={styles.loadingText}>Fetching weather…</Text>
          </View>
        )}

        {/* Weather Card */}
        {weather && !loading && (
          <View style={styles.card}>
            {/* City */}
            <View style={styles.cityRow}>
              <Ionicons name="location-sharp" size={16} color="rgba(255,255,255,0.75)" />
              <Text style={styles.cityName}>
                {weather.name}, {weather.sys.country}
              </Text>
            </View>

            {/* Icon */}
            <Image
              style={styles.weatherIcon}
              source={{
                uri: `https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`,
              }}
            />

            {/* Temperature */}
            <Text style={styles.temperature}>
              {Math.round(weather.main.temp)}°
            </Text>
            <Text style={styles.unitLabel}>Celsius</Text>

            {/* Condition badge */}
            <View style={styles.conditionBadge}>
              <Text style={styles.conditionText}>
                {weather.weather[0].description}
              </Text>
            </View>

            <Text style={styles.feelsLike}>
              Feels like {Math.round(weather.main.feels_like)}°C
            </Text>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <StatCard
                icon="water-outline"
                label="Humidity"
                value={`${weather.main.humidity}%`}
              />
              <StatCard
                icon="navigate-outline"
                label="Wind"
                value={`${weather.wind.speed} km/h`}
              />
              <StatCard
                icon="thermometer-outline"
                label="Min / Max"
                value={`${Math.round(weather.main.temp_min)}° / ${Math.round(weather.main.temp_max)}°`}
              />
              <StatCard
                icon="speedometer-outline"
                label="Pressure"
                value={`${weather.main.pressure} hPa`}
              />
            </View>
          </View>
        )}

        {/* Empty state */}
        {!weather && !loading && (
          <View style={styles.emptyState}>
            <Ionicons name="cloud-outline" size={90} color="rgba(255,255,255,0.25)" />
            <Text style={styles.emptyText}>Search a city or tap{"\n"}the locate button</Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /* Decorative blobs */
  blob1: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(255,255,255,0.07)",
    top: -100,
    right: -90,
  },
  blob2: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.05)",
    bottom: 120,
    left: -70,
  },
  blob3: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.04)",
    bottom: 360,
    right: 10,
  },

  scrollContent: {
    paddingTop: 64,
    paddingHorizontal: 20,
    paddingBottom: 48,
    flexGrow: 1,
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 28,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "white",
    letterSpacing: 1.2,
  },

  /* Search */
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 28,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  searchInput: {
    flex: 1,
    color: "white",
    fontSize: 15,
  },
  locationBtn: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },

  /* Loader */
  loaderWrap: {
    alignItems: "center",
    marginTop: 70,
    gap: 14,
  },
  loadingText: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 15,
  },

  /* Card (glassmorphism) */
  card: {
    backgroundColor: "rgba(255,255,255,0.13)",
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  cityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 2,
  },
  cityName: {
    fontSize: 17,
    fontWeight: "600",
    color: "rgba(255,255,255,0.88)",
  },
  weatherIcon: {
    width: 150,
    height: 150,
    marginVertical: 2,
  },
  temperature: {
    fontSize: 92,
    fontWeight: "800",
    color: "white",
    lineHeight: 100,
  },
  unitLabel: {
    fontSize: 15,
    color: "rgba(255,255,255,0.55)",
    marginTop: -2,
    marginBottom: 14,
  },
  conditionBadge: {
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 20,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  conditionText: {
    color: "white",
    fontSize: 14,
    textTransform: "capitalize",
    fontWeight: "600",
    letterSpacing: 0.4,
  },
  feelsLike: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    marginBottom: 22,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginBottom: 20,
  },

  /* Stats */
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    width: "100%",
  },
  statCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: "center",
    width: STAT_CARD_WIDTH,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    gap: 4,
  },
  statValue: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },
  statLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    fontWeight: "500",
  },

  /* Empty state */
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 90,
    gap: 16,
  },
  emptyText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
});
