import { cva, VariantProps } from "class-variance-authority";
import {
  projectVariants,
  projectDefaultVariants,
} from "@/constants/shared-component-styles";
import { ComponentProps } from "react";

const { width, height, padding, margin } = projectVariants;

// ? ---------------------------------------------------------------------------
// ? Card Container
// ? ---------------------------------------------------------------------------

const cardContainerStyles = cva(
  "border border-blue-200 dark:border-indigo-900 shadow rounded-lg text-gray-500 bg-white dark:bg-zinc-800 dark:bg-opacity-50 overflow-auto scrollbar",
  {
    variants: {
      height,
      padding,
      margin,
      textAlign: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
      },
      width: {
        ...width,
        full: "w-full lg:w-1/4",
      },
      dashed: {
        true: "border-dashed",
        false: "",
      },
      flex1: {
        true: "flex-none sm:flex-1",
        false: "",
      },
      flex: {
        col: "flex flex-col",
        row: "flex flex-row",
        none: "",
      },
      group: {
        true: "group",
      },
    },
    defaultVariants: {
      ...projectDefaultVariants,
      width: "md",
      padding: "md",
      textAlign: "left",
      group: false,
    },
  }
);

interface CardContainerProps
  extends BaseProps,
    VariantProps<typeof cardContainerStyles> {}

function CardContainer({
  height,
  width,
  padding,
  flex,
  textAlign,
  dashed,
  flex1,
  group,
  ...props
}: CardContainerProps) {
  return (
    <div
      id="CardContainer"
      className={cardContainerStyles({
        height,
        width,
        padding,
        flex,
        textAlign,
        dashed,
        flex1,
        group,
      })}
      {...props}
    />
  );
}

// ? ---------------------------------------------------------------------------
// ? Header Container
// ? ---------------------------------------------------------------------------

const headerStyles = cva("text-xl text-gray-800 dark:text-gray-100 py-3", {
  variants: {},
});

interface HeaderCardProps
  extends BaseProps,
    VariantProps<typeof headerStyles> {}

function Header({ ...props }: HeaderCardProps) {
  return <div id="CardHeader" className={headerStyles({})} {...props} />;
}

// ? ---------------------------------------------------------------------------
// ? Body Container
// ? ---------------------------------------------------------------------------

const bodyStyles = cva("py-2 text-gray-700 dark:text-gray-300 scrollbar", {
  variants: {
    flex: {
      col: "flex flex-col",
      row: "flex flex-row",
      center: "flex justify-center items-center",
      around: "flex justify-around items-around",
      between: "flex justify-between items-between",
      start: "flex justify-start items-start",
      end: "flex justify-end items-end",
      none: "",
    },
    gap: {
      1: "gap-1",
      2: "gap-2",
      3: "gap-3",
      4: "gap-4",
      8: "gap-8",
      16: "gap-16",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
    },
    width: {
      full: "w-full",
      min: "w-min",
      max: "w-max",
    },
  },
  defaultVariants: {
    flex: "none",
    justify: "start",
    width: "full",
    align: "start",
  },
});

interface BodyCardProps
  extends BaseProps,
    ComponentProps<"div">,
    VariantProps<typeof bodyStyles> {}

function Body({ flex, gap, justify, width, align, ...props }: BodyCardProps) {
  return (
    <div
      id="CardBody"
      className={bodyStyles({ flex, gap, justify, width, align })}
      {...props}
    />
  );
}

// ? ---------------------------------------------------------------------------
// ? Composite Container
// ? ---------------------------------------------------------------------------

const Card = Object.assign(CardContainer, { Header, Body });

export default Card;
