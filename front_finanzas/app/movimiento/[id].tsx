import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useTheme } from "../../theme/ThemeContext";
import { fonts } from "../../theme/fonts";
import { useSettings } from "../../lib/SettingsContext";
import { getTransaction, Transaction, ApiError } from "../../lib/api";
import { TransactionForm } from "../../components/TransactionForm";

export default function EditarMovimientoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { palette } = useTheme();
  const settings = useSettings();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!settings.isConfigured || !id) return;
    getTransaction({ baseUrl: settings.url, apiKey: settings.apiKey }, Number(id))
      .then(setTransaction)
      .catch((err) => setError(err instanceof ApiError ? err.message : "No se pudo cargar el movimiento."));
  }, [id, settings.isConfigured]);

  if (!settings.isConfigured) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Text style={{ fontFamily: fonts.displayRegular, fontSize: 22, color: palette.text, textAlign: "center" }}>
          Todavía no conectaste el backend
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Text style={{ fontFamily: fonts.displayRegular, fontSize: 22, color: palette.text, textAlign: "center" }}>
          No se pudo cargar
        </Text>
        <Text style={{ fontSize: 14, color: palette.dim, marginTop: 8, textAlign: "center" }}>{error}</Text>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={palette.accent} />
      </View>
    );
  }

  return <TransactionForm transaction={transaction} />;
}
