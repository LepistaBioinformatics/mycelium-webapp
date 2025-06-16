import { cva, VariantProps } from "class-variance-authority";
import { FaRegCopy } from "react-icons/fa6";

const styles = cva("px-1 hover:cursor-pointer", {
  variants: {
    /**
     * If true, the button will be hidden and only shown on hover
     */
    hidden: {
      true: "hidden group-hover/clip:block",
    },
    groupHidden: {
      true: "opacity-0 group-hover/clip:opacity-100 transition-opacity duration-300",
    },
    inline: {
      true: "inline-block mt-1",
    },
    size: {
      xs: "text-xs",
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
      xl: "text-xl",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

interface Props extends VariantProps<typeof styles> {
  text: string;
}

export default function CopyToClipboard({
  text,
  hidden,
  groupHidden,
  inline,
  size,
}: Props) {
  return (
    <div className={styles({ hidden, groupHidden, inline, size })}>
      <button
        title="Click to copy to clipboard"
        className="text-zinc-500 hover:text-zinc-700 hover:dark:text-zinc-300 group-hover:text-blue-500 dark:group-hover:text-lime-400 group-hover/clip:text-blue-500 dark:group-hover/clip:text-lime-400 focus:outline-none focus:rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-lime-400 p-1 -mt-2 focus:animate-pulse rounded-md"
        onClick={() => navigator.clipboard.writeText(text)}
      >
        <FaRegCopy />
      </button>
    </div>
  );
}
