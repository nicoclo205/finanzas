import React, { useCallback, useState } from "react";
import { View, Text, Pressable, ScrollView, useWindowDimensions } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useTheme } from "../theme/ThemeContext";
import { DESKTOP_BREAKPOINT } from "../theme/layout";
import { fonts } from "../theme/fonts";
import { useSettings } from "../lib/SettingsContext";
import { listTransactions, Transaction, ApiError } from "../lib/api";
import { formatAmount, formatDateLabel } from "../lib/format";
import { BalanceLine } from "../components/BalanceLine";

type Row = {
  id: number;
  showDate: boolean;
  dateLabel: string;
  description: string;
  meta: string;
  color: string;
  amountText: string;
};

export default function ListadoScreen() {
  const { palette, semantic } = useTheme();
  const { width } = useWindowDimensions();
  const desktop = width >= DESKTOP_BREAKPOINT;
  const router = useRouter();
  const settings = useSettings();

  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!settings.isConfigured) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listTransactions({ baseUrl: settings.url, apiKey: settings.apiKey });
      setTransactions(data);
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

  const sorted = (transactions ?? [])
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id));
  const balance = sorted.reduce((acc, t) => acc + (t.transaction_type === "ingreso" ? t.amount : -t.amount), 0);
  const totalIn = sorted.filter((t) => t.transaction_type === "ingreso").reduce((acc, t) => acc + t.amount, 0);
  const totalOut = sorted.filter((t) => t.transaction_type === "gasto").reduce((acc, t) => acc + t.amount, 0);
  const balanceColor = balance < 0 ? semantic.gasto : semantic.ingreso;

  let lastDate: string | null = null;
  const rows: Row[] = sorted.map((t) => {
    const showDate = t.date !== lastDate;
    lastDate = t.date;
    const isIncome = t.transaction_type === "ingreso";
    return {
      id: t.id,
      showDate,
      dateLabel: formatDateLabel(t.date),
      description: t.description || (isIncome ? "Ingreso" : "Gasto"),
      meta: `${t.category} · ${t.method}`,
      color: isIncome ? semantic.ingreso : semantic.gasto,
      amountText: `${isIncome ? "+" : "−"} $ ${formatAmount(t.amount)}`,
    };
  });

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
          Tu saldo
        </Text>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
          <Text style={{ fontFamily: fonts.monoMedium, fontSize: 24, color: palette.dim }}>$</Text>
          <Text
            style={{
              fontFamily: fonts.monoMedium,
              fontSize: desktop ? 52 : 46,
              letterSpacing: -1,
              color: balanceColor,
            }}
          >
            {(balance < 0 ? "− " : "") + formatAmount(balance)}
          </Text>
        </View>
        <BalanceLine variant="chart" color={balanceColor} lineColor={palette.line} width={190} height={34} />
        <View style={{ flexDirection: "row", gap: 20, marginTop: 6 }}>
          <Text style={{ fontSize: 13, color: palette.dim }}>
            Ingresos{" "}
            <Text style={{ fontFamily: fonts.monoMedium, color: semantic.ingreso }}>$ {formatAmount(totalIn)}</Text>
          </Text>
          <Text style={{ fontSize: 13, color: palette.dim }}>
            Gastos <Text style={{ fontFamily: fonts.monoMedium, color: semantic.gasto }}>$ {formatAmount(totalOut)}</Text>
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 16 }}>
        <ActionButton
          glyph="+"
          label="Ingreso"
          color={semantic.ingreso}
          onPress={() => router.push({ pathname: "/registrar", params: { tipo: "ingreso" } })}
        />
        <ActionButton glyph="−" label="Gasto" color={semantic.gasto} onPress={() => router.push("/registrar")} />
        <ActionButton glyph="↻" label="Recargar" color={palette.accent} onPress={load} />
        <ActionButton glyph="✳" label="Ajustes" color={palette.accent} onPress={() => router.push("/ajustes")} />
      </View>
    </View>
  );

  const movements = (
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
        <Text style={{ fontFamily: fonts.displayRegular, fontSize: 21, color: palette.text }}>Movimientos</Text>
        <Text
          style={{
            fontFamily: fonts.monoRegular,
            fontSize: 11,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            color: palette.dim,
          }}
        >
          {sorted.length} {sorted.length === 1 ? "movimiento" : "movimientos"}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30, gap: 6 }}>
        {!settings.isConfigured ? (
          <NoticeBlock
            title="Todavía no conectaste el backend"
            text="Ve a Ajustes y guarda la URL y la API key para poder ver tus movimientos."
            actionLabel="Ir a Ajustes"
            onPress={() => router.push("/ajustes")}
          />
        ) : loading && transactions === null ? (
          <View style={{ paddingVertical: 40, alignItems: "center", gap: 14 }}>
            <BalanceLine variant="loading" color={palette.accent} lineColor={palette.line} width={200} height={40} />
            <Text style={{ fontSize: 13, color: palette.dim }}>Trayendo tus movimientos…</Text>
          </View>
        ) : error ? (
          <NoticeBlock title="No se pudo cargar" text={error} actionLabel="Reintentar" onPress={load} />
        ) : rows.length === 0 ? (
          <NoticeBlock
            title="Todavía no hay nada aquí"
            text="Anota tu primer movimiento y el saldo empieza a moverse desde cero."
            actionLabel="Registrar el primero"
            onPress={() => router.push("/registrar")}
          />
        ) : (
          rows.map((r) => (
            <View key={r.id}>
              {r.showDate && (
                <Text
                  style={{
                    fontFamily: fonts.monoRegular,
                    fontSize: 10,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: palette.dim,
                    paddingTop: 18,
                    paddingBottom: 8,
                    paddingHorizontal: 4,
                  }}
                >
                  {r.dateLabel}
                </Text>
              )}
              <Pressable
                onPress={() => router.push(`/movimiento/${r.id}`)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 14,
                  backgroundColor: palette.bg,
                  borderRadius: 14,
                  padding: 15,
                }}
              >
                <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: r.color }} />
                <View style={{ flex: 1, gap: 3, minWidth: 0 }}>
                  <Text numberOfLines={1} style={{ fontFamily: fonts.bodySemiBold, fontSize: 15, color: palette.text }}>
                    {r.description}
                  </Text>
                  <Text style={{ fontSize: 12, color: palette.dim }}>{r.meta}</Text>
                </View>
                <Text style={{ fontFamily: fonts.monoMedium, fontSize: 16, color: r.color }}>{r.amountText}</Text>
              </Pressable>
            </View>
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
          {movements}
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
        {movements}
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
