import { cva, VariantProps } from "class-variance-authority";
import Typography from "./Typography";
import { IoCloseSharp } from "react-icons/io5";
import { useNavigate } from "react-router";
import { createPortal } from "react-dom";

const containerStyles = cva(
  "text-zinc-500 dark:text-zinc-50 fixed inset-0 z-[999] flex flex-col justify-center items-center bg-opacity-50 sm:bg-opacity-60 bg-black h-full sm:pt-1 sm:px-1",
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
  // Portaled to document.body — nesting this fixed overlay inside the
  // dashboard's scrollable containers makes some mobile browsers paint it
  // relative to the scrolled ancestor instead of the real viewport, cutting
  // off content until the page is scrolled back to the top.
  return createPortal(
    <main
      id="modal-container"
      className={containerStyles({ open })}
      {...props}
      onClick={(e: any) => {
        // Stop the click from bubbling to an ancestor SideCurtain's
        // outside-click handler: Modal is portaled to document.body, so in
        // the DOM its content is a sibling of #side-curtain, not a
        // descendant — SideCurtain's closest() check can't see it and would
        // otherwise close both overlays on any click inside the modal.
        e.stopPropagation();
        if (!e.target.closest("#modal-container-content")) {
          handleClose?.();
        }
      }}
    >
      <div
        id="modal-container-content"
        className="bg-white dark:bg-brand-950 sm:rounded-lg p-2 border border-brand-600 shadow-sm dark:shadow-none overflow-y-auto scrollbar mb-16 sm:my-2 h-[95vh] sm:h-fit w-full sm:min-w-1/2 md:w-2/5"
      >
        {children}
      </div>
    </main>,
    document.body
  );
}

const headerStyles = cva(
  "text-zinc-500 dark:text-zinc-50 flex justify-between items-center gap-8 min-h-fit p-3",
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
        <IoCloseSharp className="text-3xl text-brand-violet-500 dark:text-brand-violet-500" />
      </button>
    </div>
  );
}

const bodyStyles = cva(
  "text-zinc-500 dark:text-zinc-50 flex justify-between items-center min-h-24 p-3",
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
