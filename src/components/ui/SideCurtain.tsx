import { cva, VariantProps } from "class-variance-authority";
import { IoIosClose } from "react-icons/io";
import Typography from "./Typography";

const containerStyles = cva("fixed z-50 right-0 top-0 bottom-0 w-1/2 bg-opacity-70 bg-black", {
  variants: {
    open: {
      true: "block",
      false: "hidden",
    }
  },
  defaultVariants: {
    open: false,
  }
});

interface ContainerProps extends
  BaseProps,
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
      <div className="flex flex-col w-full max-h-screen min-h-screen overflow-y-auto bg-white dark:bg-gray-900 rounded-lg p-2 border-2 border-gray-300 dark:border-gray-700">
        <div className="flex justify-between items-center gap-2 w-full">
          <Typography as="h2">{title}</Typography>
          <button onClick={handleClose}>
            <IoIosClose className="text-2xl" />
          </button>
        </div>

        <div className="flex justify-normal text-left flex-col gap-2 p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

const SideCurtain = Object.assign(Container);

export default SideCurtain;
