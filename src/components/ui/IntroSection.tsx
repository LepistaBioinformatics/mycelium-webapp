import { cva, VariantProps } from "class-variance-authority";
import Typography from "./Typography";
import { ComponentProps } from "react";

interface Base extends BaseProps, ComponentProps<typeof Typography> {
  prefix?: string;
  content: React.ReactNode;
  title?: string | any;
  prefixProps?: ComponentProps<typeof Typography>;
  contentProps?: ComponentProps<typeof Typography> & { className?: string };
}

const containerStyles = cva("flex flex-col gap-3 xl:gap-1", {
  variants: {},
});

interface ContainerProps extends Base, VariantProps<typeof containerStyles> {}

function Container({
  prefix,
  content,
  title,
  children,
  as = "h2",
  prefixProps,
  contentProps,
  ...props
}: ContainerProps) {
  return (
    <div id="IntroSection" className={containerStyles()} {...props}>
      <div className="flex flex-col xl:flex-row xl:flex-wrap gap-0 xl:gap-2 items-baseline">
        {prefix && (
          <Typography {...prefixProps} as="span" decoration="smooth">
            {prefix}
          </Typography>
        )}
        <Typography {...contentProps} as={as} title={title}>
          {content}
        </Typography>
      </div>

      {children}
    </div>
  );
}

const introItemStyles = cva(
  "flex items-baseline flex-col xl:flex-row xl:flex-wrap gap-0 xl:gap-2",
  {
    variants: {
      fullWidth: {
        true: "w-full justify-between",
      },
      linkLine: {
        true: "flex items-center",
      },
    },
  }
);

const introItemLinkLineStyles = cva(
  "h-[1px] border-b-2 flex-1 border-dashed border-gray-300 dark:border-gray-700",
  {
    variants: {},
  }
);

interface IntroItemProps
  extends Omit<Base, "content">,
    VariantProps<typeof introItemStyles> {
  prefix?: string;
  linkLine?: boolean;
}

function IntroItem({
  prefix,
  children,
  title,
  width,
  prefixProps,
  contentProps,
  fullWidth,
  linkLine,
  ...props
}: IntroItemProps) {
  return (
    <div
      id="IntroSectionItem"
      className={introItemStyles({ fullWidth, linkLine })}
      {...props}
    >
      {prefix && (
        <Typography as="span" decoration="smooth" {...prefixProps}>
          {prefix}
        </Typography>
      )}
      {linkLine && <div className={introItemLinkLineStyles()} />}
      {children && (
        <Typography as="span" title={title} width={width} {...contentProps}>
          {children}
        </Typography>
      )}
    </div>
  );
}
// ? ---------------------------------------------------------------------------
// ? Composite Container
// ? ---------------------------------------------------------------------------

const IntroSection = Object.assign(Container, { Item: IntroItem });

export default IntroSection;
