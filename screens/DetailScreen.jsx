import React from "react";
import { View, Text, Image, StyleSheet, ScrollView,useColorScheme } from "react-native";
import { lightTheme, darkTheme } from "../theme/color";

export default function DetailScreen({ route }) {
  const { item } = route.params;
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title,{color:theme.text}]}>{item.title}</Text>
      <Image source={{ uri: item.hdurl || item.url }} style={styles.image} />
      <Text style={[styles.explanation,{color: theme.text}]}>{item.explanation}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    height: "100%",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: 300,
    marginBottom: 20,
    borderRadius: 10,
  },
  explanation: {
    fontSize: 16,
    textAlign: "justify",
  },
});
