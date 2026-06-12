import axios from "axios";
import { publicEnv } from "@/config/env";

export const apiClient = axios.create({
  baseURL: publicEnv.apiBaseUrl,
  timeout: 20_000,
});
