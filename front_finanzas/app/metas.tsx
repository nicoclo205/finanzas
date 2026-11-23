import React, { useCallback, useState } from "react";
import { View, Text, Pressable, ScrollView, useWindowDimensions } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useTheme } from "../theme/ThemeContext";
import { DESKTOP_BREAKPOINT } from "../theme/layout";
import { fonts } from "../theme/fonts";
import { useSettings } from "../lib/SettingsContext";
import { listObjectives, Objective, ApiError } from "../lib/api";
import { formatAmount } from "../lib/format";
import { BalanceLine } from "../components/BalanceLine";
import { ObjectiveCard } from "../components/ObjectiveCard";
import { RiseIn } from "../components/RiseIn";

export default function MetasScreen() {
  const { palette } = useTheme();
  const { width } = useWindowDimensions();
  const desktop = width >= DESKTOP_BREAKPOINT;
  const router = useRouter();
  const settings = useSettings();

  const [objectives, setObjectives] = useState<Objective[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!settings.isConfigured) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listObjectives({ baseUrl: settings.url, apiKey: settings.apiKey });
      setObjectives(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo conectar con el backend.");
    } finally {
      setLoading(false);
    }
  }, [settings.isConfigured, settings.url, settings.apiKey]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const sorted = (objectives ?? []).slice().sort((a, b) => b.objective_id - a.objective_id);
  const totalSaved = sorted.reduce((acc, o) => acc + o.saved_amount, 0);

  const hero = (
    <View
      style={{
        flex: desktop ? 1 : undefined,
        alignItems: "center",
        justifyContent: desktop ? "space-between" : "flex-start",
        gap: desktop ? 0 : 30,
        paddingVertical: desktop ? 36 : 32,
        paddingHorizontal: 20,
      }}
    >
      <View style={{ alignItems: "center", gap: 2 }}>
        <Text
          style={{
            fontFamily: fonts.monoRegular,
            fontSize: 11,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: palette.dim,
          }}
        >
          Total apartado
        </Text>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
          <Text style={{ fontFamily: fonts.monoMedium, fontSize: 24, color: palette.dim }}>$</Text>
          <Text
            style={{
              fontFamily: fonts.monoMedium,
              fontSize: desktop ? 52 : 46,
              letterSpacing: -1,
              color: palette.accent,
            }}
          >
            {formatAmount(totalSaved)}
          </Text>
        </View>
        <BalanceLine variant="chart" color={palette.accent} lineColor={palette.line} width={190} height={34} />
        <Text style={{ fontSize: 13, color: palette.dim, marginTop: 6 }}>
          en <Text style={{ fontFamily: fonts.monoMedium, color: palette.text }}>{sorted.length}</Text>{" "}
          {sorted.length === 1 ? "meta o apartado" : "metas y apartados"}
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: 16 }}>
        <ActionButton glyph="+" label="Meta" color={palette.accent} onPress={() => router.push("/meta/nueva")} />
        <ActionButton glyph="↻" label="Recargar" color={palette.accent} onPress={load} />
        <ActionButton glyph="✳" label="Ajustes" color={palette.accent} onPress={() => router.push("/ajustes")} />
      </View>
    </View>
  );

  const list = (
    <View style={{ flex: 1, minHeight: 0 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "baseline",
          paddingHorizontal: 20,
          paddingTop: 18,
        }}
      >
        <Text style={{ fontFamily: fonts.displayRegular, fontSize: 21, color: palette.text }}>Metas</Text>
        <Text
          style={{
            fontFamily: fonts.monoRegular,
            fontSize: 11,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            color: palette.dim,
          }}
        >
          {sorted.length} {sorted.length === 1 ? "meta" : "metas"}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30, gap: 10 }}>
        {!settings.isConfigured ? (
          <NoticeBlock
            title="Todavía no conectaste el backend"
            text="Ve a Ajustes y guarda la URL y la API key para poder ver tus metas."
            actionLabel="Ir a Ajustes"
            onPress={() => router.push("/ajustes")}
          />
        ) : loading && objectives === null ? (
          <View style={{ paddingVertical: 40, alignItems: "center", gap: 14 }}>
            <BalanceLine variant="loading" color={palette.accent} lineColor={palette.line} width={200} height={40} />
            <Text style={{ fontSize: 13, color: palette.dim }}>Trayendo tus metas…</Text>
          </View>
        ) : error ? (
          <NoticeBlock title="No se pudo cargar" text={error} actionLabel="Reintentar" onPress={load} />
        ) : sorted.length === 0 ? (
          <NoticeBlock
            title="Todavía no hay metas"
            text="Una meta o un apartado de ahorro (fondo de emergencia, un viaje) aparece aquí con su avance."
            actionLabel="Crear la primera"
            onPress={() => router.push("/meta/nueva")}
          />
        ) : (
sorted.map((o, i) => (
            <RiseIn key={o.objective_id} delay={Math.min(i, 8) * 70}>
              <ObjectiveCard objective={o} onPress={() => router.push(`/meta/${o.objective_id}`)} />
            </RiseIn>
          ))
        )}
      </ScrollView>
    </View>
  );

  if (desktop) {
    return (
      <View style={{ flex: 1, flexDirection: "row", padding: 26, gap: 22 }}>
        <View style={{ flex: 1 }}>{hero}</View>
        <View
          style={{
            flex: 1.15,
            backgroundColor: palette.surface,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: palette.line,
            overflow: "hidden",
          }}
        >
          {list}
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {hero}
      <View
        style={{
          flex: 1,
          backgroundColor: palette.surface,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderWidth: 1,
          borderColor: palette.line,
          overflow: "hidden",
        }}
      >
        {list}
      </View>
    </View>
  );
}

function ActionButton({
  glyph,
  label,
  color,
  onPress,
}: {
  glyph: string;
  label: string;
  color: string;
  onPress: () => void;
}) {
  const { palette } = useTheme();
  const [hovered, setHovered] = useState(false);
  return (
    <View style={{ alignItems: "center", gap: 7 }}>
      <Pressable
        onPress={onPress}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: palette.line,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: hovered ? palette.surface2 : "transparent",
          transform: [{ translateY: hovered ? -2 : 0 }],
        }}
      >
        <Text
          style={{
            color,
            fontFamily: fonts.monoRegular,
            fontSize: 18,
            lineHeight: 18,
            textAlign: "center",
            marginTop: glyph === "+" ? 4 : 0,
          }}
        >
          {glyph}
        </Text>
      </Pressable>
      <Text style={{ fontSize: 11, color: palette.dim }}>{label}</Text>
    </View>
  );
}

function NoticeBlock({
  title,
  text,
  actionLabel,
  onPress,
}: {
  title: string;
  text: string;
  actionLabel: string;
  onPress: () => void;
}) {
  const { palette } = useTheme();
  return (
    <View style={{ paddingVertical: 40, paddingHorizontal: 20, alignItems: "center", gap: 12 }}>
      <Text style={{ fontFamily: fonts.displayRegular, fontSize: 22, color: palette.text, textAlign: "center" }}>
        {title}
      </Text>
      <Text style={{ fontSize: 14, color: palette.dim, textAlign: "center", maxWidth: 320 }}>{text}</Text>
      <Pressable
        onPress={onPress}
        style={{
          marginTop: 6,
          borderWidth: 1,
          borderColor: palette.accent,
          borderRadius: 12,
          paddingVertical: 14,
          paddingHorizontal: 22,
        }}
      >
        <Text style={{ color: palette.accent, fontFamily: fonts.bodySemiBold, fontSize: 14 }}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}
