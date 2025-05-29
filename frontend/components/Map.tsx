import MapView from "react-native-maps";
import { StyleSheet } from "react-native";

export type MapProps = {
  longitude: number;
  latitude: number;
  longitudeDelta: number;
  latitudeDelta: number;
};

const Map = ({
  longitude = 40.7685,
  latitude = -73.9822,
  longitudeDelta = 0.0221,
  latitudeDelta = 0.0422,
}: MapProps) => {
  return (
    <MapView
      style={styles.map}
      initialRegion={{
        longitude,
        latitude,
        longitudeDelta,
        latitudeDelta,
      }}
    />
  );
};

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

export default Map;
