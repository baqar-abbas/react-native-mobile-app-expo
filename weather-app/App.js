import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weather App 🌦</Text>
      <Text style={styles.subtitle}>Search any city to see the weather</Text>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4facfe",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
  },

  subtitle: {
    fontSize: 16,
    marginTop: 10,
    color: "white",
  },
});
