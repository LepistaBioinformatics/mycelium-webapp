import { cva, VariantProps } from "class-variance-authority";
import { IoIosClose } from "react-icons/io";

const containerStyles = cva(
  "text-gray-500 dark:text-gray-50 fixed inset-0 z-50 flex flex-col justify-center items-center bg-opacity-50 bg-black h-full m-1",
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
    VariantProps<typeof containerStyles> {}

function Container({ children, open, ...props }: ContainerProps) {
  return (
    <main className={containerStyles({ open })} {...props}>
      <div className="bg-white dark:bg-gray-900 rounded-lg p-2 border-2 border-gray-300 dark:border-gray-700 max-h-[95vh] overflow-y-hidden scrollbar w-full sm:w-1/3">
        {children}
      </div>
    </main>
  );
}

const headerStyles = cva(
  "text-gray-500 dark:text-gray-50 flex justify-between items-center gap-8 min-h-fit p-3",
  {
    variants: {},
  }
);

interface HeaderProps extends BaseProps, VariantProps<typeof headerStyles> {
  handleClose: () => void;
}

function Header({ children, handleClose, ...props }: HeaderProps) {
  return (
    <div className={headerStyles()} {...props}>
      <div>{children}</div>
      <button onClick={handleClose}>
        <IoIosClose className="text-2xl" />
      </button>
    </div>
  );
}

const bodyStyles = cva(
  "text-gray-500 dark:text-gray-50 flex justify-between items-center min-h-24 p-3",
  {
    variants: {},
  }
);

interface BodyProps extends BaseProps, VariantProps<typeof bodyStyles> {}

function Body({ children, ...props }: BodyProps) {
  return (
    <div className={bodyStyles()} {...props}>
      {children}
    </div>
  );
}

const Modal = Object.assign(Container, { Header, Body });

export default Modal;
