import { cva, VariantProps } from "class-variance-authority";

const containerStyles = cva("w-full xl:max-w-4xl mx-auto", {
  variants: {},
  defaultVariants: {},
});

interface ContainerProps extends BaseProps, VariantProps<typeof containerStyles> { }

function Container({ children, ...props }: ContainerProps) {
  return (
    <details className={containerStyles()} {...props}>
      {children}
    </details>
  )
}

const summaryStyles = cva("cursor-pointer border-2 border-transparent border-dashed hover:border-slate-500 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg", {
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
});

interface SummaryProps extends BaseProps, VariantProps<typeof summaryStyles> { }

function Summary({ children, marginTop, marginBottom, ...props }: SummaryProps) {
  return (
    <summary className={summaryStyles({ marginTop, marginBottom })} {...props}>
      {children}
    </summary>
  )
}

const contentStyles = cva("flex flex-col gap-8 bg-slate-100 dark:bg-slate-800 rounded-lg py-5 px-2", {
  variants: {},
  defaultVariants: {},
});

interface ContentProps extends BaseProps, VariantProps<typeof contentStyles> { }

function Content({ children, ...props }: ContentProps) {
  return (
    <div className={contentStyles()} {...props}>
      {children}
    </div>
  )
}

const DetailsBox = Object.assign(Container, { Summary, Content });

export default DetailsBox;
