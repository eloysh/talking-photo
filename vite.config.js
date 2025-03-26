import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Убедись, что dotenv импортируется правильно
import dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  plugins: [react()],
});
