import * as auth from "../../../cli/src/commands/auth";
import { buildSchema, userJsonSchema, registrationJsonSchema } from "./schema";
import { asJson, asString } from "../validation";
import type { ToolDefinition, ToolHandler } from "./types";

export const tools: ToolDefinition[] = [
  {
    name: "fi_request_auth_token",
    description: "Authenticate and return JWT token",
    inputSchema: buildSchema({
      email: { type: "string", description: "User email address" },
      password: { type: "string", description: "User password" },
    }, ["email", "password"]),
  },
  {
    name: "fi_login_user",
    description: "Login and return user profile with JWT token",
    inputSchema: buildSchema({
      email: { type: "string", description: "User email address" },
      password: { type: "string", description: "User password" },
    }, ["email", "password"]),
  },
  {
    name: "fi_check_session",
    description: "Check if current authentication session is valid",
    inputSchema: buildSchema({}),
  },
  {
    name: "fi_register_account",
    description: "Register a new user account. Required: email, login, password",
    inputSchema: buildSchema({
      registration: registrationJsonSchema,
    }, ["registration"]),
  },
  {
    name: "fi_resend_activation_email",
    description: "Resend account activation email",
    inputSchema: buildSchema({
      email: { type: "string", description: "Email address to resend activation to" },
    }, ["email"]),
  },
  {
    name: "fi_activate_account",
    description: "Activate account using activation key from email",
    inputSchema: buildSchema({
      key: { type: "string", description: "Activation key from email" },
    }, ["key"]),
  },
  {
    name: "fi_get_current_user",
    description: "Get currently authenticated user's profile",
    inputSchema: buildSchema({}),
  },
  {
    name: "fi_update_current_account",
    description: "Update current user's account info",
    inputSchema: buildSchema({
      user: userJsonSchema,
    }, ["user"]),
  },
  {
    name: "fi_change_password",
    description: "Change current user's password",
    inputSchema: buildSchema({
      currentPassword: { type: "string", description: "Current password" },
      newPassword: { type: "string", description: "New password" },
    }, ["currentPassword", "newPassword"]),
  },
  {
    name: "fi_request_password_reset",
    description: "Request password reset email",
    inputSchema: buildSchema({
      email: { type: "string", description: "Email address for password reset" },
    }, ["email"]),
  },
  {
    name: "fi_complete_password_reset",
    description: "Complete password reset using key from email",
    inputSchema: buildSchema({
      key: { type: "string", description: "Reset key from email" },
      newPassword: { type: "string", description: "New password" },
    }, ["key", "newPassword"]),
  },
];

export const handlers: Record<string, ToolHandler> = {
  async fi_request_auth_token(args, config) {
    const email = asString(args.email, "email", true) as string;
    const password = asString(args.password, "password", true) as string;
    return auth.authenticate(config, email, password);
  },
  async fi_login_user(args, config) {
    const email = asString(args.email, "email", true) as string;
    const password = asString(args.password, "password", true) as string;
    return auth.login(config, email, password);
  },
  async fi_check_session(_args, config) {
    return auth.session(config);
  },
  async fi_register_account(args, config) {
    const payload = asJson(args.registration, "registration", true);
    return auth.register(config, payload);
  },
  async fi_resend_activation_email(args, config) {
    const email = asString(args.email, "email", true) as string;
    return auth.resendActivation(config, email);
  },
  async fi_activate_account(args, config) {
    const key = asString(args.key, "key", true) as string;
    return auth.activate(config, key);
  },
  async fi_get_current_user(_args, config) {
    return auth.whoami(config);
  },
  async fi_update_current_account(args, config) {
    const payload = asJson(args.user, "user", true);
    return auth.updateAccount(config, payload);
  },
  async fi_change_password(args, config) {
    const currentPassword = asString(args.currentPassword, "currentPassword", true) as string;
    const newPassword = asString(args.newPassword, "newPassword", true) as string;
    return auth.changePassword(config, currentPassword, newPassword);
  },
  async fi_request_password_reset(args, config) {
    const email = asString(args.email, "email", true) as string;
    return auth.resetPasswordInit(config, email);
  },
  async fi_complete_password_reset(args, config) {
    const key = asString(args.key, "key", true) as string;
    const newPassword = asString(args.newPassword, "newPassword", true) as string;
    return auth.resetPasswordFinish(config, key, newPassword);
  },
};
