import { cva, VariantProps } from "class-variance-authority";
import Typography from "./Typography";
import { IoCloseSharp } from "react-icons/io5";
import { useNavigate } from "react-router";

const containerStyles = cva(
  "fixed z-[997] right-0 top-0 bottom-0 w-full bg-zinc-600 bg-opacity-20 dark:bg-zinc-900 dark:bg-opacity-40 rounded-lg sm:rounded-l-none shadow-xl flex justify-end",
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

  return (
    <div
      id="side-curtain"
      className={containerStyles({ open })}
      {...props}
      onClick={(e: any) => {
        // Dispatch handleClick if the click is outside the div with id side-curtain-content
        if (!e.target.closest("#side-curtain-content")) {
          handleClose?.();
        }
      }}
    >
      <div
        id="side-curtain-content"
        className="flex flex-col w-full sm:w-[70%] xl:w-1/2 sm:mb-16 h-[92vh] sm:h-screen overflow-y-auto bg-gray-50 dark:bg-zinc-900 px-2 border-2 border-gray-300 dark:border-gray-700 scrollbar"
      >
        <div className="flex justify-between items-center gap-2 w-full py-3 sticky top-0 bg-gray-50 dark:bg-zinc-900">
          <Typography as="h4" decoration="smooth">
            {title}
          </Typography>
          <button onClick={handleClose || defaultHandleClose}>
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
