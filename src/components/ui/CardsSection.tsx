import { cva, VariantProps } from "class-variance-authority";

const containerStyles = cva("flex flex-col min-w-full overflow-x-auto gap-3 scrollbar pb-2 px-1", {
  variants: {},
});

interface ContainerProps extends BaseProps, VariantProps<typeof containerStyles> { }

function Container({ children, ...props }: ContainerProps) {
  return (
    <section id="ProfileCardsSection" className={containerStyles()} {...props}>
      {children}
    </section>
  );
}

const headerStyles = cva("flex items-center justify-between", {
  variants: {},
});

interface HeaderProps extends BaseProps, VariantProps<typeof headerStyles> { }

function Header({ children, ...props }: HeaderProps) {
  return (
    <div className={headerStyles()} {...props}>
      {children}
    </div>
  );
}

const bodyStyles = cva("flex flex-wrap gap-3", {
  variants: {},
});

interface BodyProps extends BaseProps, VariantProps<typeof bodyStyles> { }

function Body({ children, ...props }: BodyProps) {
  return (
    <div className={bodyStyles()} {...props}>
      {children}
    </div>
  );
}

// ? ---------------------------------------------------------------------------
// ? Composite Container
// ? ---------------------------------------------------------------------------

const CardsSection = Object.assign(Container, { Header, Body });

export default CardsSection;
