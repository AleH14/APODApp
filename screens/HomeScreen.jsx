import { StatusBar } from "expo-status-bar";
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
} from "react-native";
import React, { useEffect, useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";

const screenWidth = Dimensions.get("window").width;

export default function HomeScreen({ navigation }) {
  const [apodData, setApodData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const fetchImages = async () => {
    try {
      const apiKey = process.env.EXPO_PUBLIC_NASA_API_KEY;

      if (!apiKey) {
        throw new Error("API key no encontrada en variables de entorno");
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
      const onlyImages = json.filter((tem) => item.media_type === "image");

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

  return (
    <>
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
            <Text style={{ marginVertical: 5 }}>
              Fecha de inicio:{" "}
              {startDate ? startDate.toDateString() : "No selecionada"}
            </Text>

            <Button
              title="Seleccionar fecha fin"
              onPress={() => setShowEndPicker(true)}
            />
            <Text style={{ marginVertical: 5 }}>
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
        renderItem={({ item }) => {
          return (
            <Pressable
              onPress={() => navigation.navigate("Detalles", { item })}
            >
              <View style={{ marginBotton: 20 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Image source={{ uri: item.url }} style={styles.image} />
                <Text style={styles.explanation}>{item.explanation}</Text>
              </View>
            </Pressable>
          );
        }}
        contentContainerStyle={styles.container}
      />
    </>
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
    width: screenWidth - 40,
    height: 300,
    marginBottom: 20,
    borderRadius: 10,
  },
  explanation: {
    fontSize: 16,
    textAlign: "justify",
  },
});
