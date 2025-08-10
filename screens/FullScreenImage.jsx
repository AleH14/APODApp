import React, { useState } from "react";
import { View, Image, StyleSheet, Dimensions, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, useColorScheme, StatusBar } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { lightTheme, darkTheme } from "../theme/color";


const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

export default function FullScreenImage({ route }) {
  const { item } = route.params;
  const [wikipediaData, setWikipediaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showWikipedia, setShowWikipedia] = useState(false);
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  const fetchWikipediaData = async () => {
    setLoading(true);
    try {
      // First, search for the title to get the page ID
      const searchResponse = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(item.title)}`
      );
      
      if (searchResponse.ok) {
        const data = await searchResponse.json();
        setWikipediaData(data);
        setShowWikipedia(true);
      } else {
        // If direct search fails, try a general search
        const generalSearchResponse = await fetch(
          `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(item.title)}&limit=1&namespace=0&format=json&origin=*`
        );
        
        if (generalSearchResponse.ok) {
          const searchResults = await generalSearchResponse.json();
          if (searchResults[1].length > 0) {
            const pageTitle = searchResults[1][0];
            const summaryResponse = await fetch(
              `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`
            );
            
            if (summaryResponse.ok) {
              const summaryData = await summaryResponse.json();
              setWikipediaData(summaryData);
              setShowWikipedia(true);
            } else {
              Alert.alert("No Results", "No Wikipedia information found for this topic.");
            }
          } else {
            Alert.alert("No Results", "No Wikipedia information found for this topic.");
          }
        }
      }
    } catch (error) {
      console.error("Error fetching Wikipedia data:", error);
      Alert.alert("Error", "Failed to fetch Wikipedia information. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: theme.background,
      paddingTop: insets.top,
      paddingBottom: insets.bottom 
    }}>
      <StatusBar
  backgroundColor="#ffffff" // Fondo blanco (solo Android)
  barStyle="dark-content"   // Texto e iconos oscuros
/>
      
      <ScrollView contentContainerStyle={{ alignItems: "center" }}>
        <View style={styles.container}>
      <Image
        source={{ uri:  item.url }}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
      <Text style={[styles.explanation, { color: theme.text }]}>{item.explanation}</Text>
      
      {/* Wikipedia Button */}
      <TouchableOpacity 
        style={styles.wikipediaButton} 
        onPress={fetchWikipediaData}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>Get Wikipedia Info</Text>
        )}
      </TouchableOpacity>

      {/* Wikipedia Content */}
      {showWikipedia && wikipediaData && (
        <View style={styles.wikipediaContainer}>
          <Text style={styles.wikipediaTitle}>Wikipedia Information</Text>
          <Text style={styles.wikipediaText}>{wikipediaData.extract}</Text>
          {wikipediaData.content_urls && (
            <TouchableOpacity 
              style={styles.linkButton}
              onPress={() => Alert.alert("Wikipedia Link", wikipediaData.content_urls.desktop.page)}
            >
              <Text style={styles.linkText}>View Full Article</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
       
    </View>
     </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignItems: "center",
  },
  image: { width: screenWidth, height: screenHeight * 0.8 },
  title: { fontSize: 24, fontWeight: "bold", marginTop: 1 },
  explanation: { fontSize: 16, margin: 10, textAlign: "center" },
  wikipediaButton: {
    backgroundColor: "#1976D2",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 15,
    marginBottom: 10,
    minWidth: 150,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  wikipediaContainer: {
    backgroundColor: "#1a1a1a",
    margin: 15,
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#1976D2",
  },
  wikipediaTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  wikipediaText: {
    color: "#ddd",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "justify",
  },
  linkButton: {
    marginTop: 10,
    alignSelf: "flex-start",
  },
  linkText: {
    color: "#64B5F6",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});