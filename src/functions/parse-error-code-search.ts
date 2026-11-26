export interface ErrorCodeSearch {
  prefix?: string;
  code?: number;
}

/**
 * Read an error code search: letters are the prefix, digits the number.
 * "MYC00023", "myc 23", "MYC" and "23" all work.
 */
export function parseErrorCodeSearch(term: string | null | undefined): ErrorCodeSearch {
  const compact = (term ?? "").replace(/\s+/g, "");
  const match = compact.match(/^([A-Za-z]*)(\d*)$/);

  if (!match) return {};

  const [, letters = "", digits = ""] = match;

  return {
    prefix: letters ? letters.toUpperCase() : undefined,
    code: digits ? Number.parseInt(digits, 10) : undefined,
  };
}

/** "MYC" + 23 → "MYC00023" (the gateway's own code format). */
export function formatErrorCodeId(prefix: string, errorNumber: number): string {
  return `${prefix}${String(errorNumber).padStart(5, "0")}`;
}
