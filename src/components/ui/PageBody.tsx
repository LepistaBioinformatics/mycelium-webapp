import { cva, VariantProps } from "class-variance-authority";
import React from "react";
import { Link } from "react-router";

const containerStyles = cva("min-h-screen", {
  variants: {
    flex: {
      true: "flex",
      column: "flex flex-col",
      center: "flex justify-center items-center",
      around: "flex justify-around items-around",
      start: "flex justify-start items-start",
      end: "flex justify-end items-end"
    },
    align: {
      center: "items-center",
      start: "items-start",
      end: "items-end",
    },
    justify: {
      center: "justify-center",
      start: "justify-start",
      end: "justify-end",
    },
    height: {
      screen: "h-screen",
      fit: "h-fit",
      full: "h-full",
      min: "h-min",
      max: "h-max",
    },
    width: {
      full: "w-full",
      min: "w-min",
      max: "w-max",
    },
    gap: {
      1: "gap-1",
      2: "gap-2",
      3: "gap-3",
      4: "gap-4",
      5: "gap-5"
    },
    padding: {
      none: "p-0",
      xs: "p-1",
      sm: "p-2",
      md: "p-4",
      lg: "p-8",
      xl: "p-16",
    },
    margin: {
      none: "m-0",
      sm: "m-2",
      md: "m-4",
      lg: "m-8",
      xl: "m-16",
    }
  },
  defaultVariants: {
    flex: false,
    width: "full",
    height: "full",
    padding: "none",
    margin: "none",
    align: "start",
    justify: "start",
  }
});

interface ContainerProps extends
  BaseProps, VariantProps<typeof containerStyles> { }

function Container({ children, flex, gap, padding, margin, align, justify, height, width, ...props }: ContainerProps) {
  return (
    <div id="PageBody" className={containerStyles({ flex, gap, padding, margin, align, justify, height, width })} {...props}>
      {children}
    </div>
  );
}

const breadcrumbStyles = cva("mt-1 mb-2 flex", {
  variants: {},
  defaultVariants: {}
});

interface BreadcrumbProps extends
  BaseProps, VariantProps<typeof breadcrumbStyles> { }

function BreadcrumbContainer({ children, ...props }: BreadcrumbProps) {
  children = React.Children.map(children, (child, index) => (
    <span key={index} className="flex">
      <span className="mr-1 text-slate-500">/</span>
      <span className="mr-1">
        {child}
      </span>
    </span>
  ));

  return (
    <div className={breadcrumbStyles()} {...props}>
      {children}
    </div>
  );
}

const breadcrumbItemStyles = cva("flex gap-2", {
  variants: {
    withHref: {
      true: "hover:underline text-blue-500 dark:text-lime-500",
      false: "text-slate-500"
    }
  },
  defaultVariants: {}
});

interface BreadcrumbItemProps extends
  BaseProps, VariantProps<typeof breadcrumbItemStyles> {
  href?: string;
  icon?: any;
}

function BreadcrumbItem({ children, icon, href, ...props }: BreadcrumbItemProps) {
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
    <span id="PageBodyBreadcrumbItem" className={breadcrumbItemStyles({ withHref: false })} {...props}>
      {content}
    </span>
  );
}

const Breadcrumb = Object.assign(BreadcrumbContainer, { Item: BreadcrumbItem });

const contentStyles = cva("", {
  variants: {
    container: {
      true: "mx-auto w-full xl:max-w-5xl",
      false: "w-full"
    },
    flex: {
      true: "flex",
      col: "flex flex-col",
      center: "flex justify-center items-center",
      around: "flex justify-around items-around",
      between: "flex justify-between items-between",
      start: "flex justify-start items-start",
      end: "flex justify-end items-end"
    },
    wrap: {
      true: "flex-wrap",
      false: "flex-nowrap"
    },
    gap: {
      1: "gap-1",
      2: "gap-2",
      3: "gap-3",
      4: "gap-4",
      5: "gap-5"
    },
    padding: {
      none: "p-0",
      xs: "p-1",
      sm: "p-2",
      md: "p-4",
      lg: "p-8",
      xl: "p-16",
    }
  },
  defaultVariants: {
    flex: false,
    padding: "none"
  }
});

interface ContentProps extends BaseProps, VariantProps<typeof contentStyles> { }

function Content({ children, flex, gap, padding, container, wrap, ...props }: ContentProps) {
  return (
    <div id="PageBodyContent" className={contentStyles({ flex, gap, padding, container, wrap })} {...props}>
      {children}
    </div>
  );
}

const PageBody = Object.assign(Container, { Breadcrumb, Content });

export default PageBody;
