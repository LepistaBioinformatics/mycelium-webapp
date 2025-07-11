import { projectVariants } from "@/constants/shared-component-styles";
import { cva, VariantProps } from "class-variance-authority";

const { width, margin, padding, gap } = projectVariants;

const styles = cva("whitespace-normal", {
  variants: {
    padding,
    as: {
      div: "py-1 text-zinc-700 dark:text-zinc-200",
      p: "py-1 text-zinc-700 dark:text-zinc-200",
      span: "!text-sm text-zinc-700 dark:text-zinc-200",
      small: "!text-xs text-zinc-700 dark:text-zinc-200",
      title: "!text-5xl text-zinc-600 dark:text-zinc-300 font-bold",
      h1: "!text-3xl text-zinc-600 dark:text-zinc-300 font-bold",
      h2: "!text-2xl text-zinc-600 dark:text-zinc-300 font-bold",
      h3: "!text-xl text-zinc-600 dark:text-zinc-300 font-bold",
      h4: "!text-lg text-zinc-600 dark:text-zinc-300 font-semibold",
      h5: "!text-base text-zinc-600 dark:text-zinc-300 font-semibold",
      h6: "!text-sm text-zinc-600 dark:text-zinc-300 font-semibold",
    },
    highlight: {
      true: "!text-indigo-500 dark:!text-lime-500",
    },
    isError: {
      true: "!text-red-500 !dark:text-red-500",
    },
    decoration: {
      underline: "underline",
      lineThrough: "line-through",
      smooth: "!text-gray-400 dark:!text-gray-500",
      faded: "font-thin text-gray-600 dark:!text-gray-400",
      bold: "!font-bold",
      semibold: "!font-semibold",
      italic: "!font-italic",
      normal: "!font-normal",
      medium: "!font-medium",
      light: "!font-light",
      thin: "!font-thin",
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
      fit: "max-w-full truncate",
      xxs: "!max-w-[15rem] !xl:max-w-[30rem] xl:max-w-max",
      xs: "w-full sm:!min-w-xs sm:!max-w-xs",
      sm: "w-full sm:!min-w-sm sm:!max-w-sm",
      md: "w-full sm:!min-w-md sm:!max-w-md",
      lg: "w-full sm:!min-w-lg sm:!max-w-lg",
      xl: "w-full sm:!min-w-xl sm:!max-w-xl",
    },
    uppercase: {
      true: "uppercase",
    },
    center: {
      true: "text-center",
      false: "text-start",
    },
    truncate: {
      true: "truncate",
    },
    overflowX: {
      true: "overflow-x-auto",
      visible: "overflow-x-visible",
      false: "overflow-x-hidden",
    },
    overflowY: {
      true: "overflow-y-auto",
      visible: "overflow-y-visible",
      false: "overflow-y-hidden",
    },
    nowrap: {
      true: "whitespace-nowrap",
      false: "whitespace-normal",
    },
    title: {
      true: "hover:cursor-help",
    },
    group: {
      true: "group",
    },
    flex: {
      true: "flex",
      false: "inline",
      row: "flex-row",
      col: "flex-col",
    },
    gap: {
      ...gap,
    },
  },
  defaultVariants: {
    as: "p",
    center: false,
    margin: "none",
    padding: "none",
    reverseBackground: false,
    width: "fit",
    uppercase: false,
    highlight: false,
    group: false,
  },
});

interface Props extends BaseProps, VariantProps<typeof styles> {
  title?: string | any;
  alternativeColor?: string;
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
  alternativeColor,
  group,
  flex,
  gap,
  overflowX,
  overflowY,
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
        group,
        flex,
        gap,
        overflowX,
        overflowY,
        title: title ? true : false,
      })}
      style={{
        color: alternativeColor,
      }}
      {...props}
    />
  );
}
