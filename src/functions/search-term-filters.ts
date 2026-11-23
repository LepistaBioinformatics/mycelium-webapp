// A search term mixes filter tokens with free text, e.g.
// "/subscription status:failed acme". Filters are `/command` or `key:value`
// tokens; everything else is the free-text query.

const FILTER_TOKEN = /^(\/[A-Za-z][\w-]*|[A-Za-z][\w-]*:\S+)$/;

export interface ParsedSearchTerm {
  filters: string[];
  text: string;
}

export function parseSearchTerm(term: string | null | undefined): ParsedSearchTerm {
  const tokens = (term ?? "").split(/\s+/).filter(Boolean);

  return {
    filters: tokens.filter((token) => FILTER_TOKEN.test(token)),
    text: tokens.filter((token) => !FILTER_TOKEN.test(token)).join(" "),
  };
}

export function composeSearchTerm(filters: string[], text: string): string {
  return [...filters, text.trim()].filter(Boolean).join(" ");
}

/**
 * Add `command` to the term, replacing any filter of the same group (e.g. one
 * account type replaces another) and keeping the other filters and the text.
 */
export function replaceSearchFilter(
  term: string | null | undefined,
  command: string,
  sameGroup: string[]
): string {
  const { filters, text } = parseSearchTerm(term);
  const kept = filters.filter((filter) => !sameGroup.includes(filter));

  return composeSearchTerm([...kept, command], text);
}

/** Human label for a filter chip: "/tenantManager" → "Tenant manager". */
export function searchFilterLabel(filter: string): string {
  const humanize = (value: string) => {
    const spaced = value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[-_]/g, " ");
    return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
  };

  if (filter.startsWith("/")) return humanize(filter.slice(1));

  const separator = filter.indexOf(":");
  return `${humanize(filter.slice(0, separator))}: ${filter.slice(separator + 1)}`;
}
