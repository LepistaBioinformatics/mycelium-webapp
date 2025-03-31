import { cva, VariantProps } from "class-variance-authority";
import Typography from "./Typography";
import { ComponentProps } from "react";

interface Base extends BaseProps,
  ComponentProps<typeof Typography> {
  prefix?: string;
  content: React.ReactNode;
  title?: string | any;
}

const containerStyles = cva("flex flex-col gap-0", {
  variants: {},
});

interface ContainerProps extends Base, VariantProps<typeof containerStyles> { }

function Container({ prefix, content, title, children, as = "h2", ...props }: ContainerProps) {
  return (
    <div className={containerStyles()} {...props}>
      <div className="flex items-baseline gap-2">
        {prefix && (
          <Typography as="span" decoration="smooth">
            {prefix}
          </Typography>
        )}
        <Typography as={as} title={title}>
          {content}
        </Typography>
      </div>

      {children}
    </div>
  )
};

const introItemStyles = cva("flex items-baseline gap-2", {
  variants: {},
});

interface IntroItemProps extends
  Omit<Base, "content">,
  VariantProps<typeof introItemStyles> {
  prefix: string;
}

function IntroItem({ prefix, children, title, ...props }: IntroItemProps) {
  return (
    <div className={introItemStyles()} {...props}>
      <Typography as="span" decoration="smooth">
        {prefix}
      </Typography>
      {children && (
        <Typography as="span" title={title}>
          {children}
        </Typography>
      )}
    </div>
  )
}
// ? ---------------------------------------------------------------------------
// ? Composite Container
// ? ---------------------------------------------------------------------------

const IntroSection = Object.assign(Container, { Item: IntroItem });

export default IntroSection;
