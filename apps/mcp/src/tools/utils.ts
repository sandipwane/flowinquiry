import type { Pagination, QueryDTO } from "../../../cli/src/types";
import { asNumber, asOptionalObject, asSortDirection, asString } from "../validation";

export function buildPagination(args: Record<string, unknown>): Pagination {
  const page = asNumber(args.page, "page") ?? 1;
  const size = asNumber(args.size, "size") ?? 20;
  const sortField = asString(args.sortField, "sortField");
  const sortDirection = asSortDirection(args.sortDirection) ?? "asc";

  return {
    page,
    size,
    sort: sortField
      ? [{ field: sortField, direction: sortDirection }]
      : undefined,
  };
}

export function buildQuery(args: Record<string, unknown>): QueryDTO {
  const query = asOptionalObject(args.query, "query") ?? { filters: [] };
  return query as QueryDTO;
}
