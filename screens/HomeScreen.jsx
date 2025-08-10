
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  FlatList,
  Pressable,
  useColorScheme,
  StatusBar
} from "react-native";
import React, { useEffect, useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { lightTheme, darkTheme } from "../theme/color";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated,{FadeIn,FadeOut} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const screenWidth = Dimensions.get("window").width;

export default function HomeScreen({ navigation }) {
  const [apodData, setApodData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const colorScheme = useColorScheme();
  const CACHE_KEY = "apod_cache";
  const CACHE_DURATION = 48 * 60 * 60 * 1000; // 48 horas en milisegundos

  const theme = colorScheme === "dark" ? darkTheme : lightTheme;
  const insets = useSafeAreaInsets();

  const fetchImages = async () => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const { timestamp, data } = JSON.parse(cached);
        const now = Date.now();
        if (now - timestamp < CACHE_DURATION) {
          console.log("Cargando imágenes desde caché");
          setApodData(data);
          setLoading(false);
          return;
        }
      }

      console.log("Cargando imágenes desde la API");
      const apiKey = process.env.EXPO_PUBLIC_NASA_API_KEY;
      if (!apiKey)
        throw new Error("API key no encontrada en variables de entorno");

      const response = await fetch(
        `https://api.nasa.gov/planetary/apod?start_date=2025-08-01&end_date=2025-08-03&api_key=${apiKey}`
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const json = await response.json();
      const onlyImages = json.filter((item) => item.media_type === "image");

      // Guardar en caché con timestamp
      await AsyncStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          data: onlyImages,
        })
      );

      setApodData(onlyImages);
    } catch (error) {
      console.error("Error al cargar las imágenes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleReload = async () => {
    setLoading(true);
    try {
      const apiKey = process.env.EXPO_PUBLIC_NASA_API_KEY;

      if (!apiKey) {
        throw new Error("API key no encontrada en variables de entorno");
      }

      const response = await fetch(
        `https://api.nasa.gov/planetary/apod?count=5&api_key=${apiKey}`
      );
      const json = await response.json();
      const onlyImages = json.filter((item) => item.media_type === "image");
      setApodData(onlyImages);
    } catch (error) {
      console.error("Error al cargar las imagenes", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByDate = async () => {
    if (startDate > endDate) {
      alert("la fecha de inicio debe ser anterior al fecha de fin.");
      return;
    }
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      const apiKey = process.env.EXPO_PUBLIC_NASA_API_KEY;
      const formatDate = (date) => {
        return date.toISOString().split("T")[0];
      };

      const response = await fetch(
        `https://api.nasa.gov/planetary/apod?start_date=${formatDate(
          startDate
        )}&end_date=${formatDate(endDate)}&api_key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();
      const onlyImages = json.filter((item) => item.media_type === "image");

      if (onlyImages.length === 0) {
        alert("No se encontraron imágenes para ese rango.");
      }
      setApodData(onlyImages);
      setStartDate(null);
      setEndDate(null);
    } catch (error) {
      console.error("Error al buscar las imagenes por rango de fechas", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="007AFF" />
        <Text> Cargando imagen del espacio...</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <Animated.View entering={FadeIn} exiting={FadeOut}>
      <Pressable
        onPress={() => navigation.navigate("FullScreenImage", { item })}
      >
        <View>
        <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
        <Image source={{ uri: item.url }} style={styles.image} />
        <Text style={[styles.explanation, { color: theme.text }]}>
          {item.explanation}
        </Text>
      </View>
      </Pressable>
    </Animated.View>
  );

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: theme.background,
      paddingTop: insets.top,
      paddingBottom: insets.bottom 
    }}>
      <StatusBar
  backgroundColor="#ffffffff" // Fondo blanco (solo Android)
  barStyle="dark-content"   // Texto e iconos oscuros
/>

      <FlatList
        data={apodData}
        keyExtractor={(item) => item.date}
        ListHeaderComponent={
          <View>
            
            <View style={{ marginBottom: 20 }}>
              <Button
                title="Recargar imágenes aleatorias"
                onPress={handleReload}
              />
            </View>

            <Button
              title="Seleccionar fecha de inicio"
              onPress={() => setShowStartPicker(true)}
            />
            <Text style={{ marginVertical: 5, color: theme.text }}>
              Fecha de inicio:{" "}
              {startDate ? startDate.toDateString() : "No seleccionada"}
            </Text>

            <Button
              title="Seleccionar fecha fin"
              onPress={() => setShowEndPicker(true)}
            />
            <Text style={{ marginVertical: 5, color: theme.text }}>
              Fecha de fin:{" "}
              {endDate ? endDate.toDateString() : "No seleccionada"}
            </Text>

            {showStartPicker && (
              <DateTimePicker
                value={startDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowStartPicker(false);
                  if (selectedDate) setStartDate(selectedDate);
                }}
              />
            )}

            {showEndPicker && (
              <DateTimePicker
                value={endDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowEndPicker(false);
                  if (selectedDate) setEndDate(selectedDate);
                }}
              />
            )}
            {startDate && endDate && (
              <Button
                title="Buscar imágenes entre fechas"
                onPress={handleSearchByDate}
              />
            )}
          </View>
        }
        renderItem={renderItem}
        contentContainerStyle={styles.container}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
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
    width: screenWidth - 40,
    height: 300,
    marginBottom: 20,
    borderRadius: 10,
  },
  explanation: {
    fontSize: 16,
    textAlign: "justify",
    marginBottom: 20,
  },
});
