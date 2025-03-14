import { cva, VariantProps } from "class-variance-authority";
import { FaRegCopy } from "react-icons/fa6";

const styles = cva("px-1", {
  variants: {
    /**
     * If true, the button will be hidden and only shown on hover
     */
    hidden: {
      true: "hidden hover:block hover:text-blue-500 dark:hover:text-lime-400",
    },
    groupHidden: {
      true: "hidden group-hover:block",
    },
    inline: {
      true: "inline-block mt-1 hover:cursor-pointer",
    },
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

interface Props extends VariantProps<typeof styles> {
  text: string;
}

export default function CopyToClipboard({ text, hidden, groupHidden, inline, size }: Props) {
  return (
    <div className={styles({ hidden, groupHidden, inline, size })}>
      <button
        title="Click to copy to clipboard"
        className="text-slate-500 hover:text-slate-700 hover:dark:text-slate-300  group-hover:text-blue-500 dark:group-hover:text-lime-400"
        onClick={() => navigator.clipboard.writeText(text)}
      >
        <FaRegCopy />
      </button>
    </div>
  );
}
