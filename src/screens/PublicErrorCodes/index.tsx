import AppHeader from "@/components/ui/AppHeader";
import CopyToClipboard from "@/components/ui/CopyToClipboard";
import LoadMore from "@/components/ui/LoadMore";
import SearchBar from "@/components/ui/SearchBar";
import Skeleton from "@/components/ui/Skeleton";
import Typography from "@/components/ui/Typography";
import useLoadMore from "@/hooks/use-load-more";
import {
  formatErrorCodeId,
  parseErrorCodeSearch,
} from "@/functions/parse-error-code-search";
import { components } from "@/services/openapi/mycelium-schema";
import { listPublicErrorCodes } from "@/services/public-error-codes";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

type ErrorCode = components["schemas"]["ErrorCode"];

const PREFIX = "screens.PublicErrorCodes";
const PAGE_SIZE = 20;

/** Public (signed-out) lookup of the gateway's non-internal error codes */
export default function PublicErrorCodes() {
  const { t } = useTranslation();
  const [term, setTerm] = useState("");

  const search = parseErrorCodeSearch(term);

  const errorCodes = useLoadMore<ErrorCode>({
    baseKey: ["public-error-codes", search.prefix, search.code],
    pageSize: PAGE_SIZE,
    fetchPage: (skip, pageSize) =>
      listPublicErrorCodes({
        prefix: search.prefix,
        code: search.code,
        pageSize,
        skip,
      }),
    // The page had no background refresh before the migration
    refreshInterval: 0,
  });

  const { error, isLoading, records } = errorCodes;

  const handleSearch = (value?: string) => {
    setTerm(value ?? "");
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader discrete logout={() => undefined} />

      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 pb-24 pt-24 sm:px-6">
        <Link
          to="/"
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {t(`${PREFIX}.back`)}
        </Link>

        <div className="flex flex-col gap-2">
          <Typography as="h1">{t(`${PREFIX}.title`)}</Typography>
          <Typography decoration="smooth">{t(`${PREFIX}.description`)}</Typography>
        </div>

        <SearchBar
          term={term}
          onSubmit={handleSearch}
          placeholder={t(`${PREFIX}.searchPlaceholder`)}
          sticky={false}
          fullWidth
        />

        {isLoading && <Skeleton.ListRows count={4} lines={2} />}

        {error && <Notice text={t(`${PREFIX}.unavailable`)} />}

        {!isLoading && !error && records.length === 0 && (
          <Notice text={t(`${PREFIX}.empty`)} />
        )}

        {records.length > 0 && (
          <ul className="flex flex-col gap-3">
            {records.map((errorCode) => (
              <ErrorCodeItem
                key={`${errorCode.prefix}-${errorCode.errorNumber}`}
                errorCode={errorCode}
              />
            ))}
          </ul>
        )}

        <LoadMore
          loaded={records.length}
          total={errorCodes.count}
          hasMore={errorCodes.hasMore}
          isLoadingMore={errorCodes.isLoadingMore}
          onLoadMore={errorCodes.loadMore}
        />
      </main>
    </div>
  );
}

function ErrorCodeItem({ errorCode }: { errorCode: ErrorCode }) {
  const id =
    errorCode.code || formatErrorCodeId(errorCode.prefix, errorCode.errorNumber);

  return (
    <li className="flex flex-col gap-2 rounded-xl border border-border bg-card px-5 py-4 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1 rounded-md border border-brand-200 bg-brand-50 px-2 py-0.5 font-mono text-sm text-brand-800 dark:border-brand-700 dark:bg-brand-900/50 dark:text-brand-100">
          {id}
          <CopyToClipboard text={id} inline size="sm" />
        </span>
      </div>
      <span className="font-medium text-foreground">{errorCode.message}</span>
      {errorCode.details && (
        <span className="whitespace-pre-line text-sm text-muted-foreground">
          {errorCode.details}
        </span>
      )}
    </li>
  );
}

function Notice({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
