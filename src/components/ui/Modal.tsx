import { cva, VariantProps } from "class-variance-authority";
import Typography from "./Typography";
import { X } from "lucide-react";
import { useNavigate } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/shadcn/dialog";

const contentStyles = cva(
  "flex flex-col gap-0 p-2 bg-card shadow-raised text-zinc-500 dark:text-zinc-50 border-brand-600/25 dark:border-brand-400/20 overflow-y-auto scrollbar h-[95vh] sm:h-fit max-h-[95vh] w-full max-w-full sm:max-w-[min(90vw,48rem)] rounded-none sm:rounded-xl"
);

interface ContainerProps extends BaseProps, VariantProps<typeof contentStyles> {
  open?: boolean | null;
  handleClose?: () => void;
}

function Container({ children, open, handleClose }: ContainerProps) {
  return (
    <Dialog
      open={!!open}
      onOpenChange={(next) => {
        if (!next) handleClose?.();
      }}
    >
      <DialogContent
        id="modal-container-content"
        showCloseButton={false}
        aria-describedby={undefined}
        className={contentStyles()}
        // Modal is portaled to document.body, but React events still bubble
        // to React ancestors: stop them here so an ancestor SideCurtain's
        // outside-click handler does not close both overlays.
        onClick={(e) => e.stopPropagation()}
        // Toasts live outside the dialog; clicking one must not close it.
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement | null;
          if (target?.closest("[data-app-notification]")) e.preventDefault();
        }}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}

const headerStyles = cva(
  "sticky -top-2 z-10 -mx-2 -mt-2 px-5 py-3 bg-card text-zinc-500 dark:text-zinc-50 flex justify-between items-center gap-8 min-h-fit border-b border-border"
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
      <DialogTitle asChild>
        <div>
          <Typography as="div" decoration="smooth">
            {children}
          </Typography>
        </div>
      </DialogTitle>
      <button
        type="button"
        onClick={defaultHandleClose}
        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <X className="size-6" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  );
}

const bodyStyles = cva(
  "text-zinc-500 dark:text-zinc-50 flex justify-between items-center min-h-24 p-3"
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
