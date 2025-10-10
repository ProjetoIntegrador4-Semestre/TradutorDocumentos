// lib/api.ts
import { Platform } from "react-native";

const WEB = "http://localhost:8080";
const ANDROID = "http://10.0.2.2:8080"; // emulador Android
const IOS = "http://localhost:8080";    // iOS/Expo Go local

export const BASE_URL =
  Platform.OS === "web" ? WEB : Platform.OS === "android" ? ANDROID : IOS;

export class ApiError extends Error {
  status?: number;
  data?: any;
  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

// 🔐 BOOT_TOKEN deve ser o MESMO do backend (APP_BOOT_TOKEN)
export const BOOT_TOKEN = "public-dev-boot-token-CHANGE_ME";
