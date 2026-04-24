import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

export const api = axios.create({
  baseURL: "http://192.168.1.16:5001/api",
  timeout: 10000,
});

/* ================================
   REQUEST INTERCEPTOR
================================ */
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ================================
   RESPONSE INTERCEPTOR
================================ */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log("JWT expired or invalid — logging out");

      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("userRole");

      router.replace("/(auth)/login");
    }

    return Promise.reject(error);
  }
);