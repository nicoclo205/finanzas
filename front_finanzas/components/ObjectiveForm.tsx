import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../theme/ThemeContext";
import { fonts } from "../theme/fonts";
import { useSettings } from "../lib/SettingsContext";
import {
  createObjective,
  updateObjective,
  removeObjective,
  withdrawFromObjective,
  ApiError,
  Method,
  Objective,
  ObjectiveInput,
} from "../lib/api";
import { formatAmount } from "../lib/format";
import { RiseIn } from "./RiseIn";
import { ConfirmDialog } from "./ConfirmDialog";

const METHODS: Method[] = ["efectivo", "transferencia", "tarjeta de débito", "tarjeta de crédito"];
const NAME_MAX = 60;
const AMOUNT_MAX = 100000000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

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
  /** Si se pasa, el formulario edita esa meta (y ofrece borrarla); si no, crea una nueva. */
  objective?: Objective;
};

export function ObjectiveForm({ objective }: Props) {
  const { palette, semantic } = useTheme();
  const router = useRouter();
  const settings = useSettings();
  const editing = !!objective;

  const [name, setName] = useState(objective?.name ?? "");
  const [targetAmount, setTargetAmount] = useState(
    objective?.target_amount != null ? String(objective.target_amount) : ""
  );
  const [targetDate, setTargetDate] = useState(objective?.target_date ?? "");
  const [refundMethod, setRefundMethod] = useState<Method>("efectivo");
  const [submitting, setSubmitting] = useState(false);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const savedAmount = objective?.saved_amount ?? 0;

  const goList = () => {
    setDialog(null);
    router.replace("/metas");
  };

  const fail = (title: string, text: string) => setDialog({ kind: "error", title, text });

  const handleSubmit = async () => {
    if (!settings.isConfigured) {
      fail("Sin conexión", "Conecta el backend en Ajustes antes de guardar la meta.");
      return;
    }

    const cleanName = name.trim();
    if (!cleanName) {
      fail("Falta el nombre", "Ponle un nombre a la meta, por ejemplo «Fondo de emergencia».");
      return;
    }

    let target: number | null = null;
    if (targetAmount.trim()) {
      target = parseFloat(targetAmount.replace(/\./g, "").replace(",", "."));
      if (!target || target <= 0) {
        fail("Revisa el monto objetivo", "Escribe un número mayor a cero, o déjalo vacío si no tiene monto fijo.");
        return;
      }
      if (target > AMOUNT_MAX) {
        fail("Revisa el monto objetivo", "Ese monto es demasiado alto — revisa que no sobren ceros.");
        return;
      }
    }

    let date: string | null = null;
    if (targetDate.trim()) {
      date = targetDate.trim();
      if (!ISO_DATE.test(date) || Number.isNaN(Date.parse(`${date}T12:00:00`))) {
        fail("Revisa la fecha", "Usa el formato AAAA-MM-DD, por ejemplo 2027-06-01, o déjala vacía.");
        return;
      }
    }

    const data: ObjectiveInput = {
      name: cleanName,
      target_amount: target,
      created_date: objective?.created_date ?? todayIso(),
      target_date: date,
    };
    const creds = { baseUrl: settings.url, apiKey: settings.apiKey };

    setSubmitting(true);
    try {
      if (editing) {
        await updateObjective(creds, objective!.objective_id, data);
        setDialog({
          kind: "ok",
          title: "Guardado",
          text: "Los cambios quedaron aplicados en la meta.",
          onCta: goList,
        });
      } else {
        await createObjective(creds, data);
        setDialog({
          kind: "ok",
          title: "Meta creada",
          text: "Ya aparece en tu lista de metas.",
          onCta: goList,
        });
      }
    } catch (err) {
      fail("No se pudo guardar", err instanceof ApiError ? err.message : "Ocurrió un error inesperado.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!objective) return;
    setConfirmDelete(false);
    setSubmitting(true);
    const creds = { baseUrl: settings.url, apiKey: settings.apiKey };
    try {
      // Si la meta tiene plata, primero se devuelve al saldo (retiro total) y recién
      // después se borra: así el dinero nunca queda "perdido" dentro de una meta que ya no existe.
      if (savedAmount > 0) {
        await withdrawFromObjective(creds, objective.objective_id, {
          amount: savedAmount,
          method: refundMethod,
          date: todayIso(),
          description: `Cierre de meta: ${objective.name}`.slice(0, 100),
        });
      }
      await removeObjective(creds, objective.objective_id);
      setDialog({
        kind: "ok",
        title: "Meta borrada",
        text:
          savedAmount > 0
            ? `Los $ ${formatAmount(savedAmount)} volvieron a tu saldo.`
            : "Ya no está en tu lista de metas.",
        onCta: goList,
      });
    } catch (err) {
      fail("No se pudo borrar", err instanceof ApiError ? err.message : "Ocurrió un error inesperado.");
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
          <Text
            style={{
              fontFamily: fonts.monoRegular,
              fontSize: 11,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: palette.accent,
            }}
          >
            {editing ? `Meta #${objective!.objective_id}` : "Nueva meta"}
          </Text>
          <Text style={{ fontFamily: fonts.displayRegular, fontWeight: "400", fontSize: 32, color: palette.text, marginTop: 8 }}>
            {editing ? "Revisa y ajusta" : "¿Para qué vas a ahorrar?"}
          </Text>
        </View>

        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
            <Text style={labelStyle}>Nombre</Text>
            <Text
              style={{
                fontFamily: fonts.monoRegular,
                fontSize: 11,
                color: name.length >= NAME_MAX ? semantic.gasto : palette.dim,
              }}
            >
              {name.length}/{NAME_MAX}
            </Text>
          </View>
          <TextInput
            value={name}
            onChangeText={(t) => setName(t.slice(0, NAME_MAX))}
            placeholder="Fondo de emergencia, viaje a Bariloche…"
            placeholderTextColor={palette.dim}
            style={[fieldInputStyle, { fontFamily: fonts.bodyRegular }]}
          />
        </View>

        <View style={{ backgroundColor: palette.surface, borderRadius: 20, padding: 22 }}>
          <Text style={labelStyle}>Monto objetivo (opcional)</Text>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10, marginTop: 8 }}>
            <Text style={{ fontFamily: fonts.monoRegular, fontSize: 24, color: palette.dim }}>$</Text>
            <TextInput
              value={targetAmount}
              onChangeText={(t) => setTargetAmount(t.replace(/[^0-9.,]/g, ""))}
              keyboardType="decimal-pad"
              placeholder="Sin monto fijo"
              placeholderTextColor={palette.dim}
              style={{
                flex: 1,
                minWidth: 0,
                borderBottomWidth: 1,
                borderColor: palette.line,
                color: palette.text,
                fontFamily: fonts.monoMedium,
                fontSize: 32,
                letterSpacing: -0.5,
                paddingBottom: 8,
              }}
            />
          </View>
          <Text style={{ fontSize: 12, color: palette.dim, marginTop: 14 }}>
            Déjalo vacío para un apartado abierto, como una cuenta de ahorros sin tope.
          </Text>
        </View>

        <View style={{ gap: 10 }}>
          <Text style={labelStyle}>Fecha objetivo (opcional)</Text>
          <TextInput
            value={targetDate}
            onChangeText={setTargetDate}
            placeholder="AAAA-MM-DD"
            placeholderTextColor={palette.dim}
            style={[fieldInputStyle, { fontFamily: fonts.monoRegular, maxWidth: 200 }]}
          />
        </View>

        {editing && savedAmount > 0 && (
          <View style={{ gap: 10 }}>
            <Text style={labelStyle}>Si la borras, devolver al saldo por</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {METHODS.map((m) => (
                <Chip key={m} label={m} active={refundMethod === m} onPress={() => setRefundMethod(m)} />
              ))}
            </View>
          </View>
        )}

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
            <Text style={{ color: palette.accent, fontFamily: fonts.bodySemiBold, fontSize: 14 }}>
              {submitting ? "Guardando…" : editing ? "Guardar cambios" : "Crear meta"}
            </Text>
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
            <Text style={{ color: palette.dim, fontFamily: fonts.bodySemiBold, fontSize: 14 }}>Cancelar</Text>
          </Pressable>
          {editing && (
            <Pressable
              onPress={() => setConfirmDelete(true)}
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
        visible={confirmDelete}
        kind="error"
        title={savedAmount > 0 ? "Esta meta tiene plata apartada" : "¿Borrar esta meta?"}
        text={
          savedAmount > 0
            ? `Tiene $ ${formatAmount(savedAmount)} apartados. Si la borras, todo ese dinero se traslada de vuelta a tu saldo (por ${refundMethod}) y la meta desaparece.`
            : "La meta se borra de tu lista. Esta acción no se puede deshacer."
        }
        ctaLabel="Sí, borrar"
        onClose={handleDelete}
        cancelLabel="Cancelar"
        onCancel={() => setConfirmDelete(false)}
      />

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
