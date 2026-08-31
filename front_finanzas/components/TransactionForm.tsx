import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../theme/ThemeContext";
import { DESKTOP_BREAKPOINT } from "../theme/layout";
import { fonts } from "../theme/fonts";
import { useSettings } from "../lib/SettingsContext";
import {
  createTransaction,
  updateTransaction,
  removeTransaction,
  ApiError,
  Transaction,
  TransactionInput,
  TransactionType,
  Method,
  Category,
} from "../lib/api";
import { RiseIn } from "./RiseIn";
import { ConfirmDialog } from "./ConfirmDialog";

const METHODS: Method[] = ["efectivo", "transferencia", "tarjeta de débito", "tarjeta de crédito"];
const CATEGORIES: Category[] = ["comida", "transporte", "salidas", "ocio", "trabajo", "padres", "otro"];

function todayIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

type DialogState = {
  kind: "ok" | "error";
  title: string;
  text: string;
  onCta?: () => void;
};

type Props = {
  transaction?: Transaction;
  initialType?: TransactionType;
};

export function TransactionForm({ transaction, initialType }: Props) {
  const { palette, semantic } = useTheme();
  const { width } = useWindowDimensions();
  const desktop = width >= DESKTOP_BREAKPOINT;
  const router = useRouter();
  const settings = useSettings();
  const editing = !!transaction;

  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : "");
  const [type, setType] = useState<TransactionType>(transaction?.transaction_type ?? initialType ?? "gasto");
  const [method, setMethod] = useState<Method>(transaction?.method ?? "efectivo");
  const [category, setCategory] = useState<Category>(transaction?.category ?? "comida");
  const [date, setDate] = useState(transaction?.date ?? todayIso());
  const [description, setDescription] = useState(transaction?.description ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const submitLabel = submitting
    ? "Guardando…"
    : editing
    ? "Guardar cambios"
    : type === "ingreso"
    ? "Registrar ingreso"
    : "Registrar gasto";
  const kicker = editing ? `Movimiento #${transaction!.id}` : "Nuevo movimiento";
  const heading = editing ? "Revisa y ajusta" : type === "ingreso" ? "Anota un ingreso" : "Anota un gasto";

  const goList = () => {
    setDialog(null);
    router.replace("/");
  };

  const handleSubmit = async () => {
    if (!settings.isConfigured) {
      setDialog({ kind: "error", title: "Sin conexión", text: "Conecta el backend en Ajustes antes de registrar." });
      return;
    }

    const parsed = parseFloat(amount.replace(/\./g, "").replace(",", "."));
    if (!parsed || parsed <= 0) {
      setDialog({ kind: "error", title: "Falta el monto", text: "Escribe un número mayor a cero para poder registrarlo." });
      return;
    }
    if (parsed > 100000000) {
      setDialog({ kind: "error", title: "Revisa el monto", text: "Ese monto es demasiado alto — revisa que no sobren ceros." });
      return;
    }
    if (description.length > 100) {
      setDialog({
        kind: "error",
        title: "Descripción muy larga",
        text: "Se pasa de 100 caracteres. Recórtala un poco y vuelve a intentar.",
      });
      return;
    }

    const data: TransactionInput = {
      amount: parsed,
      transaction_type: type,
      method,
      category,
      date,
      description,
    };
    const creds = { baseUrl: settings.url, apiKey: settings.apiKey };

    setSubmitting(true);
    try {
      if (editing) {
        await updateTransaction(creds, transaction!.id, data);
        setDialog({
          kind: "ok",
          title: "Guardado",
          text: "Los cambios quedaron aplicados en el movimiento.",
          onCta: goList,
        });
      } else {
        await createTransaction(creds, data);
        setDialog({
          kind: "ok",
          title: type === "ingreso" ? "Ingreso registrado" : "Gasto registrado",
          text: "Ya está en la lista y el saldo se actualizó.",
          onCta: goList,
        });
      }
    } catch (err) {
      setDialog({
        kind: "error",
        title: "No se pudo guardar",
        text: err instanceof ApiError ? err.message : "Ocurrió un error inesperado.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!transaction) return;
    setSubmitting(true);
    try {
      await removeTransaction({ baseUrl: settings.url, apiKey: settings.apiKey }, transaction.id);
      setDialog({ kind: "ok", title: "Borrado", text: "Ese movimiento ya no está en la lista.", onCta: goList });
    } catch (err) {
      setDialog({
        kind: "error",
        title: "No se pudo borrar",
        text: err instanceof ApiError ? err.message : "Ocurrió un error inesperado.",
      });
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

  return (
    <ScrollView contentContainerStyle={{ padding: 26, alignItems: "center" }}>
      <RiseIn style={{ width: "100%", maxWidth: 620, gap: 26 }}>
        <View>
          <Text style={{ fontFamily: fonts.monoRegular, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: palette.accent }}>
            {kicker}
          </Text>
          <Text style={{ fontFamily: fonts.displayRegular, fontWeight: "400", fontSize: 32, color: palette.text, marginTop: 8 }}>
            {heading}
          </Text>
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
          <View style={{ flexDirection: "row", gap: 8, marginTop: 20 }}>
            <SemanticToggle
              label="Ingreso"
              active={type === "ingreso"}
              color={semantic.ingreso}
              onPress={() => setType("ingreso")}
            />
            <SemanticToggle
              label="Gasto"
              active={type === "gasto"}
              color={semantic.gasto}
              onPress={() => setType("gasto")}
            />
          </View>
        </View>

        <View style={{ gap: 10 }}>
          <Text style={labelStyle}>Medio de pago</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {METHODS.map((m) => (
              <Chip key={m} label={m} active={method === m} onPress={() => setMethod(m)} />
            ))}
          </View>
        </View>

        <View style={{ gap: 10 }}>
          <Text style={labelStyle}>Categoría</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {CATEGORIES.map((c) => (
              <Chip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />
            ))}
          </View>
        </View>

        <View style={{ flexDirection: desktop ? "row" : "column", gap: 16 }}>
          <View style={{ gap: 10, width: desktop ? 180 : undefined }}>
            <Text style={labelStyle}>Fecha</Text>
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="AAAA-MM-DD"
              placeholderTextColor={palette.dim}
              style={[fieldInputStyle, { fontFamily: fonts.monoRegular }]}
            />
          </View>
          <View style={{ gap: 10, flex: 1 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
              <Text style={labelStyle}>Descripción</Text>
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
              placeholder="En qué se fue, o de dónde vino"
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
              borderColor: palette.accent,
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: "center",
              opacity: submitting ? 0.6 : 1,
            }}
          >
            <Text style={{ color: palette.accent, fontFamily: fonts.bodySemiBold, fontSize: 14 }}>{submitLabel}</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/")}
            style={{
              borderWidth: 1,
              borderColor: palette.line,
              borderRadius: 12,
              paddingVertical: 16,
              paddingHorizontal: 22,
            }}
          >
            <Text style={{ color: palette.dim, fontFamily: fonts.bodySemiBold, fontSize: 14 }}>Cancelar</Text>
          </Pressable>
          {editing && (
            <Pressable
              onPress={handleDelete}
              disabled={submitting}
              style={{
                borderWidth: 1,
                borderColor: semantic.gasto,
                borderRadius: 12,
                paddingVertical: 16,
                paddingHorizontal: 22,
                opacity: submitting ? 0.6 : 1,
              }}
            >
              <Text style={{ color: semantic.gasto, fontFamily: fonts.bodySemiBold, fontSize: 14 }}>Borrar</Text>
            </Pressable>
          )}
        </View>
      </RiseIn>

      <ConfirmDialog
        visible={!!dialog}
        kind={dialog?.kind ?? "ok"}
        title={dialog?.title ?? ""}
        text={dialog?.text ?? ""}
        onClose={() => (dialog?.onCta ? dialog.onCta() : setDialog(null))}
      />
    </ScrollView>
  );
}

function SemanticToggle({
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
