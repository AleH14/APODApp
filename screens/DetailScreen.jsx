import React from "react";
import { View, Text, Image, StyleSheet, ScrollView } from "react-native";

export default function DetailScreen({ route }) {
  const { item } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{item.title}</Text>
      <Image source={{ uri: item.hdurl || item.url }} style={styles.image} />
      <Text style={styles.explanation}>{item.explanation}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
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
