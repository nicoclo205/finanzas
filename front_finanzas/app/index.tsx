import React, { useCallback, useState } from "react";
import { View, Text, Pressable, ScrollView, useWindowDimensions } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useTheme } from "../theme/ThemeContext";
import { DESKTOP_BREAKPOINT } from "../theme/layout";
import { fonts } from "../theme/fonts";
import { useSettings } from "../lib/SettingsContext";
import { listTransactions, listObjectives, Transaction, Objective, ApiError } from "../lib/api";
import { formatAmount } from "../lib/format";
import {
  categoryBreakdown,
  computeSummary,
  currentMonthKey,
  featuredObjectives,
  METHOD_ORDER,
  monthLabel,
  shiftMonth,
} from "../lib/dashboard";
import { BalanceLine } from "../components/BalanceLine";
import { RiseIn } from "../components/RiseIn";
import { AnimatedBar } from "../components/AnimatedBar";
import { ObjectiveCard } from "../components/ObjectiveCard";

const signedText = (n: number) => `${n < 0 ? "− " : ""}$ ${formatAmount(n)}`;

export default function ResumenScreen() {
  const { palette, semantic } = useTheme();
  const { width } = useWindowDimensions();
  const desktop = width >= DESKTOP_BREAKPOINT;
  const router = useRouter();
  const settings = useSettings();

  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState(currentMonthKey());

  const load = useCallback(async () => {
    if (!settings.isConfigured) return;
    setError(null);
    try {
      const creds = { baseUrl: settings.url, apiKey: settings.apiKey };
      const [txs, objs] = await Promise.all([listTransactions(creds), listObjectives(creds)]);
      setTransactions(txs);
      setObjectives(objs);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo conectar con el backend.");
    }
  }, [settings.isConfigured, settings.url, settings.apiKey]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const isCurrentMonth = month === currentMonthKey();
  const summary = computeSummary(transactions ?? [], month);
  const balanceColor = summary.balance < 0 ? semantic.gasto : semantic.ingreso;
  const categories = categoryBreakdown(transactions ?? [], month);
  const featured = featuredObjectives(objectives);
  const totalSaved = objectives.reduce((acc, o) => acc + o.saved_amount, 0);
  const flowTotal = summary.income + summary.expense;
  const incomeShare = flowTotal > 0 ? summary.income / flowTotal : 0.5;

  const labelStyle = {
    fontFamily: fonts.monoRegular,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase" as const,
    color: palette.dim,
  };

  const body = !settings.isConfigured ? (
    <Notice
      title="Todavía no conectaste el backend"
      text="Ve a Ajustes y guarda la URL y la API key para ver tu resumen."
      actionLabel="Ir a Ajustes"
      onPress={() => router.push("/ajustes")}
    />
  ) : error ? (
    <Notice title="No se pudo cargar" text={error} actionLabel="Reintentar" onPress={load} />
  ) : transactions === null ? (
    <View style={{ paddingVertical: 60, alignItems: "center", gap: 14 }}>
      <BalanceLine variant="loading" color={palette.accent} lineColor={palette.line} width={200} height={40} />
      <Text style={{ fontSize: 13, color: palette.dim }}>Calculando tu resumen…</Text>
    </View>
  ) : (
    <View style={{ flexDirection: desktop ? "row" : "column", alignItems: desktop ? "flex-start" : "stretch", gap: 18 }}>
      <View style={{ flex: desktop ? 1 : undefined, gap: 18 }}>
      <RiseIn>
        <View style={{ backgroundColor: palette.surface, borderRadius: 20, padding: 22, gap: 18 }}>
          <View style={{ alignItems: "center", gap: 2 }}>
            <Text style={labelStyle}>Tu saldo</Text>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
              <Text style={{ fontFamily: fonts.monoMedium, fontSize: 24, color: palette.dim }}>$</Text>
              <Text
                style={{
                  fontFamily: fonts.monoMedium,
                  fontSize: desktop ? 52 : 44,
                  letterSpacing: -1,
                  color: balanceColor,
                }}
              >
                {(summary.balance < 0 ? "− " : "") + formatAmount(summary.balance)}
              </Text>
            </View>
            <BalanceLine variant="chart" color={balanceColor} lineColor={palette.line} width={190} height={34} />
          </View>

          <View style={{ gap: 2 }}>
            <Text style={[labelStyle, { marginBottom: 6 }]}>Por medio de pago</Text>
            {METHOD_ORDER.map((m) => {
              const value = summary.byMethod[m];
              return (
                <View
                  key={m}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    paddingVertical: 11,
                    borderTopWidth: 1,
                    borderColor: palette.line,
                  }}
                >
                  <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 14, color: palette.text }}>{m}</Text>
                  <Text
                    style={{
                      fontFamily: fonts.monoMedium,
                      fontSize: 15,
                      color: value < 0 ? semantic.gasto : value > 0 ? semantic.ingreso : palette.dim,
                    }}
                  >
                    {signedText(value)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </RiseIn>

      </View>
      <View style={{ flex: desktop ? 1 : undefined, gap: 18 }}>
      <RiseIn delay={80}>
        <View style={{ backgroundColor: palette.surface, borderRadius: 20, padding: 22, gap: 16 }}>
          <Text style={labelStyle}>Ingresos y gastos · {monthLabel(month)}</Text>

          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 16 }}>
            <View style={{ gap: 4 }}>
              <Text style={{ fontSize: 12, color: palette.dim }}>Ingresos</Text>
              <Text style={{ fontFamily: fonts.monoMedium, fontSize: 22, color: semantic.ingreso }}>
                $ {formatAmount(summary.income)}
              </Text>
            </View>
            <View style={{ gap: 4, alignItems: "flex-end" }}>
              <Text style={{ fontSize: 12, color: palette.dim }}>Gastos</Text>
              <Text style={{ fontFamily: fonts.monoMedium, fontSize: 22, color: semantic.gasto }}>
                $ {formatAmount(summary.expense)}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", height: 6, borderRadius: 999, overflow: "hidden", gap: 3 }}>
            <View style={{ flex: Math.max(incomeShare, 0.001), backgroundColor: semantic.ingreso, borderRadius: 999 }} />
            <View
              style={{ flex: Math.max(1 - incomeShare, 0.001), backgroundColor: semantic.gasto, borderRadius: 999 }}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "baseline",
              paddingTop: 12,
              borderTopWidth: 1,
              borderColor: palette.line,
            }}
          >
            <Text style={{ fontSize: 13, color: palette.dim }}>Apartado neto en metas</Text>
            <Text style={{ fontFamily: fonts.monoMedium, fontSize: 15, color: palette.accent }}>
              {signedText(summary.savingsNet)}
            </Text>
          </View>

          {summary.monthCount === 0 && (
            <Text style={{ fontSize: 13, color: palette.dim }}>No hay movimientos en este mes.</Text>
          )}
        </View>
      </RiseIn>
      <RiseIn delay={160}>
        <View style={{ backgroundColor: palette.surface, borderRadius: 20, padding: 22, gap: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
            <Text style={labelStyle}>Gasto por categoría · {monthLabel(month)}</Text>
            <Text style={{ fontFamily: fonts.monoRegular, fontSize: 11, color: palette.dim }}>
              $ {formatAmount(summary.expense)}
            </Text>
          </View>

          {categories.length === 0 ? (
            <Text style={{ fontSize: 13, color: palette.dim }}>Sin gastos registrados en este mes.</Text>
          ) : (
            categories.map((c, i) => (
              <View key={c.category} style={{ gap: 8 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                  <Text
                    style={{
                      flex: 1,
                      fontFamily: fonts.bodyMedium,
                      fontSize: 14,
                      color: palette.text,
                      textTransform: "capitalize",
                    }}
                  >
                    {c.category}
                  </Text>
                  <Text style={{ fontFamily: fonts.monoRegular, fontSize: 12, color: palette.dim }}>
                    {Math.round(c.share * 100)}%
                  </Text>
                  <Text style={{ fontFamily: fonts.monoMedium, fontSize: 15, color: semantic.gasto, minWidth: 96, textAlign: "right" }}>
                    $ {formatAmount(c.total)}
                  </Text>
                </View>
                <AnimatedBar value={c.share} color={semantic.gasto} delay={200 + i * 70} />
              </View>
            ))
          )}
        </View>
      </RiseIn>

      <RiseIn delay={240}>
        <View style={{ backgroundColor: palette.surface, borderRadius: 20, padding: 22, gap: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
            <Text style={labelStyle}>Metas</Text>
            <Text style={{ fontFamily: fonts.monoMedium, fontSize: 15, color: palette.accent }}>
              $ {formatAmount(totalSaved)} apartados
            </Text>
          </View>

          {featured.length === 0 ? (
            <View style={{ gap: 12, alignItems: "flex-start" }}>
              <Text style={{ fontSize: 13, color: palette.dim }}>
                Todavía no tienes metas. Un apartado de ahorro aparece aquí con su avance.
              </Text>
              <LinkButton label="Crear una meta" onPress={() => router.push("/meta/nueva")} />
            </View>
          ) : (
            <>
              {featured.map((o) => (
                <ObjectiveCard key={o.objective_id} objective={o} onPress={() => router.push(`/meta/${o.objective_id}`)} />
              ))}
              <LinkButton
                label={objectives.length > featured.length ? `Ver las ${objectives.length} metas` : "Ver metas"}
                onPress={() => router.push("/metas")}
              />
            </>
          )}
        </View>
      </RiseIn>
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 26, alignItems: "center" }}>
      <View style={{ width: "100%", maxWidth: desktop ? 1080 : 680, gap: 22 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: fonts.monoRegular,
                fontSize: 11,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: palette.accent,
              }}
            >
              Resumen
            </Text>
            <Text
              style={{ fontFamily: fonts.displayRegular, fontWeight: "400", fontSize: 32, color: palette.text, marginTop: 8 }}
            >
              Tu mes
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <MonthButton glyph="‹" onPress={() => setMonth((m) => shiftMonth(m, -1))} />
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: 14,
                color: palette.text,
                minWidth: 128,
                textAlign: "center",
                textTransform: "capitalize",
              }}
            >
              {monthLabel(month)}
            </Text>
            <MonthButton glyph="›" disabled={isCurrentMonth} onPress={() => setMonth((m) => shiftMonth(m, 1))} />
          </View>
        </View>

        {body}
      </View>
    </ScrollView>
  );
}

function LinkButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { palette } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderWidth: 1,
        borderColor: palette.line,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 18,
        alignSelf: "flex-start",
      }}
    >
      <Text style={{ color: palette.accent, fontFamily: fonts.bodySemiBold, fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

function MonthButton({ glyph, onPress, disabled }: { glyph: string; onPress: () => void; disabled?: boolean }) {
  const { palette } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: palette.line,
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.35 : 1,
      }}
    >
      <Text style={{ color: palette.accent, fontFamily: fonts.monoRegular, fontSize: 18, lineHeight: 20 }}>{glyph}</Text>
    </Pressable>
  );
}

function Notice({
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
