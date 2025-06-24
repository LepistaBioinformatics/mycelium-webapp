import { cva, VariantProps } from "class-variance-authority";
import Typography from "./Typography";
import { IoCloseSharp } from "react-icons/io5";

const containerStyles = cva(
  "fixed z-[997] right-0 top-0 bottom-0 w-full sm:w-[70%] xl:w-1/2 bg-opacity-70 bg-black rounded-lg sm:rounded-l-none shadow-xl",
  {
    variants: {
      open: {
        true: "block",
        false: "hidden",
      },
    },
    defaultVariants: {
      open: false,
    },
  }
);

interface ContainerProps
  extends BaseProps,
    VariantProps<typeof containerStyles> {
  title: string;
  handleClose: () => void;
}

function Container({
  children,
  open,
  title,
  handleClose,
  ...props
}: ContainerProps) {
  return (
    <div className={containerStyles({ open })} {...props}>
      <div className="flex flex-col w-full sm:mb-16 h-[92vh] sm:h-screen overflow-y-auto bg-gray-50 dark:bg-zinc-900 px-2 border-2 border-gray-300 dark:border-gray-700 scrollbar">
        <div className="flex justify-between items-center gap-2 w-full py-3 sticky top-0 bg-gray-50 dark:bg-zinc-900">
          <Typography as="h4" decoration="smooth">
            {title}
          </Typography>
          <button onClick={handleClose}>
            <IoCloseSharp className="text-3xl text-indigo-500 dark:text-lime-500" />
          </button>
        </div>

        <div className="flex justify-normal text-left flex-col gap-2 py-5 px-1 sm:p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

const SideCurtain = Object.assign(Container);

export default SideCurtain;
