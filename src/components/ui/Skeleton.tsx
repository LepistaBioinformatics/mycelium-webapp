import { cva, VariantProps } from "class-variance-authority";
import { useTranslation } from "react-i18next";

// ? ---------------------------------------------------------------------------
// ? Skeleton — placeholder shapes shown while data loads, so a screen keeps
// ? its layout instead of rendering blank areas, "Loading..." text or wrong
// ? empty states. Compose the shape of the content that is about to appear.
// ? ---------------------------------------------------------------------------

const blockStyles = cva("animate-pulse bg-zinc-200 dark:bg-surface-800", {
  variants: {
    shape: {
      line: "h-3 rounded",
      title: "h-6 rounded",
      block: "rounded-lg",
      circle: "rounded-full",
    },
  },
  defaultVariants: { shape: "line" },
});

interface BlockProps extends VariantProps<typeof blockStyles> {
  /** Size and spacing utilities, e.g. `w-1/2`, `h-10 w-10`. */
  className?: string;
}

/** A single placeholder shape. */
function Skeleton({ shape, className }: BlockProps) {
  return (
    <span
      aria-hidden="true"
      className={`block ${blockStyles({ shape })} ${className ?? ""}`}
    />
  );
}

/** Announces the loading state once for a group of placeholder shapes. */
function Status({ children, className }: BaseProps & { className?: string }) {
  const { t } = useTranslation();

  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">{t("components.Skeleton.loading")}</span>
      {children}
    </div>
  );
}

const LINE_WIDTHS = ["w-2/3", "w-1/2", "w-3/4", "w-2/5"];

/** Rows shaped like `ListItem`: a title line plus a few `prefix: value` lines. */
function ListRows({ count = 5, lines = 2 }: { count?: number; lines?: number }) {
  return (
    <Status className="flex flex-col gap-4 w-full">
      {Array.from({ length: count }, (_, row) => (
        <div
          key={row}
          className={`flex flex-col gap-2 border border-l-4 border-zinc-200 dark:border-surface-800 px-4 py-3 mx-auto w-full xl:max-w-4xl ${
            row % 2 === 0
              ? "bg-white dark:bg-surface-950"
              : "bg-zinc-50 dark:bg-surface-900"
          }`}
        >
          <Skeleton shape="title" className="w-1/3" />
          {Array.from({ length: lines }, (_, line) => (
            <Skeleton
              key={line}
              className={LINE_WIDTHS[(row + line) % LINE_WIDTHS.length]}
            />
          ))}
        </div>
      ))}
    </Status>
  );
}

/** A table: header row plus `rows` x `cols` cells. */
function Table({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <Status className="flex flex-col gap-3 w-full py-2">
      {Array.from({ length: rows + 1 }, (_, row) => (
        <div
          key={row}
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: cols }, (_, col) => (
            <Skeleton
              key={col}
              shape={row === 0 ? "title" : "line"}
              className={row === 0 ? "w-2/3" : LINE_WIDTHS[(row + col) % 4]}
            />
          ))}
        </div>
      ))}
    </Status>
  );
}

/** Label/value pairs, like a details panel or a form. */
function Fields({ count = 4, columns = 1 }: { count?: number; columns?: 1 | 2 }) {
  return (
    <Status
      className={`grid gap-4 w-full ${
        columns === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
      }`}
    >
      {Array.from({ length: count }, (_, field) => (
        <div key={field} className="flex flex-col gap-2">
          <Skeleton className="w-1/4" />
          <Skeleton shape="block" className="h-9 w-full" />
        </div>
      ))}
    </Status>
  );
}

/** A page header: big title plus a few lines. */
function Header({ lines = 2 }: { lines?: number }) {
  return (
    <Status className="flex flex-col gap-3 w-full">
      <Skeleton shape="title" className="h-8 w-1/2" />
      {Array.from({ length: lines }, (_, line) => (
        <Skeleton key={line} className={LINE_WIDTHS[line % 4]} />
      ))}
    </Status>
  );
}

/** A whole dashboard page while its code or first data loads. */
function Page() {
  return (
    <div className="flex flex-col gap-8 w-full p-4 sm:p-8">
      <Header />
      <ListRows count={4} />
    </div>
  );
}

Skeleton.Status = Status;
Skeleton.ListRows = ListRows;
Skeleton.Table = Table;
Skeleton.Fields = Fields;
Skeleton.Header = Header;
Skeleton.Page = Page;

export default Skeleton;
