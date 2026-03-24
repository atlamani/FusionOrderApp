import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { colors, radii, typography } from "./theme";

type CustomInputProps = {
  label?: string;
  helperText?: string;
  errorText?: string;
  leadingIcon?: keyof typeof Feather.glyphMap;
  secureToggle?: boolean;
  inputProps?: TextInputProps;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

export const CustomInput = ({
  label,
  helperText,
  errorText,
  leadingIcon,
  secureToggle = false,
  inputProps,
  containerStyle,
  inputStyle,
}: CustomInputProps) => {
  const [showSecureText, setShowSecureText] = useState(false);
  const [focused, setFocused] = useState(false);
  const isSecure = Boolean(inputProps?.secureTextEntry);

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.container,
          focused ? styles.containerFocused : null,
          errorText ? styles.containerError : null,
          containerStyle,
        ]}
      >
        {leadingIcon ? (
          <View style={[styles.iconBubble, focused ? styles.iconBubbleFocused : null]}>
            <Feather name={leadingIcon} size={17} color={focused ? colors.surfaceDeep : colors.surface} />
          </View>
        ) : null}
        <TextInput
          placeholderTextColor="rgba(31, 42, 31, 0.44)"
          selectionColor={colors.surface}
          style={[styles.input, inputStyle]}
          {...inputProps}
          onFocus={(event) => {
            setFocused(true);
            inputProps?.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            inputProps?.onBlur?.(event);
          }}
          secureTextEntry={isSecure && !showSecureText}
        />
        {isSecure && secureToggle ? (
          <Pressable style={styles.trailingAction} onPress={() => setShowSecureText((current) => !current)}>
            <Feather
              name={showSecureText ? "eye-off" : "eye"}
              size={18}
              color={focused ? colors.surfaceDeep : "rgba(31, 42, 31, 0.52)"}
            />
          </Pressable>
        ) : null}
      </View>
      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
      {!errorText && helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  container: {
    width: "100%",
    minHeight: 60,
    borderRadius: radii.md,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(58, 77, 57, 0.08)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    shadowColor: colors.primary,
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  containerFocused: {
    borderColor: "rgba(115, 144, 114, 0.5)",
    shadowOpacity: 0.09,
    shadowRadius: 14,
    elevation: 2,
  },
  containerError: {
    borderColor: "rgba(166, 61, 64, 0.34)",
  },
  iconBubble: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  iconBubbleFocused: {
    backgroundColor: "rgba(115, 144, 114, 0.16)",
  },
  input: {
    flex: 1,
    color: colors.text,
    fontFamily: typography.body,
    fontSize: 15,
  },
  trailingAction: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  helperText: {
    fontFamily: typography.body,
    fontSize: 11,
    lineHeight: 16,
    color: colors.textMuted,
  },
  errorText: {
    fontFamily: typography.body,
    fontSize: 11,
    lineHeight: 16,
    color: colors.danger,
  },
});

export default CustomInput;
