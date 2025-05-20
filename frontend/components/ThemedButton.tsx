import {
  StyleSheet,
  TouchableOpacity,
  type TouchableOpacityProps,
} from "react-native";

import { ThemedText } from "./ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";

export type ThemedButtonProps = TouchableOpacityProps & {
  label: string;
  lightColor?: string;
  darkColor?: string;
  type?: "default";
};

export function ThemedButton({
  style,
  label,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedButtonProps) {
  //   const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <TouchableOpacity
      style={[
        // { color },
        type === "default" ? styles.default : undefined,
        style,
      ]}
      {...rest}
    >
      <ThemedText type="defaultSemiBold" style={{ color: "#ffffff", textAlign: "center" }}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    backgroundColor: "#0870ff",
    padding: 12,
    borderRadius: 10,
  },
});
