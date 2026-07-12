import { cva, VariantProps } from "class-variance-authority";
import { createContext, useContext, useState } from "react";

const containerStyles = cva("rounded-lg border border-brand-600 px-4", {
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

interface DetailsBoxContextValue {
  isOpen: boolean;
  toggle: () => void;
}

const DetailsBoxContext = createContext<DetailsBoxContextValue | null>(null);

function useDetailsBoxContext() {
  const context = useContext(DetailsBoxContext);

  if (!context) {
    throw new Error(
      "DetailsBox.Summary and DetailsBox.Content must be rendered inside a DetailsBox"
    );
  }

  return context;
}

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
  const [internalOpen, setInternalOpen] = useState(open ?? false);
  const isOpen = open ?? internalOpen;

  const toggle = () => {
    const next = !isOpen;
    if (open === undefined) setInternalOpen(next);
    onToggle?.(next ? "open" : "closed");
  };

  return (
    <div className={containerStyles({ open: isOpen, centralized })} {...props}>
      <DetailsBoxContext.Provider value={{ isOpen, toggle }}>
        {children}
      </DetailsBoxContext.Provider>
    </div>
  );
}

const summaryStyles = cva(
  "w-full text-left cursor-pointer border-opacity-20 dark:border-opacity-20 border-brand-violet-400 dark:border-brand-violet-600 sm:hover:border-brand-violet-400 dark:sm:hover:border-brand-violet-400 px-0 hover:px-2 transition-all duration-300 py-1 hover:bg-brand-violet-50 dark:hover:bg-brand-900 text-brand-violet-500 dark:text-brand-violet-400",
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

interface SummaryProps extends BaseProps, VariantProps<typeof summaryStyles> { }

function Summary({
  children,
  marginTop,
  marginBottom,
  ...props
}: SummaryProps) {
  const { isOpen, toggle } = useDetailsBoxContext();

  return (
    <button
      type="button"
      aria-expanded={isOpen}
      onClick={toggle}
      className={summaryStyles({ marginTop, marginBottom })}
      {...props}
    >
      {children}
    </button>
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

interface ContentProps extends BaseProps, VariantProps<typeof contentStyles> { }

function Content({ children, minHeight, ...props }: ContentProps) {
  const { isOpen } = useDetailsBoxContext();

  return (
    <div
      aria-hidden={!isOpen}
      className={`grid transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
    >
      <div className="overflow-hidden">
        <div className={contentStyles({ minHeight })} {...props}>
          {children}
        </div>
      </div>
    </div>
  );
}

const DetailsBox = Object.assign(Container, { Summary, Content });

export default DetailsBox;
