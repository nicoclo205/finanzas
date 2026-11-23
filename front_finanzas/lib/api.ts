export type TransactionType = "ingreso" | "gasto";
export type Method = "efectivo" | "transferencia" | "tarjeta de débito" | "tarjeta de crédito";
export type Category = "comida" | "transporte" | "salidas" | "ocio" | "trabajo" | "padres" | "otro" | "ahorro";

export type Transaction = {
  id: number;
  amount: number;
  transaction_type: TransactionType;
  method: Method;
  category: Category;
  date: string;
  description: string;
};

export type TransactionInput = Omit<Transaction, "id">;

export type Objective = {
  objective_id: number;
  name: string;
  target_amount: number | null;
  created_date: string;
  target_date: string | null;
  saved_amount: number;
};

export type ObjectiveInput = {
  name: string;
  target_amount: number | null;
  created_date: string;
  target_date: string | null;
};

export type ObjectiveMovementInput = {
  amount: number;
  method: Method;
  date: string;
  description: string;
};

export type Credentials = {
  baseUrl: string;
  apiKey: string;
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(creds: Credentials, path: string, options: RequestInit = {}): Promise<T> {
  const base = creds.baseUrl.replace(/\/$/, "");
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": creds.apiKey,
      ...(options.headers ?? {}),
    },
  });

  if (res.status === 401) throw new ApiError(401, "La API key no es válida.");
  if (res.status === 404) throw new ApiError(404, "No se encontró lo que buscabas.");
  if (res.status === 409) {
    const body = await res.json().catch(() => null);
    throw new ApiError(409, body?.detail ?? "La operación entra en conflicto con el estado actual.");
  }
  if (res.status === 422) {
    const body = await res.json().catch(() => null);
    throw new ApiError(422, body?.detail ?? "El movimiento no es válido.");
  }
  if (!res.ok) throw new ApiError(res.status, "Ocurrió un error inesperado conectando con el backend.");

  if (res.status === 204) return undefined as T;
  return res.json();
}

export function listTransactions(creds: Credentials) {
  return request<Transaction[]>(creds, "/transactions");
}

export function getTransaction(creds: Credentials, id: number) {
  return request<Transaction>(creds, `/transactions/${id}`);
}

export function createTransaction(creds: Credentials, data: TransactionInput) {
  return request<Transaction>(creds, "/transactions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateTransaction(creds: Credentials, id: number, data: TransactionInput) {
  return request<Transaction>(creds, `/transactions/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function removeTransaction(creds: Credentials, id: number) {
  return request<void>(creds, `/transactions/${id}`, { method: "DELETE" });
}

export function listObjectives(creds: Credentials) {
  return request<Objective[]>(creds, "/objectives");
}

export function createObjective(creds: Credentials, data: ObjectiveInput) {
  return request<Objective>(creds, "/objectives", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getObjective(creds: Credentials, id: number) {
  return request<Objective>(creds, `/objectives/${id}`);
}

export function assignToObjective(creds: Credentials, id: number, data: ObjectiveMovementInput) {
  return request<Objective>(creds, `/objectives/${id}/assign`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function withdrawFromObjective(creds: Credentials, id: number, data: ObjectiveMovementInput) {
  return request<Objective>(creds, `/objectives/${id}/withdraw`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateObjective(creds: Credentials, id: number, data: ObjectiveInput) {
  return request<Objective>(creds, `/objectives/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function removeObjective(creds: Credentials, id: number) {
  return request<void>(creds, `/objectives/${id}`, { method: "DELETE" });
}
