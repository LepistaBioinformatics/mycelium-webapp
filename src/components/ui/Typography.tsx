import { projectVariants } from "@/constants/shared-component-styles";
import { cva, VariantProps } from "class-variance-authority";

const { width, margin, padding } = projectVariants;

const styles = cva("text-start", {
  variants: {
    padding,
    as: {
      div: "py-1 text-slate-700 dark:text-slate-200",
      p: "py-1 text-slate-700 dark:text-slate-200",
      span: "text-sm text-slate-700 dark:text-slate-200",
      small: "text-xs text-slate-700 dark:text-slate-200",
      title: "text-5xl text-slate-600 dark:text-slate-300 font-bold",
      h1: "text-3xl text-slate-600 dark:text-slate-300 font-bold",
      h2: "text-2xl text-slate-600 dark:text-slate-300 font-bold",
      h3: "text-xl text-slate-600 dark:text-slate-300 font-bold",
      h4: "text-lg text-slate-600 dark:text-slate-300 font-semibold",
      h5: "text-base text-slate-600 dark:text-slate-300 font-semibold",
      h6: "text-sm text-slate-600 dark:text-slate-300 font-semibold",
    },
    highlight: {
      true: "!text-blue-500 dark:!text-lime-500",
    },
    isError: {
      true: "!text-red-500 !dark:text-red-500",
    },
    decoration: {
      underline: "underline",
      lineThrough: "line-through",
      smooth: "!text-gray-500 dark:!text-gray-500",
      faded: "!text-gray-600 dark:!text-gray-400",
      none: "",
    },
    margin: {
      ...margin,
      auto: "mx-auto",
    },
    reverseBackground: {
      true: "!text-gray-100 !dark:text-gray-200",
    },
    width: {
      ...width,
      xxs: "!max-w-[15rem]",
      xs: "!max-w-xs",
      sm: "!max-w-sm",
      md: "!max-w-md",
      lg: "!max-w-lg",
      xl: "!max-w-xl",
    },
    uppercase: {
      true: "uppercase",
    },
    center: {
      true: "text-center",
    },
    truncate: {
      true: "truncate",
    },
    nowrap: {
      true: "whitespace-nowrap",
    },
    title: {
      true: "hover:cursor-help",
    }
  },
  defaultVariants: {
    as: "p",
    margin: "none",
    padding: "none",
    reverseBackground: false,
    width: "fit",
    uppercase: false,
    highlight: false,
  },
});

interface Props extends BaseProps, VariantProps<typeof styles> {
  title?: string | any;
}

export default function Typography({
  as,
  margin,
  padding,
  reverseBackground,
  width,
  uppercase,
  decoration,
  highlight,
  isError,
  center,
  truncate,
  nowrap,
  title,
  ...props
}: Props) {
  const Element = (as === "title" ? "h1" : as) || "p";

  return (
    <Element
      title={title}
      className={styles({
        as,
        margin,
        padding,
        reverseBackground,
        width,
        uppercase,
        decoration,
        highlight,
        isError,
        center,
        truncate,
        nowrap,
        title: title ? true : false
      })}
      {...props}
    />
  );
}
