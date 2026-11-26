import { cva, VariantProps } from "class-variance-authority";
import Typography from "./Typography";
import { X } from "lucide-react";
import { useNavigate } from "react-router";
import { createPortal } from "react-dom";

const containerStyles = cva(
  "fixed z-997 right-0 top-0 bottom-0 w-full bg-black/40 flex justify-end animate-in fade-in-0",
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
  handleClose?: () => void;
}

function Container({
  children,
  open,
  title,
  handleClose,
  ...props
}: ContainerProps) {
  const navigate = useNavigate();

  const defaultHandleClose = () => {
    navigate(-1);
  };

  // Portaled to document.body — nesting this fixed overlay inside the
  // dashboard's scrollable containers makes some mobile browsers paint it
  // relative to the scrolled ancestor instead of the real viewport, cutting
  // off content (e.g. the Shares tab search box) until the page is scrolled
  // back to the top.
  return createPortal(
    <div
      id="side-curtain"
      className={containerStyles({ open })}
      {...props}
      onClick={(e: any) => {
        // Dispatch handleClick if the click is outside the div with id
        // side-curtain-content. Also treat a dialog (Modal) as "inside":
        // it is portaled to document.body, so a click on it (or on its
        // overlay) wouldn't match closest() above even when the modal is
        // logically nested inside this SideCurtain.
        if (
          !e.target.closest("#side-curtain-content") &&
          !e.target.closest('[data-slot^="dialog"]')
        ) {
          handleClose?.();
        }
      }}
    >
      <div
        id="side-curtain-content"
        className="flex flex-col w-full sm:w-[70%] xl:w-1/2 sm:mb-16 h-[92vh] sm:h-screen overflow-y-auto bg-card px-2 sm:px-4 border-l border-border shadow-raised sm:rounded-l-xl scrollbar animate-in slide-in-from-right duration-300"
      >
        <div className="flex justify-between items-center gap-2 w-full py-3 sticky top-0 z-10 bg-card border-b border-border">
          <Typography as="h4" decoration="smooth">
            {title}
          </Typography>
          <button
            type="button"
            onClick={handleClose || defaultHandleClose}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <X className="size-6" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <div className="flex justify-normal text-left flex-col gap-2 py-5 px-1 sm:p-5">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

const SideCurtain = Object.assign(Container);

export default SideCurtain;
