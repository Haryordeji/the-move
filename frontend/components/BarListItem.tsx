import { StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";

const BarListItem = () => {
  return (
    <View style={styles.container}>
      <View style={styles.image} />
      <View style={styles.descriptions}>
        <ThemedText type="subtitle">Bar 1</ThemedText>
        <ThemedText>New York, NY</ThemedText>
        <ThemedText>4.0 / 5.0</ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  descriptions: {
    display: "flex",
    flexDirection: "column",
  },
  image: {
    height: 64,
    width: 64,
    borderRadius: 10,
    backgroundColor: "#d3d3d3",
    marginRight: 12,
  },
});

export default BarListItem;
