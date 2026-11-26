import { cva, VariantProps } from "class-variance-authority";
import React, { ComponentProps } from "react";
import { Link } from "react-router";
import { ChevronRight } from "lucide-react";
import {
  projectVariants,
  projectDefaultVariants,
} from "@/constants/shared-component-styles";

const { width, height, margin, padding } = projectVariants;

const containerStyles = cva("min-h-screen overflow-x-hidden scrollbar mb-24", {
  variants: {
    padding,
    margin,
    height,
    width,
    flex: {
      true: "flex",
      column: "flex flex-col",
      center: "flex justify-center items-center",
      around: "flex justify-around items-around",
      start: "flex justify-start items-start",
      end: "flex justify-end items-end",
    },
    align: {
      center: "items-center",
      start: "items-start",
      end: "items-end",
      top: "items-top",
      bottom: "items-bottom",
    },
    items: {
      center: "items-center",
      start: "items-start",
      end: "items-end",
      top: "items-top",
      bottom: "items-bottom",
    },
    justify: {
      center: "justify-center",
      around: "justify-around",
      start: "justify-start",
      end: "justify-end",
    },
    gap: {
      1: "gap-1",
      2: "gap-2",
      3: "gap-3",
      4: "gap-4",
      5: "gap-5",
    },
  },
  defaultVariants: {
    ...projectDefaultVariants,
    flex: false,
    align: "start",
    justify: "start",
  },
});

interface ContainerProps
  extends BaseProps,
    ComponentProps<"div">,
    VariantProps<typeof containerStyles> {}

function Container({
  children,
  flex,
  gap,
  padding,
  margin,
  align,
  justify,
  height,
  width,
  ...props
}: ContainerProps) {
  return (
    <div
      id="PageBody"
      className={containerStyles({
        flex,
        gap,
        padding,
        margin,
        align,
        justify,
        height,
        width,
      })}
      {...props}
    >
      {children}
    </div>
  );
}

const breadcrumbStyles = cva("mt-1 pb-4 flex items-center overflow-x-auto scrollbar gap-1.5 text-sm", {
  variants: {},
  defaultVariants: {},
});

interface BreadcrumbProps
  extends BaseProps,
    VariantProps<typeof breadcrumbStyles> {}

function BreadcrumbContainer({ children, ...props }: BreadcrumbProps) {
  children = React.Children.map(children, (child, index) => (
    <span key={index} className="flex items-center gap-1.5">
      {index > 0 && (
        <ChevronRight aria-hidden className="size-3.5 text-muted-foreground/60" />
      )}
      <span>{child}</span>
    </span>
  ));

  return (
    <div className={breadcrumbStyles()} {...props}>
      {children}
    </div>
  );
}

const breadcrumbItemStyles = cva("flex items-center whitespace-nowrap gap-1.5 transition-colors", {
  variants: {
    withHref: {
      true: "text-muted-foreground hover:text-foreground",
      false: "text-foreground font-medium",
    },
  },
  defaultVariants: {},
});

interface BreadcrumbItemProps
  extends BaseProps,
    VariantProps<typeof breadcrumbItemStyles> {
  href?: string;
  icon?: any;
}

function BreadcrumbItem({
  children,
  icon,
  href,
  ...props
}: BreadcrumbItemProps) {
  const Icon = icon;

  const content = (
    <>
      {icon && <Icon className="size-3.5" />}
      {children}
    </>
  );

  if (href) {
    return (
      <Link
        to={href}
        className={breadcrumbItemStyles({ withHref: true })}
        {...props}
      >
        {content}
      </Link>
    );
  }

  return (
    <span
      id="PageBodyBreadcrumbItem"
      className={breadcrumbItemStyles({ withHref: false })}
      {...props}
    >
      {content}
    </span>
  );
}

const Breadcrumb = Object.assign(BreadcrumbContainer, { Item: BreadcrumbItem });

const contentStyles = cva("", {
  variants: {
    padding,
    margin,
    width,
    container: {
      true: "mx-auto w-full xl:max-w-4xl",
      false: "w-full",
    },
    flex: {
      true: "flex",
      col: "flex flex-col",
      center: "flex justify-center items-center",
      around: "flex justify-around items-around",
      between: "flex justify-between items-between",
      start: "flex justify-start items-start",
      end: "flex justify-end items-end",
    },
    wrap: {
      true: "flex-wrap",
      false: "flex-nowrap",
    },
    gap: {
      1: "gap-1",
      2: "gap-2",
      3: "gap-3",
      4: "gap-4",
      5: "gap-5",
      8: "gap-8",
      12: "gap-12",
    },
  },
  defaultVariants: {
    flex: false,
    padding: "none",
    margin: "none",
  },
});

interface ContentProps extends BaseProps, VariantProps<typeof contentStyles> {}

function Content({
  children,
  flex,
  gap,
  padding,
  container,
  wrap,
  margin,
  ...props
}: ContentProps) {
  return (
    <div
      id="PageBodyContent"
      className={contentStyles({ flex, gap, padding, container, wrap, margin })}
      {...props}
    >
      {children}
    </div>
  );
}

const footerStyles = cva("mt-1 p-4 overflow-auto scrollbar flex flex-col gap-5", {
  variants: {},
  defaultVariants: {},
});

interface FooterProps extends BaseProps, VariantProps<typeof footerStyles> {}

function Footer({ children, ...props }: FooterProps) {
  return (
    <div className={footerStyles()} {...props}>
      {children}
    </div>
  );
}

const PageBody = Object.assign(Container, { Breadcrumb, Content, Footer });

export default PageBody;
