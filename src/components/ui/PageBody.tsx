import { cva, VariantProps } from "class-variance-authority";
import React, { ComponentProps } from "react";
import { Link } from "react-router";
import {
  projectVariants,
  projectDefaultVariants,
} from "@/constants/shared-component-styles";

const { width, height, margin, padding } = projectVariants;

const containerStyles = cva("min-h-screen overflow-x-hidden scrollbar", {
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

const breadcrumbStyles = cva("mt-1 mb-2 sm:flex gap-2", {
  variants: {},
  defaultVariants: {},
});

interface BreadcrumbProps
  extends BaseProps,
    VariantProps<typeof breadcrumbStyles> {}

function BreadcrumbContainer({ children, ...props }: BreadcrumbProps) {
  children = React.Children.map(children, (child, index) => (
    <span key={index} className="flex gap-2">
      <span className="mr-1 text-slate-500">/</span>
      <span className="mr-1">{child}</span>
    </span>
  ));

  return (
    <div className={breadcrumbStyles()} {...props}>
      {children}
    </div>
  );
}

const breadcrumbItemStyles = cva("flex whitespace-nowrap gap-2", {
  variants: {
    withHref: {
      true: "hover:underline text-blue-500 dark:text-lime-500",
      false: "text-slate-500",
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
      {icon && <Icon className="mt-1" />}
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
      true: "",
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

const PageBody = Object.assign(Container, { Breadcrumb, Content });

export default PageBody;
