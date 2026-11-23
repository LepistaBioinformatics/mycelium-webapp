import LoadMore from "@/components/ui/LoadMore";
import Skeleton from "@/components/ui/Skeleton";

interface Props extends BaseProps {
  isLoading: boolean;
  loaded: number;
  total: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

/** A list whose pages accumulate with a "Load more" button at the end */
export default function PaginatedContent({
  children,
  isLoading,
  loaded,
  total,
  hasMore,
  isLoadingMore,
  onLoadMore,
}: Props) {
  if (isLoading) return <Skeleton.ListRows />;

  return (
    <div id="PaginatedContent" className="flex flex-col gap-4 w-full mb-24">
      {children}

      <LoadMore
        loaded={loaded}
        total={total}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={onLoadMore}
      />
    </div>
  );
}
