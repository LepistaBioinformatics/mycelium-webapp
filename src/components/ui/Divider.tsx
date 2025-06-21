import { cva, VariantProps } from "class-variance-authority";

const styles = cva("w-full", {
  variants: {
    style: {
      or: "flex items-center justify-between py-2 text-indigo-700 dark:text-lime-700",
      invisible: "border-0",
      smooth: "opacity-30",
      partial:
        "w-48 mx-auto border-0 rounded-sm bg-indigo-300 dark:bg-lime-700",
    },
    thickness: {
      sm: "h-0.5",
      md: "h-1",
      lg: "h-2",
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
    thickness: "md",
    style: "partial",
  },
});

interface Props extends BaseProps, VariantProps<typeof styles> {
  orText?: string;
}

export default function Divider({
  style,
  orText,
  marginY,
  thickness,
  ...props
}: Props) {
  if (style === "or") {
    return (
      <div className={styles({ style, marginY, thickness })} {...props}>
        <hr className="w-full" />
        <span className="px-2 uppercase">{orText || "or"}</span>
        <hr className="w-full" />
      </div>
    );
  }

  return <hr className={styles({ style, thickness })} {...props} />;
}
