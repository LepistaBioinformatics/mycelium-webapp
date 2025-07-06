import { cva, VariantProps } from "class-variance-authority";
import Typography from "./Typography";
import { IoCloseSharp } from "react-icons/io5";
import { useNavigate } from "react-router";

const containerStyles = cva(
  "text-gray-500 dark:text-gray-50 fixed inset-0 z-[999] flex flex-col justify-center items-center bg-opacity-50 sm:bg-opacity-60 bg-black h-full sm:pt-1 sm:px-1",
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
  handleClose?: () => void;
}

function Container({ children, open, handleClose, ...props }: ContainerProps) {
  return (
    <main
      id="modal-container"
      className={containerStyles({ open })}
      {...props}
      onClick={(e: any) => {
        if (!e.target.closest("#modal-container-content")) {
          handleClose?.();
        }
      }}
    >
      <div
        id="modal-container-content"
        className="bg-white dark:bg-zinc-900 sm:rounded-lg p-2 border-2 border-gray-300 dark:border-gray-700 overflow-y-auto scrollbar mb-16 sm:my-2 h-[95vh] sm:h-fit w-full sm:min-w-1/2 md:w-2/5"
      >
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
  handleClose?: () => void;
}

function Header({ children, handleClose, ...props }: HeaderProps) {
  const navigate = useNavigate();

  const defaultHandleClose = () => {
    if (handleClose) {
      handleClose();
      return;
    }

    navigate(-1);
  };

  return (
    <div className={headerStyles()} {...props}>
      <Typography as="div" decoration="smooth">
        {children}
      </Typography>
      <button onClick={defaultHandleClose}>
        <IoCloseSharp className="text-3xl text-indigo-500 dark:text-lime-500" />
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
