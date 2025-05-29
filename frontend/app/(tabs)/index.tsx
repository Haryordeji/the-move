import { Image } from "expo-image";
import { Platform, StyleSheet } from "react-native";
import MapView from "react-native-maps";
import BarListItem from "@/components/BarListItem";
import Marker from "@/components/map/Marker";
import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 40.7685,
            longitude: -73.9822,
            latitudeDelta: 0.0422,
            longitudeDelta: 0.0221,
          }}
        >
          <Marker
            coordinate={{
              latitude: 40.7685,
              longitude: -73.9822,
            }}
          />
          <Marker
            coordinate={{
              latitude: 40.7484,
              longitude: -73.985,
            }}
          />
          <Marker
            coordinate={{
              latitude: 40.7638,
              longitude: -73.9918,
            }}
          />
          <Marker
            coordinate={{
              latitude: 40.758896,
              longitude: -73.98513,
            }}
          />
        </MapView>
      }
    >
      {/* <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">The Move</ThemedText>
      </ThemedView> */}
      <ThemedView style={styles.stepContainer}>
        <BarListItem />
        <BarListItem />
        <BarListItem />
        <BarListItem />
      </ThemedView>
      {/* <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Explore</ThemedText>
        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">
            npm run reset-project
          </ThemedText>{" "}
          to get a fresh <ThemedText type="defaultSemiBold">app</ThemedText>{" "}
          directory. This will move the current{" "}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{" "}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView> */}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
