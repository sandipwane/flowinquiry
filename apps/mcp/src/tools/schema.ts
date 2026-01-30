export const baseUrlProperty = { type: "string" } as const;

export const paginationProperties = {
  page: { type: "number", default: 1 },
  size: { type: "number", default: 20 },
  sortField: { type: "string" },
  sortDirection: { type: "string", enum: ["asc", "desc"], default: "asc" },
} as const;

export const queryProperty = { type: "object" } as const;

export const jsonProperty = { type: ["object", "array"] } as const;

export function buildSchema(
  properties: Record<string, unknown>,
  required: string[] = [],
): Record<string, unknown> {
  return {
    type: "object",
    properties: {
      ...properties,
      baseUrl: baseUrlProperty,
    },
    required,
    additionalProperties: false,
  };
}
