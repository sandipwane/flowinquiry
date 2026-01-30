import { request } from "../http";
import { CliConfig } from "../config";
import { PageableResult, Pagination, QueryDTO, UserDTO } from "../types";
import { paginationToParams } from "./helpers";
import { appendFile, appendJsonPart } from "../multipart";

export async function searchUsers(
  config: CliConfig,
  pagination: Pagination,
  query: QueryDTO,
) {
  const params = paginationToParams(pagination);
  return request<PageableResult<UserDTO>>(
    "POST",
    `/api/users/search?${params.toString()}`,
    config,
    query,
  );
}

export async function getUser(config: CliConfig, userId: number) {
  return request<UserDTO>("GET", `/api/users/${userId}`, config);
}

/**
 * HACK/TEMPORARY: Backend user create endpoint ignores password field.
 * Workaround: If password provided, we auto-call reset-password-finish
 * using the resetKey from the created user response.
 * TODO: Remove this once backend supports password in user creation.
 */
export async function createUser(config: CliConfig, payload: unknown) {
  const inputPayload = payload as Record<string, unknown>;

  // Extract password if provided (backend ignores it during creation)
  const password = inputPayload.password as string | undefined;
  const { password: _, ...createPayload } = inputPayload;

  // Create user
  const user = await request<UserDTO>("POST", "/api/users", config, createPayload);

  // Auto-set password via reset flow if password provided and resetKey exists
  if (password && user.resetKey) {
    await request<void>("POST", "/api/account/reset-password/finish", config, {
      key: user.resetKey,
      newPassword: password,
    });
  }

  return user;
}

export async function updateUser(
  config: CliConfig,
  payload: unknown,
  avatarPath?: string,
) {
  const inputPayload = payload as Record<string, unknown>;

  // If id is provided, fetch existing user and merge to preserve required fields
  if (inputPayload.id) {
    const existingUser = await getUser(config, Number(inputPayload.id));
    // Merge: existing fields as base, input payload overwrites
    const mergedPayload = { ...existingUser, ...inputPayload };

    const form = new FormData();
    appendJsonPart(form, "userDTO", mergedPayload);
    if (avatarPath) {
      await appendFile(form, "file", avatarPath);
    }
    return request<UserDTO>("PUT", "/api/users", config, form);
  }

  // No id - send as-is (will likely fail, but let backend validate)
  const form = new FormData();
  appendJsonPart(form, "userDTO", payload);
  if (avatarPath) {
    await appendFile(form, "file", avatarPath);
  }
  return request<UserDTO>("PUT", "/api/users", config, form);
}

export async function deleteUser(config: CliConfig, userId: number) {
  return request<void>("DELETE", `/api/users/${userId}`, config);
}

export async function getUserPermissions(config: CliConfig, userId: number) {
  return request("GET", `/api/users/permissions/${userId}`, config);
}

export async function getDirectReports(config: CliConfig, managerId: number) {
  return request<UserDTO[]>(
    "GET",
    `/api/users/${managerId}/direct-reports`,
    config,
  );
}

export async function getUserHierarchy(config: CliConfig, userId: number) {
  return request("GET", `/api/users/${userId}/hierarchy`, config);
}

export async function getOrgChart(config: CliConfig) {
  return request("GET", "/api/users/orgChart", config);
}

export async function searchUsersByTerm(config: CliConfig, term: string) {
  return request<UserDTO[]>(
    "GET",
    "/api/users/search-by-term",
    config,
    undefined,
    { query: { term } },
  );
}

export async function updateLocale(config: CliConfig, langKey: string) {
  return request<void>("PATCH", "/api/users/locale", config, { langKey });
}
