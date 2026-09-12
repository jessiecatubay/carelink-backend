import { Request } from "express";

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export function parsePagination(
  query: Request["query"],
): PaginationParams | { error: string } {
  const page = query.page === undefined ? 1 : parseInteger(query.page);
  const limit = query.limit === undefined ? 20 : parseInteger(query.limit);

  if (page === null || page < 1) {
    return { error: "page must be an integer greater than or equal to 1" };
  }

  if (limit === null || limit < 1 || limit > 100) {
    return { error: "limit must be an integer between 1 and 100" };
  }

  return { page, limit, skip: (page - 1) * limit };
}

function parseInteger(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isInteger(value) ? value : null;
  }

  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}
