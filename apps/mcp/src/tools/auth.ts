import * as auth from "../../../cli/src/commands/auth";
import { buildSchema, jsonProperty } from "./schema";
import { asJson, asString } from "../validation";
import type { ToolDefinition, ToolHandler } from "./types";

export const tools: ToolDefinition[] = [
  {
    name: "fi_request_auth_token",
    description: "Authenticate and return JWT token",
    inputSchema: buildSchema({
      email: { type: "string" },
      password: { type: "string" },
    }, ["email", "password"]),
  },
  {
    name: "fi_login_user",
    description: "Login and return user profile",
    inputSchema: buildSchema({
      email: { type: "string" },
      password: { type: "string" },
    }, ["email", "password"]),
  },
  {
    name: "fi_check_session",
    description: "Check authentication session",
    inputSchema: buildSchema({}),
  },
  {
    name: "fi_register_account",
    description: "Register a new account",
    inputSchema: buildSchema({
      json: jsonProperty,
    }, ["json"]),
  },
  {
    name: "fi_resend_activation_email",
    description: "Resend activation email",
    inputSchema: buildSchema({
      email: { type: "string" },
    }, ["email"]),
  },
  {
    name: "fi_activate_account",
    description: "Activate account with key",
    inputSchema: buildSchema({
      key: { type: "string" },
    }, ["key"]),
  },
  {
    name: "fi_get_current_user",
    description: "Return current account",
    inputSchema: buildSchema({}),
  },
  {
    name: "fi_update_current_account",
    description: "Update current account",
    inputSchema: buildSchema({
      json: jsonProperty,
    }, ["json"]),
  },
  {
    name: "fi_change_password",
    description: "Change current password",
    inputSchema: buildSchema({
      currentPassword: { type: "string" },
      newPassword: { type: "string" },
    }, ["currentPassword", "newPassword"]),
  },
  {
    name: "fi_request_password_reset",
    description: "Request password reset email",
    inputSchema: buildSchema({
      email: { type: "string" },
    }, ["email"]),
  },
  {
    name: "fi_complete_password_reset",
    description: "Complete password reset",
    inputSchema: buildSchema({
      key: { type: "string" },
      newPassword: { type: "string" },
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
    const payload = asJson(args.json, "json", true);
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
    const payload = asJson(args.json, "json", true);
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
