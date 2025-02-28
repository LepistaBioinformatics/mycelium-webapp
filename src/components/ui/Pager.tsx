import PaginatedRecords from "@/types/PaginatedRecords";
import { useMemo } from "react";
import Button from "./Button";
import Typography from "./Typography";

export interface PagerProps {
  mutation: (records: PaginatedRecords<any>, options?: any) => void;
  records: PaginatedRecords<any> | undefined;
  skip: number;
  setSkip: (skip: number) => void;
  pageSize: number;
}

export default function Pager({
  records,
  mutation,
  skip,
  setSkip,
  pageSize,
}: PagerProps) {
  const hasMore = useMemo(() => {
    if (!records) return false;

    if (records?.count && records?.count <= records?.records?.length) return false;
    if (records?.records?.length && records?.records?.length < records?.skip) return false;

    return true;
  }, [records]);

  const showPageButtons = useMemo(() => {
    if (!records) return false;
    if (records?.count === 0) return false;
    if (records?.count < pageSize) return false;
    if (records?.records?.length === 0) return false;
    return true;
  }, [records]);

  const nextPage = () => {
    if (hasMore && records) {
      setSkip(skip + pageSize);
      mutation(records, { rollbackOnError: true });
    };
  }

  const previousPage = () => {
    if (skip > 0 && records) {
      setSkip(skip - pageSize);
      mutation(records, { rollbackOnError: true });
    }
  }

  if (records?.count === 0 || !records?.records) return null;

  return (
    <div className="flex justify-between mx-auto w-full xl:max-w-4xl">
      {showPageButtons && (
        <Button fullWidth onClick={previousPage} size="sm" rounded="full" intent="link" disabled={skip === 0}>
          Previous
        </Button>
      )}

      <div className="flex gap-4 justify-center mx-auto w-full xl:max-w-4xl">
        <div className="w-full">
          <Typography as="span">{records?.count ?? 0} records found</Typography>
        </div>
      </div>

      {showPageButtons && (
        <Button fullWidth onClick={nextPage} size="sm" rounded="full" intent="link" disabled={!hasMore}>
          Next
        </Button>
      )}
    </div>
  );
}
