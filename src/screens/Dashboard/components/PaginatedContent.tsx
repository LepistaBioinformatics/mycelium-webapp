import Pager, { PagerProps } from "@/components/ui/Pager";
import Typography from "@/components/ui/Typography";

interface Props extends BaseProps, PagerProps {
  isLoading: boolean;
}

export default function PaginatedContent({
  children,
  isLoading,
  records,
  ...props
}: Props) {
  if (!isLoading && !records) return null;

  return (
    <div id="PaginatedContent">
      {isLoading ? (
        <div className="flex gap-4 justify-center mx-auto w-full xl:max-w-4xl items-start">
          <Typography>Loading...</Typography>
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-full mb-24">
          <Pager {...props} records={records} />

          {children}

          {records?.count && records?.records?.length > 0 ? (
            <Pager {...props} records={records} />
          ) : (
            <></>
          )}
        </div>
      )}
    </div>
  );
}
