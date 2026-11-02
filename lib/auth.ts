import { betterAuth } from "better-auth";
import { authDatabase } from "./db";

const baseURL = process.env.BETTER_AUTH_URL || "http://127.0.0.1:3000";
export const auth = betterAuth({
  appName: "YFLB Fitness Academy",
  database: authDatabase,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL,
  trustedOrigins: [baseURL],
  emailAndPassword: { enabled: true, minPasswordLength: 10, maxPasswordLength: 128 },
  advanced: { useSecureCookies: process.env.NODE_ENV === "production" },
});
