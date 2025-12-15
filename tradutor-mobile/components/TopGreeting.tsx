import React from "react";
import { View, Text } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";

export default function TopGreeting() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={{ backgroundColor: theme.colors.headerBg, paddingVertical: 10, paddingHorizontal: 16 }}>
      <Text style={{ color: theme.colors.headerText }}>
        {t("welcome")} {user?.name ?? ""}
      </Text>
    </View>
  );
}
