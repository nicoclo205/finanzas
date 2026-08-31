import React, { createContext, useContext, useEffect, useState } from "react";
import { getItem, setItem } from "./storage";

const URL_KEY = "finanzas.backendUrl";
const API_KEY_KEY = "finanzas.apiKey";

type SettingsContextValue = {
  url: string;
  apiKey: string;
  loaded: boolean;
  isConfigured: boolean;
  save: (url: string, apiKey: string) => Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [url, setUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([getItem(URL_KEY), getItem(API_KEY_KEY)]).then(([savedUrl, savedKey]) => {
      setUrl(savedUrl ?? "");
      setApiKey(savedKey ?? "");
      setLoaded(true);
    });
  }, []);

  const save = async (newUrl: string, newApiKey: string) => {
    await Promise.all([setItem(URL_KEY, newUrl), setItem(API_KEY_KEY, newApiKey)]);
    setUrl(newUrl);
    setApiKey(newApiKey);
  };

  return (
    <SettingsContext.Provider value={{ url, apiKey, loaded, isConfigured: !!url && !!apiKey, save }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings debe usarse dentro de SettingsProvider");
  return ctx;
}
