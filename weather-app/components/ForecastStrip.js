import { View, Text, Image, ScrollView, StyleSheet } from "react-native";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const ForecastStrip = ({ forecast }) => {
  if (!forecast || forecast.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>5-Day Forecast</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.strip}
      >
        {forecast.map((item, index) => {
          const date = new Date(item.dt * 1000);
          const dayName = DAY_NAMES[date.getDay()];
          const icon = item.weather[0].icon;

          return (
            <View key={index} style={styles.dayCard}>
              <Text style={styles.dayName}>{dayName}</Text>
              <Image
                style={styles.icon}
                source={{
                  uri: `https://openweathermap.org/img/wn/${icon}@2x.png`,
                }}
              />
              <Text style={styles.highTemp}>{Math.round(item.maxTemp)}°</Text>
              <Text style={styles.lowTemp}>{Math.round(item.minTemp)}°</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 24,
  },
  sectionTitle: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 12,
    paddingLeft: 4,
  },
  strip: {
    gap: 10,
    paddingHorizontal: 2,
  },
  dayCard: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    minWidth: 72,
    gap: 2,
  },
  dayName: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontWeight: "600",
  },
  icon: {
    width: 48,
    height: 48,
    marginVertical: 2,
  },
  highTemp: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
  },
  lowTemp: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
    fontWeight: "500",
  },
});

export default ForecastStrip;
