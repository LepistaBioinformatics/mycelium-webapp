import { cva, VariantProps } from "class-variance-authority";

const containerStyles = cva(
  "flex flex-col overflow-x-auto scrollbar pb-2 px-1",
  {
    variants: {
      gap: {
        fixed: "gap-3",
        variable: "gap-8 sm:gap-3",
      },
    },
    defaultVariants: {
      gap: "variable",
    },
  }
);

interface ContainerProps
  extends BaseProps,
    VariantProps<typeof containerStyles> {}

function Container({ children, gap, ...props }: ContainerProps) {
  return (
    <section id="CardsSection" className={containerStyles({ gap })} {...props}>
      {children}
    </section>
  );
}

const headerStyles = cva("flex items-center justify-between", {
  variants: {},
});

interface HeaderProps extends BaseProps, VariantProps<typeof headerStyles> {}

function Header({ children, ...props }: HeaderProps) {
  return (
    <div id="CardsSectionHeader" className={headerStyles()} {...props}>
      {children}
    </div>
  );
}

const bodyStyles = cva("flex flex-wrap overflow-x-auto gap-3 w-full", {
  variants: {},
});

interface BodyProps extends BaseProps, VariantProps<typeof bodyStyles> {}

function Body({ children, ...props }: BodyProps) {
  return (
    <div id="CardsSectionBody" className={bodyStyles()} {...props}>
      {children}
    </div>
  );
}

// ? ---------------------------------------------------------------------------
// ? Composite Container
// ? ---------------------------------------------------------------------------

const Section = Object.assign(Container, { Header, Body });

export default Section;
