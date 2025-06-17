import { projectVariants } from "@/constants/shared-component-styles";
import { cva, VariantProps } from "class-variance-authority";

const { width, margin, padding, gap } = projectVariants;

const styles = cva("whitespace-normal", {
  variants: {
    padding,
    as: {
      div: "py-1 text-slate-700 dark:text-slate-200",
      p: "py-1 text-slate-700 dark:text-slate-200",
      span: "!text-sm text-slate-700 dark:text-slate-200",
      small: "!text-xs text-slate-700 dark:text-slate-200",
      title: "!text-5xl text-slate-600 dark:text-slate-300 font-bold",
      h1: "!text-3xl text-slate-600 dark:text-slate-300 font-bold",
      h2: "!text-2xl text-slate-600 dark:text-slate-300 font-bold",
      h3: "!text-xl text-slate-600 dark:text-slate-300 font-bold",
      h4: "!text-lg text-slate-600 dark:text-slate-300 font-semibold",
      h5: "!text-base text-slate-600 dark:text-slate-300 font-semibold",
      h6: "!text-sm text-slate-600 dark:text-slate-300 font-semibold",
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
      smooth: "!text-gray-400 dark:!text-gray-500",
      faded: "!text-gray-600 dark:!text-gray-400",
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
      xs: "!max-w-xs xl:max-w-max",
      sm: "!max-w-sm xl:max-w-max",
      md: "!max-w-md xl:max-w-max",
      lg: "!max-w-lg xl:max-w-max",
      xl: "!max-w-xl xl:max-w-max",
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
