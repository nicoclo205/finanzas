import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const isWeb = Platform.OS === "web";

export function getItem(key: string): Promise<string | null> {
  return isWeb ? AsyncStorage.getItem(key) : SecureStore.getItemAsync(key);
}

export function setItem(key: string, value: string): Promise<void> {
  return isWeb ? AsyncStorage.setItem(key, value) : SecureStore.setItemAsync(key, value);
}

export function removeItem(key: string): Promise<void> {
  return isWeb ? AsyncStorage.removeItem(key) : SecureStore.deleteItemAsync(key);
}
