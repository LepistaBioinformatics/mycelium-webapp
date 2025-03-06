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

  const showPreviousPageButton = useMemo(() => {
    if (skip === 0) return true;
    return false;
  }, [skip]);

  const showNextPageButton = useMemo(() => {
    if (!records) return false;
    if (records.skip + records.size >= records.count) return false;

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
    <div className="flex justify-between mx-auto w-full xl:max-w-4xl z-1">
      <Button fullWidth onClick={previousPage} size="sm" rounded="full" intent="link" disabled={showPreviousPageButton}>
        Previous
      </Button>

      <div className="flex gap-4 justify-center mx-auto w-full xl:max-w-4xl">
        <div>
          <Typography center as="span">
            {records?.count ?? 0} records found
          </Typography>
        </div>
      </div>

      <Button fullWidth onClick={nextPage} size="sm" rounded="full" intent="link" disabled={!showNextPageButton}>
        Next
      </Button>
    </div>
  );
}
