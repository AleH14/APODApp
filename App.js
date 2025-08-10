import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import DetailScreen from "./screens/DetailScreen";
import FullScreenImage from "./screens/FullScreenImage";
import { SafeAreaProvider } from "react-native-safe-area-context";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Inicio" component={HomeScreen} />
        <Stack.Screen name="Detalles" component={DetailScreen} />
        <Stack.Screen name="FullScreenImage" component={FullScreenImage} />
      </Stack.Navigator>
    </NavigationContainer>
    </SafeAreaProvider>
  );
}
