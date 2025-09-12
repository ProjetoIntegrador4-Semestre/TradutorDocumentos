import AsyncStorage from "@react-native-async-storage/async-storage";
const KEY_LANG = "@default_lang";

export async function getDefaultLang(): Promise<string | null> {
  try { return (await AsyncStorage.getItem(KEY_LANG)) ?? null; } catch { return null; }
}
export async function setDefaultLang(code: string): Promise<void> {
  try { await AsyncStorage.setItem(KEY_LANG, code); } catch {}
}
