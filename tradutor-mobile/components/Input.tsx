import React, { useState, forwardRef } from "react";
import {
  TextInput,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  label?: string;
  secure?: boolean;                
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
} & Omit<TextInputProps, "secureTextEntry">; 

const Input = forwardRef<TextInput, Props>(
  (
    {
      label,
      secure,
      containerStyle,
      labelStyle,
      inputStyle,
      style,
      ...rest // <- aqui vem autoCapitalize, autoCorrect, keyboardType, etc.
    },
    ref
  ) => {
    const [hide, setHide] = useState(!!secure);

    return (
      <View style={[styles.container, containerStyle]}>
        {!!label && <Text style={[styles.label, labelStyle]}>{label}</Text>}

        <View style={{ position: "relative" }}>
          <TextInput
            ref={ref}
            secureTextEntry={!!secure && hide}
            style={[
              styles.input,
              { paddingRight: secure ? 42 : 12 },
              inputStyle,
              style,
            ]}
            {...rest}
          />

          {secure && (
            <TouchableOpacity
              onPress={() => setHide((p) => !p)}
              style={styles.eyeBtn}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons
                name={hide ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#666"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }
);

export default Input;

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { marginBottom: 6, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#cfcfcf",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    color: "#111",
  },
  eyeBtn: { position: "absolute", right: 10, top: 10 },
});
