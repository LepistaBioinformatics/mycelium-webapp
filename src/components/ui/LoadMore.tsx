import { ChevronDown, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { buttonStyles } from "./button-styles";

interface Props {
  loaded: number;
  total: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

/** "Showing N of M" and a button that appends the next page */
export default function LoadMore({
  loaded,
  total,
  hasMore,
  isLoadingMore,
  onLoadMore,
}: Props) {
  const { t } = useTranslation();

  if (loaded === 0) return null;

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <span className="text-xs text-muted-foreground">
        {t("components.LoadMore.showing", { loaded, total: Math.max(total, loaded) })}
      </span>
      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={isLoadingMore}
          className={`${buttonStyles({ intent: "secondary", size: "sm" })} rounded-full px-5`}
        >
          {isLoadingMore ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ChevronDown className="size-4" />
          )}
          {isLoadingMore ? t("components.LoadMore.loading") : t("components.LoadMore.button")}
        </button>
      )}
    </div>
  );
}
