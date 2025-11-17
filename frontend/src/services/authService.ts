// src/services/authService.ts
import { apiClient } from "./api/apiClient";

export const authService = {
  async login(email: string, password: string) {
    const response = await apiClient.post("/auth/login", { email, password });
    return response.data; // { message, token }
  },

  async register(name: string, email: string, password: string, role: string) {
    const response = await apiClient.post("/auth/register", {
      name,
      email,
      password,
      role,
    });
    return response.data;
  },
};
