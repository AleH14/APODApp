import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions
} from "react-native";
import React, { useEffect, useState } from "react";

const screenWidth = Dimensions.get('window').width;

export default function App() {
  const [apodData, setApodData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMultiple = async () => {
      try {
        const apiKey = process.env.EXPO_PUBLIC_NASA_API_KEY;
        
        if (!apiKey) {
          throw new Error('API key no encontrada en variables de entorno');
        }

        const response = await fetch(
          `https://api.nasa.gov/planetary/apod?start_date=2025-08-01&end_date=2025-08-03&api_key=${apiKey}`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const json = await response.json();
        const onlyImages = json.filter((item) => item.media_type === "image");
        setApodData(onlyImages);
      } catch (error) {
        console.error("Error al cargar las imagenes", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMultiple();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="007AFF" />
        <Text> Cargando imagen del espacio...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {apodData.map((img) => {
        console.log(img.url);
        return (
          <View key={img.date} style={{ marginBottom: 20 }}>
            <Text style={styles.title}>{img.title}</Text>
            <Image source={{ uri: img.url }} style={styles.image} />
            <Text style={styles.explanation}>{img.explanation}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  image: {
    width: screenWidth-40,
    height: 300,
    marginBottom: 20,
    borderRadius: 10,
  },
  explanation: {
    fontSize: 16,
    textAlign: "justify",
  },
});
