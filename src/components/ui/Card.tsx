import { cva, VariantProps } from "class-variance-authority";

// ? ---------------------------------------------------------------------------
// ? Card Container
// ? ---------------------------------------------------------------------------

const cardContainerStyles = cva("border-2 dark:border-indigo-900 shadow rounded-lg text-gray-500 bg-white dark:bg-slate-800 overflow-auto scrollbar", {
  variants: {
    height: {
      full: "h-full",
      min: "h-min",
      max: "h-max"
    },
    width: {
      full: "w-full",
      sm: "!w-sm w-max",
      md: "!w-md w-max",
      lg: "!w-lg w-max",
      xl: "!w-xl w-max",
      "2xl": "!w-2xl w-max",
      "3xl": "!w-3xl w-max",
      "4xl": "!w-4xl w-max",
      "5xl": "!w-5xl w-max",
      "6xl": "!w-6xl w-max",
    },
    padding: {
      none: "p-0",
      xs: "p-1",
      sm: "p-2",
      md: "p-5",
      lg: "p-8",
      xl: "p-10",
      "2xl": "p-16",
    },
    flex: {
      col: "flex flex-col",
      row: "flex flex-row",
      none: ""
    }
  },
  defaultVariants: {
    height: "full",
    width: "md",
    padding: "md",
    flex: "none"
  }
});

interface CardContainerProps extends BaseProps, VariantProps<typeof cardContainerStyles> { }

function CardContainer({ height, width, padding, flex, ...props }: CardContainerProps) {
  return (
    <div
      className={cardContainerStyles({ height, width, padding, flex })}
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

interface BodyCardProps extends BaseProps, VariantProps<typeof bodyStyles> { }

function Body({ flex, gap, justify, width, align, ...props }: BodyCardProps) {
  return <div className={bodyStyles({ flex, gap, justify, width, align })} {...props} />;
}

// ? ---------------------------------------------------------------------------
// ? Composite Container
// ? ---------------------------------------------------------------------------

const Card = Object.assign(CardContainer, { Header, Body });

export default Card;
