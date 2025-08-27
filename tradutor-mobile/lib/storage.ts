import AsyncStorage from "@react-native-async-storage/async-storage";
export async function setDefaultLang(v: string){ await AsyncStorage.setItem("@default_lang", v); }
export async function getDefaultLang(){ return AsyncStorage.getItem("@default_lang"); }
