import React from "react";
import { useLocalSearchParams } from "expo-router";
import { TransactionForm } from "../components/TransactionForm";
import { TransactionType } from "../lib/api";

export default function RegistrarScreen() {
  const { tipo } = useLocalSearchParams<{ tipo?: string }>();
  const initialType: TransactionType | undefined =
    tipo === "ingreso" ? "ingreso" : tipo === "gasto" ? "gasto" : undefined;

  return <TransactionForm initialType={initialType} />;
}
