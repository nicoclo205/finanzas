import React, { useCallback, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "../../theme/ThemeContext";
import { fonts } from "../../theme/fonts";
import { useSettings } from "../../lib/SettingsContext";
import {
  getObjective,
  assignToObjective,
  withdrawFromObjective,
  ApiError,
  Method,
  Objective,
} from "../../lib/api";
import { formatAmount } from "../../lib/format";
import { BalanceLine } from "../../components/BalanceLine";
import { ObjectiveCard } from "../../components/ObjectiveCard";
import { RiseIn } from "../../components/RiseIn";
import { ConfirmDialog } from "../../components/ConfirmDialog";

const METHODS: Method[] = ["efectivo", "transferencia", "tarjeta de débito", "tarjeta de crédito"];
const AMOUNT_MAX = 100000000;

type Mode = "assign" | "withdraw";

type DialogState = { kind: "ok" | "error"; title: string; text: string };

function todayIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function MetaDetalleScreen() {
  const { palette, semantic } = useTheme();
  const router = useRouter();
  const settings = useSettings();
  const { id } = useLocalSearchParams<{ id: string }>();
  const objectiveId = Number(id);

  const [objective, setObjective] = useState<Objective | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [mode, setMode] = useState<Mode>("assign");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<Method>("efectivo");
  const [date, setDate] = useState(todayIso());
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const creds = { baseUrl: settings.url, apiKey: settings.apiKey };

  const load = useCallback(async () => {
    if (!settings.isConfigured) return;
    setLoadError(null);
    try {
      setObjective(await getObjective({ baseUrl: settings.url, apiKey: settings.apiKey }, objectiveId));
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : "No se pudo conectar con el backend.");
    }
  }, [settings.isConfigured, settings.url, settings.apiKey, objectiveId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const fail = (title: string, text: string) => setDialog({ kind: "error", title, text });

  const handleSubmit = async () => {
    if (!objective) return;
    if (!settings.isConfigured) {
      fail("Sin conexión", "Conecta el backend en Ajustes antes de mover plata.");
      return;
    }

    const parsed = parseFloat(amount.replace(/\./g, "").replace(",", "."));
    if (!parsed || parsed <= 0) {
      fail("Falta el monto", "Escribe un número mayor a cero.");
      return;
    }
    if (parsed > AMOUNT_MAX) {
      fail("Revisa el monto", "Ese monto es demasiado alto — revisa que no sobren ceros.");
      return;
    }
    if (mode === "withdraw" && parsed > objective.saved_amount) {
      fail("No alcanza", `Solo tienes $ ${formatAmount(objective.saved_amount)} apartados en esta meta.`);
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T12:00:00`))) {
      fail("Revisa la fecha", "Usa el formato AAAA-MM-DD, por ejemplo 2026-11-23.");
      return;
    }
    if (description.length > 100) {
      fail("Descripción muy larga", "Se pasa de 100 caracteres. Recórtala un poco y vuelve a intentar.");
      return;
    }

    const data = {
      amount: parsed,
      method,
      date,
      description: description.trim() || `${mode === "assign" ? "Apartado a" : "Retiro de"} ${objective.name}`,
    };

    setSubmitting(true);
    try {
      const updated =
        mode === "assign"
          ? await assignToObjective(creds, objectiveId, data)
          : await withdrawFromObjective(creds, objectiveId, data);
      setObjective(updated);
      setAmount("");
      setDescription("");
      setDialog({
        kind: "ok",
        title: mode === "assign" ? "Plata apartada" : "Plata retirada",
        text:
          mode === "assign"
            ? "Quedó en la meta y se descontó de tu saldo disponible."
            : "Volvió a tu saldo disponible.",
      });
    } catch (err) {
      fail("No se pudo guardar", err instanceof ApiError ? err.message : "Ocurrió un error inesperado.");
    } finally {
      setSubmitting(false);
    }
  };

  const labelStyle = {
    fontFamily: fonts.monoRegular,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase" as const,
    color: palette.dim,
  };

  const fieldInputStyle = {
    backgroundColor: palette.surface2,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    color: palette.text,
    fontSize: 14,
  };

  const modeColor = mode === "assign" ? semantic.gasto : semantic.ingreso;

  return (
    <ScrollView contentContainerStyle={{ padding: 26, alignItems: "center" }}>
      <RiseIn style={{ width: "100%", maxWidth: 620, gap: 26 }}>
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
            Meta #{Number.isFinite(objectiveId) ? objectiveId : "?"}
          </Text>
          <Text style={{ fontFamily: fonts.displayRegular, fontWeight: "400", fontSize: 32, color: palette.text, marginTop: 8 }}>
            Mueve plata
          </Text>
        </View>

        {!settings.isConfigured ? (
          <Notice
            title="Todavía no conectaste el backend"
            text="Ve a Ajustes y guarda la URL y la API key."
            actionLabel="Ir a Ajustes"
            onPress={() => router.push("/ajustes")}
          />
        ) : loadError ? (
          <Notice title="No se pudo cargar" text={loadError} actionLabel="Reintentar" onPress={load} />
        ) : !objective ? (
          <View style={{ paddingVertical: 40, alignItems: "center", gap: 14 }}>
            <BalanceLine variant="loading" color={palette.accent} lineColor={palette.line} width={200} height={40} />
            <Text style={{ fontSize: 13, color: palette.dim }}>Trayendo la meta…</Text>
          </View>
        ) : (
          <>
            <ObjectiveCard objective={objective} />

            <View style={{ flexDirection: "row", gap: 8 }}>
              <ModeToggle
                label="Apartar"
                active={mode === "assign"}
                color={semantic.gasto}
                onPress={() => setMode("assign")}
              />
              <ModeToggle
                label="Retirar"
                active={mode === "withdraw"}
                color={semantic.ingreso}
                onPress={() => setMode("withdraw")}
              />
            </View>

            <View style={{ backgroundColor: palette.surface, borderRadius: 20, padding: 22 }}>
              <Text style={labelStyle}>Monto</Text>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10, marginTop: 8 }}>
                <Text style={{ fontFamily: fonts.monoRegular, fontSize: 24, color: palette.dim }}>$</Text>
                <TextInput
                  value={amount}
                  onChangeText={(t) => setAmount(t.replace(/[^0-9.,]/g, ""))}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={palette.dim}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    borderBottomWidth: 1,
                    borderColor: palette.line,
                    color: palette.text,
                    fontFamily: fonts.monoMedium,
                    fontSize: 40,
                    letterSpacing: -0.5,
                    paddingBottom: 8,
                  }}
                />
              </View>
              <Text style={{ fontSize: 12, color: palette.dim, marginTop: 14 }}>
                {mode === "assign"
                  ? "Sale de tu saldo disponible y pasa a vivir en la meta."
                  : "Sale de la meta y vuelve a tu saldo disponible."}
              </Text>
            </View>

            <View style={{ gap: 10 }}>
              <Text style={labelStyle}>Medio de pago</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {METHODS.map((m) => (
                  <Chip key={m} label={m} active={method === m} onPress={() => setMethod(m)} />
                ))}
              </View>
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
              <View style={{ gap: 10, width: 180 }}>
                <Text style={labelStyle}>Fecha</Text>
                <TextInput
                  value={date}
                  onChangeText={setDate}
                  placeholder="AAAA-MM-DD"
                  placeholderTextColor={palette.dim}
                  style={[fieldInputStyle, { fontFamily: fonts.monoRegular }]}
                />
              </View>
              <View style={{ gap: 10, flex: 1, minWidth: 220 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
                  <Text style={labelStyle}>Descripción (opcional)</Text>
                  <Text
                    style={{
                      fontFamily: fonts.monoRegular,
                      fontSize: 11,
                      color: description.length > 100 ? semantic.gasto : palette.dim,
                    }}
                  >
                    {description.length}/100
                  </Text>
                </View>
                <TextInput
                  value={description}
                  onChangeText={(t) => setDescription(t.slice(0, 120))}
                  placeholder="Si la dejas vacía, se genera sola"
                  placeholderTextColor={palette.dim}
                  style={[fieldInputStyle, { fontFamily: fonts.bodyRegular }]}
                />
              </View>
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, paddingBottom: 8 }}>
              <Pressable
                onPress={handleSubmit}
                disabled={submitting}
                style={{
                  flex: 1,
                  minWidth: 200,
                  borderWidth: 1,
                  borderColor: modeColor,
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: "center",
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                <Text style={{ color: modeColor, fontFamily: fonts.bodySemiBold, fontSize: 14 }}>
                  {submitting ? "Guardando…" : mode === "assign" ? "Apartar plata" : "Retirar plata"}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => router.push(`/meta/editar/${objectiveId}`)}
                style={{
                  borderWidth: 1,
                  borderColor: palette.line,
                  borderRadius: 12,
                  paddingVertical: 16,
                  paddingHorizontal: 22,
                }}
              >
                <Text style={{ color: palette.accent, fontFamily: fonts.bodySemiBold, fontSize: 14 }}>Editar</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push("/metas")}
                style={{
                  borderWidth: 1,
                  borderColor: palette.line,
                  borderRadius: 12,
                  paddingVertical: 16,
                  paddingHorizontal: 22,
                }}
              >
                <Text style={{ color: palette.dim, fontFamily: fonts.bodySemiBold, fontSize: 14 }}>Volver</Text>
              </Pressable>
            </View>
          </>
        )}
      </RiseIn>

      <ConfirmDialog
        visible={!!dialog}
        kind={dialog?.kind ?? "ok"}
        title={dialog?.title ?? ""}
        text={dialog?.text ?? ""}
        onClose={() => setDialog(null)}
      />
    </ScrollView>
  );
}

function ModeToggle({
  label,
  active,
  color,
  onPress,
}: {
  label: string;
  active: boolean;
  color: string;
  onPress: () => void;
}) {
  const { palette } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: active ? color : palette.line,
      }}
    >
      <Text style={{ color: active ? color : palette.dim, fontFamily: fonts.bodySemiBold, fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { palette } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 11,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: active ? palette.accent : palette.line,
      }}
    >
      <Text style={{ color: active ? palette.accent : palette.dim, fontFamily: fonts.bodyMedium, fontSize: 13 }}>
        {label}
      </Text>
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
