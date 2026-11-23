import React, { useCallback, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "../../../theme/ThemeContext";
import { fonts } from "../../../theme/fonts";
import { useSettings } from "../../../lib/SettingsContext";
import { getObjective, ApiError, Objective } from "../../../lib/api";
import { BalanceLine } from "../../../components/BalanceLine";
import { ObjectiveForm } from "../../../components/ObjectiveForm";

export default function EditarMetaScreen() {
  const { palette } = useTheme();
  const router = useRouter();
  const settings = useSettings();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [objective, setObjective] = useState<Objective | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!settings.isConfigured) return;
    setError(null);
    try {
      setObjective(await getObjective({ baseUrl: settings.url, apiKey: settings.apiKey }, Number(id)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo conectar con el backend.");
    }
  }, [settings.isConfigured, settings.url, settings.apiKey, id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (objective) return <ObjectiveForm key={objective.objective_id} objective={objective} />;

  const failed = !settings.isConfigured || !!error;

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 26 }}>
      {failed ? (
        <>
          <Text style={{ fontFamily: fonts.displayRegular, fontSize: 22, color: palette.text, textAlign: "center" }}>
            {settings.isConfigured ? "No se pudo cargar" : "Todavía no conectaste el backend"}
          </Text>
          <Text style={{ fontSize: 14, color: palette.dim, textAlign: "center", maxWidth: 320 }}>
            {error ?? "Ve a Ajustes y guarda la URL y la API key."}
          </Text>
          <Pressable
            onPress={() => (settings.isConfigured ? load() : router.push("/ajustes"))}
            style={{
              borderWidth: 1,
              borderColor: palette.accent,
              borderRadius: 12,
              paddingVertical: 14,
              paddingHorizontal: 22,
            }}
          >
            <Text style={{ color: palette.accent, fontFamily: fonts.bodySemiBold, fontSize: 14 }}>
              {settings.isConfigured ? "Reintentar" : "Ir a Ajustes"}
            </Text>
          </Pressable>
        </>
      ) : (
        <>
          <BalanceLine variant="loading" color={palette.accent} lineColor={palette.line} width={200} height={40} />
          <Text style={{ fontSize: 13, color: palette.dim }}>Trayendo la meta…</Text>
        </>
      )}
    </View>
  );
}
