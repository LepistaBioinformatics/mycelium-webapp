import { cva, VariantProps } from "class-variance-authority";

const containerStyles = cva("", {
  variants: {
    open: {
      true: "open",
      false: "closed",
    },
    centralized: {
      true: "w-full xl:max-w-4xl mx-auto",
      false: "",
    },
  },
  defaultVariants: {
    open: false,
    centralized: true,
  },
});

type State = "open" | "closed";

interface ContainerProps
  extends BaseProps,
    VariantProps<typeof containerStyles> {
  onToggle?: (state: State) => void;
}

function Container({
  children,
  open,
  onToggle,
  centralized,
  ...props
}: ContainerProps) {
  return (
    <details
      open={open ?? false}
      onToggle={(e) => onToggle?.(e.nativeEvent.newState as State)}
      className={containerStyles({ open, centralized })}
      {...props}
    >
      {children}
    </details>
  );
}

const summaryStyles = cva(
  "cursor-pointer border-t-[0.1px] border-opacity-50 dark:border-opacity-50 border-indigo-400 dark:border-lime-500 sm:hover:border-indigo-400 dark:sm:hover:border-lime-400 px-0 hover:px-2 transition-all duration-300 py-1 hover:bg-indigo-50 dark:hover:bg-zinc-800 text-blue-500 dark:text-lime-400 list-none",
  {
    variants: {
      marginTop: {
        false: "mt-0",
        "2": "mt-2",
        "4": "mt-4",
        "6": "mt-6",
        "8": "mt-8",
        "10": "mt-10",
        "12": "mt-12",
        "24": "mt-24",
        "28": "mt-28",
        "32": "mt-32",
        "36": "mt-36",
        "40": "mt-40",
      },
      marginBottom: {
        false: "mb-0",
        "2": "mb-2",
        "4": "mb-4",
        "6": "mb-6",
        "8": "mb-8",
        "12": "mb-12",
        "16": "mb-16",
        "20": "mb-20",
        "24": "mb-24",
        "28": "mb-28",
      },
    },
    defaultVariants: {
      marginTop: "2",
      marginBottom: "2",
    },
  }
);

interface SummaryProps extends BaseProps, VariantProps<typeof summaryStyles> {}

function Summary({
  children,
  marginTop,
  marginBottom,
  ...props
}: SummaryProps) {
  return (
    <summary className={summaryStyles({ marginTop, marginBottom })} {...props}>
      {children}
    </summary>
  );
}

const contentStyles = cva("flex flex-col gap-8 py-5 px-0", {
  variants: {
    minHeight: {
      false: "min-h-fit",
      screen: "min-h-screen",
      full: "min-h-full",
      "30": "!min-h-[30vh]",
      "40": "!min-h-[40vh]",
      "50": "!min-h-[50vh]",
      "60": "!min-h-[60vh]",
      "70": "!min-h-[70vh]",
      "80": "!min-h-[80vh]",
      "90": "!min-h-[90vh]",
      "100": "!min-h-[100vh]",
    },
  },
  defaultVariants: {
    minHeight: false,
  },
});

interface ContentProps extends BaseProps, VariantProps<typeof contentStyles> {}

function Content({ children, minHeight, ...props }: ContentProps) {
  return (
    <div className={contentStyles({ minHeight })} {...props}>
      {children}
    </div>
  );
}

const DetailsBox = Object.assign(Container, { Summary, Content });

export default DetailsBox;
