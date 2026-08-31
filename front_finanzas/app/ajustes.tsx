import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { fonts } from "../theme/fonts";
import { useSettings } from "../lib/SettingsContext";
import { listTransactions, ApiError } from "../lib/api";
import { RiseIn } from "../components/RiseIn";

type Status = "idle" | "checking" | "ok" | "error";

export default function AjustesScreen() {
  const { palette, semantic, theme, setTheme } = useTheme();
  const settings = useSettings();

  const [url, setUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [statusMessage, setStatusMessage] = useState("Todavía sin conectar — guarda la URL y la clave.");

  useEffect(() => {
    if (!settings.loaded) return;
    setUrl(settings.url);
    setApiKey(settings.apiKey);
    if (settings.isConfigured) {
      setStatus("ok");
      setStatusMessage(`Conectado a ${settings.url}`);
    }
  }, [settings.loaded]);

  const handleSave = async () => {
    if (!apiKey) {
      setStatus("error");
      setStatusMessage("Falta la API key — sin ella el backend responde 401 en todas las rutas.");
      return;
    }
    if (!url) {
      setStatus("error");
      setStatusMessage("Falta la URL del backend.");
      return;
    }

    await settings.save(url, apiKey);
    setStatus("checking");
    setStatusMessage("Conectando…");

    try {
      await listTransactions({ baseUrl: url, apiKey });
      setStatus("ok");
      setStatusMessage(`Conectado a ${url}`);
    } catch (error) {
      setStatus("error");
      setStatusMessage(error instanceof ApiError ? error.message : "No se pudo conectar con esa URL.");
    }
  };

  const statusColor = status === "ok" ? semantic.ingreso : status === "error" ? semantic.gasto : palette.dim;

  return (
    <ScrollView contentContainerStyle={{ padding: 26, alignItems: "center" }}>
      <RiseIn style={{ width: "100%", maxWidth: 560, gap: 24 }}>
        <View>
          <Text
            style={{
              fontFamily: fonts.monoRegular,
              fontSize: 11,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: palette.accent,
            }}
          >
            Configuración
          </Text>
          <Text style={{ fontFamily: fonts.displayRegular, fontSize: 32, color: palette.text, marginTop: 8 }}>
            Conecta con tu backend
          </Text>
          <Text style={{ fontFamily: fonts.bodyRegular, fontSize: 14, lineHeight: 22, color: palette.dim, marginTop: 10 }}>
            Se guarda una sola vez en este dispositivo. La clave queda en el almacenamiento seguro, no viaja a
            ningún otro lado.
          </Text>
        </View>

        <View style={{ backgroundColor: palette.surface, borderRadius: 20, padding: 22, gap: 18 }}>
          <View style={{ gap: 9 }}>
            <Text
              style={{
                fontFamily: fonts.monoRegular,
                fontSize: 11,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: palette.dim,
              }}
            >
              URL del backend
            </Text>
            <TextInput
              value={url}
              onChangeText={(text) => {
                setUrl(text);
                setStatus("idle");
              }}
              placeholder="http://192.168.0.10:8000"
              placeholderTextColor={palette.dim}
              autoCapitalize="none"
              autoCorrect={false}
              style={{
                backgroundColor: palette.surface2,
                borderWidth: 1,
                borderColor: palette.line,
                borderRadius: 12,
                paddingVertical: 13,
                paddingHorizontal: 14,
                color: palette.text,
                fontFamily: fonts.monoRegular,
                fontSize: 14,
              }}
            />
          </View>

          <View style={{ gap: 9 }}>
            <Text
              style={{
                fontFamily: fonts.monoRegular,
                fontSize: 11,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: palette.dim,
              }}
            >
              API key
            </Text>
            <TextInput
              value={apiKey}
              onChangeText={(text) => {
                setApiKey(text);
                setStatus("idle");
              }}
              placeholder="X-API-Key"
              placeholderTextColor={palette.dim}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={!showKey}
              style={{
                backgroundColor: palette.surface2,
                borderWidth: 1,
                borderColor: palette.line,
                borderRadius: 12,
                paddingVertical: 13,
                paddingHorizontal: 14,
                color: palette.text,
                fontFamily: fonts.monoRegular,
                fontSize: 14,
                letterSpacing: 1,
              }}
            />
            <Pressable onPress={() => setShowKey((v) => !v)} style={{ alignSelf: "flex-start" }}>
              <Text style={{ color: palette.accent, fontFamily: fonts.bodySemiBold, fontSize: 12 }}>
                {showKey ? "Ocultar la clave" : "Mostrar la clave"}
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={handleSave}
            disabled={status === "checking"}
            style={{
              borderWidth: 1,
              borderColor: palette.accent,
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: "center",
              opacity: status === "checking" ? 0.6 : 1,
            }}
          >
            <Text style={{ color: palette.accent, fontFamily: fonts.bodySemiBold, fontSize: 14 }}>
              {status === "checking" ? "Conectando…" : status === "ok" ? "Guardado" : "Guardar y conectar"}
            </Text>
          </Pressable>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: statusColor }} />
          <Text style={{ fontFamily: fonts.bodyRegular, fontSize: 13, color: palette.dim, flex: 1 }}>
            {statusMessage}
          </Text>
        </View>

        <View style={{ gap: 12, borderTopWidth: 1, borderTopColor: palette.line, paddingTop: 20 }}>
          <Text
            style={{
              fontFamily: fonts.monoRegular,
              fontSize: 11,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: palette.dim,
            }}
          >
            Apariencia
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable
              onPress={() => setTheme("oscuro")}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: "center",
                borderWidth: 1,
                borderColor: theme === "oscuro" ? palette.accent : palette.line,
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 14,
                  color: theme === "oscuro" ? palette.accent : palette.dim,
                }}
              >
                Oscuro
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setTheme("claro")}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: "center",
                borderWidth: 1,
                borderColor: theme === "claro" ? palette.accent : palette.line,
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 14,
                  color: theme === "claro" ? palette.accent : palette.dim,
                }}
              >
                Claro
              </Text>
            </Pressable>
          </View>
        </View>
      </RiseIn>
    </ScrollView>
  );
}
