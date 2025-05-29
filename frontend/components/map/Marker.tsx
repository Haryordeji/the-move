import { StyleSheet, View, Text } from "react-native";
import { Marker as RNMarker } from "react-native-maps";

const Marker = ({
  coordinate,
}: {
  coordinate: {
    latitude: number;
    longitude: number;
  };
}) => {
  return (
    <RNMarker coordinate={coordinate}>
      <View style={{ justifyContent: "center", alignItems: "center" }}>
        <View style={[styles.defaultMarker, styles.shadowProp]}>
          <Text style={{ textAlign: "center", fontSize: 24 }}>🍺</Text>
        </View>
        <View
          style={([styles.markerDot, styles.shadowProp])}
        ></View>
      </View>
    </RNMarker>
  );
};

export default Marker;

const styles = StyleSheet.create({
  defaultMarker: {
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    width: 48,
    backgroundColor: "#f1f1f1",
  },
  markerDot: {
    borderRadius: 100,
    height: 8,
    width: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    backgroundColor: "#f1f1f1",
  },
  shadowProp: {
    shadowColor: "#171717",
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});
