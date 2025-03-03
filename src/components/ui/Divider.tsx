import { cva, VariantProps } from "class-variance-authority";

const styles = cva("w-full my-1", {
  variants: {
    style: {
      or: "flex items-center justify-between py-2 text-gray-700 dark:text-gray-300",
      invisible: "border-0",
      smooth: "opacity-30",
      partial: "w-48 h-1 mx-auto my-4 bg-gray-100 border-0 rounded-sm bg-slate-300 dark:bg-slate-600",
    },
    marginY: {
      none: "my-0",
      sm: "my-2",
      md: "my-4",
      lg: "my-8",
    },
  },
  defaultVariants: {
    marginY: "md",
  },
});

interface Props extends BaseProps, VariantProps<typeof styles> {
  orText?: string;
}

export default function Divider({ style, orText, marginY, ...props }: Props) {
  if (style === "or") {
    return (
      <div className={styles({ style, marginY })} {...props}>
        <hr className="w-full" />
        <span className="px-2 uppercase">{orText || "or"}</span>
        <hr className="w-full" />
      </div>
    );
  }

  return <hr className={styles({ style })} {...props} />
}
