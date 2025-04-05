import { cva, VariantProps } from "class-variance-authority";
import { projectVariants, projectDefaultVariants } from "@/constants/shared-component-styles";
import { ComponentProps } from "react";

const { width, height, padding, margin } = projectVariants;

// ? ---------------------------------------------------------------------------
// ? Card Container
// ? ---------------------------------------------------------------------------

const cardContainerStyles = cva("border border-blue-200 dark:border-indigo-900 shadow rounded-lg text-gray-500 bg-white dark:bg-slate-800 overflow-auto scrollbar h-min", {
  variants: {
    height,
    padding,
    margin,
    maxHeight: {
      "90vh": "max-h-[90vh] xl:max-h-[90vh]",
      "80vh": "max-h-[80vh] xl:max-h-[80vh]",
      "70vh": "max-h-[70vh] xl:max-h-[70vh]",
      "60vh": "max-h-[60vh] xl:max-h-[60vh]",
      "50vh": "max-h-[50vh] xl:max-h-[50vh]",
      "40vh": "max-h-[40vh] xl:max-h-[40vh]",
      "30vh": "max-h-[30vh] xl:max-h-[30vh]",
      "20vh": "max-h-[20vh] xl:max-h-[20vh]",
    },
    minHeight: {
      "90vh": "min-h-[90vh] xl:min-h-[90vh]",
      "80vh": "min-h-[80vh] xl:min-h-[80vh]",
      "70vh": "min-h-[70vh] xl:min-h-[70vh]",
      "60vh": "min-h-[60vh] xl:min-h-[60vh]",
      "50vh": "min-h-[50vh] xl:min-h-[50vh]",
      "40vh": "min-h-[40vh] xl:min-h-[40vh]",
      "30vh": "min-h-[30vh] xl:min-h-[30vh]",
      "20vh": "min-h-[20vh] xl:min-h-[20vh]",
    },
    textAlign: {
      left: "text-left",
      center: "text-center",
      right: "text-right"
    },
    width: {
      ...width,
      sm: "!w-sm w-max",
      md: "!w-md w-max",
      lg: "!w-lg w-max",
      xl: "!w-xl w-max",
      "2xl": "!max-w-2xl min-w-max",
      "3xl": "!max-w-3xl min-w-max",
      "4xl": "!max-w-4xl min-w-max",
      "5xl": "!max-w-5xl min-w-max",
      "6xl": "!max-w-6xl min-w-max",
    },
    dashed: {
      true: "border-dashed",
      false: ""
    },
    flex1: {
      true: "flex-1",
      false: ""
    },
    flex: {
      col: "flex flex-col",
      row: "flex flex-row",
      none: ""
    },
    group: {
      true: "group",
    }
  },
  defaultVariants: {
    ...projectDefaultVariants,
    width: "md",
    padding: "md",
    textAlign: "left",
    group: false
  }
});

interface CardContainerProps extends BaseProps, VariantProps<typeof cardContainerStyles> { }

function CardContainer({ height, minHeight, maxHeight, width, padding, flex, textAlign, dashed, flex1, group, ...props }: CardContainerProps) {
  return (
    <div
      className={cardContainerStyles({ height, minHeight, maxHeight, width, padding, flex, textAlign, dashed, flex1, group })}
      {...props}
    />
  );
}

// ? ---------------------------------------------------------------------------
// ? Header Container
// ? ---------------------------------------------------------------------------

const headerStyles = cva("text-xl text-gray-800 dark:text-gray-100 py-3", {
  variants: {}
});

interface HeaderCardProps extends BaseProps, VariantProps<typeof headerStyles> { }

function Header({ ...props }: HeaderCardProps) {
  return <div className={headerStyles({})} {...props} />;
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
      none: ""
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
      around: "justify-around"
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
    },
    width: {
      full: "w-full",
      min: "w-min",
      max: "w-max"
    }
  },
  defaultVariants: {
    flex: "none",
    justify: "start",
    width: "full",
    align: "start"
  }
});

interface BodyCardProps extends
  BaseProps,
  ComponentProps<"div">,
  VariantProps<typeof bodyStyles> { }

function Body({ flex, gap, justify, width, align, ...props }: BodyCardProps) {
  return <div className={bodyStyles({ flex, gap, justify, width, align })} {...props} />;
}

// ? ---------------------------------------------------------------------------
// ? Composite Container
// ? ---------------------------------------------------------------------------

const Card = Object.assign(CardContainer, { Header, Body });

export default Card;
