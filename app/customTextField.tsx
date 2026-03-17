import React from "react";
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { colors, typography } from "./theme";

type CustomInputProps = {
  inputProps?: TextInputProps;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

export const CustomInput = ({
  inputProps,
  containerStyle,
  inputStyle,
}: CustomInputProps) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        placeholderTextColor="rgba(236, 227, 206, 0.82)"
        selectionColor={colors.background}
        style={[styles.input, inputStyle]}
        {...inputProps}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: colors.surfaceDeep,
    borderWidth: 1,
    borderColor: colors.inputTint,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  input: {
    color: colors.background,
    fontFamily: typography.body,
    fontSize: 15,
  },
});

export default CustomInput;
