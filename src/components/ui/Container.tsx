import { cva, VariantProps } from "class-variance-authority";
import { projectVariants } from "@/constants/shared-component-styles";

const { margin, padding } = projectVariants;

// ? ---------------------------------------------------------------------------
// ? Screen Container
//
// Use this component to create a screen container, like a page, modal, etc.
//
// ? ---------------------------------------------------------------------------

const containerStyles = cva("text-gray-500 dark:text-gray-50", {
  variants: {
    padding,
    margin,
    type: {
      screen: "bg-slate-50 dark:bg-slate-900 min-h-screen w-full",
    },
  },
  defaultVariants: {
    type: "screen",
    padding: "none",
  },
});

interface ScreenContainerProps
  extends BaseProps,
    VariantProps<typeof containerStyles> {}

function ScreenContainer({
  type,
  children,
  padding,
  ...props
}: ScreenContainerProps) {
  return (
    <main className={containerStyles({ type, padding })} {...props}>
      {children}
    </main>
  );
}

// ? ---------------------------------------------------------------------------
// ? Box Container
//
// Use this component to create a box container inside the screen container,
// like cards, modals, etc.
//
// ? ---------------------------------------------------------------------------

const boxStyles = cva("text-gray-500 dark:text-gray-50", {
  variants: {
    type: {
      highlight:
        "bg-gray-100 dark:bg-neutral-800 shadow-md rounded-lg border-2 dark:border-indigo-900 p-4",
      discreet: "bg-transparent p-4",
    },
  },
  defaultVariants: {
    type: "highlight",
  },
});

interface BoxProps extends BaseProps, VariantProps<typeof boxStyles> {}

function Box({ type, ...props }: BoxProps) {
  return <main className={boxStyles({ type })} {...props} />;
}

// ? ---------------------------------------------------------------------------
// ? Export Container
//
// Export the ScreenContainer and Box components as a single Container
// component. This is useful to avoid importing multiple components.
//
// ? ---------------------------------------------------------------------------

const Container = Object.assign(ScreenContainer, {
  Box,
});

export default Container;
