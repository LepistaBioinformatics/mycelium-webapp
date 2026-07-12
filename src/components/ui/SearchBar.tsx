import { cva, VariantProps } from "class-variance-authority";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { TextInput } from "flowbite-react";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { MdKeyboardArrowDown, MdTune } from "react-icons/md";
import { IoCloseCircle, IoSearchOutline } from "react-icons/io5";
import Typography from "./Typography";
import { useTranslation } from "react-i18next";

const containerStyles = cva("", {
  variants: {
    commandPalette: {
      true: "rounded-lg w-full z-[997]",
      false: "rounded-lg",
    },
    fullWidth: {
      true: "w-[100%]",
      false: "mx-auto w-full xl:max-w-4xl",
    },
    sticky: {
      true: "sticky top-2 my-2 sm:my-12",
      false: "",
    },
  },
  defaultVariants: {
    fullWidth: false,
    sticky: true,
  },
});

interface IFormInputs {
  term: string;
}

export interface SearchProps
  extends BaseProps,
  VariantProps<typeof containerStyles> {
  term?: string;
  onSubmit: (term?: string) => void;
  placeholder?: string;
  commandPalette?: any;
}

// Lets `CommandPaletteItem` close the panel on selection without every
// caller having to wire it manually — the panel closes itself no matter
// what the item's own onClick does.
const CommandPaletteCloseContext = createContext<(() => void) | null>(null);

function Container({
  fullWidth,
  sticky,
  term,
  onSubmit,
  placeholder,
  commandPalette,
  ...props
}: SearchProps) {
  const { t } = useTranslation();

  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const {
    formState: { errors },
    handleSubmit,
    control,
    setValue,
    watch,
  } = useForm<IFormInputs>({
    defaultValues: {
      term: term || "",
    },
  });

  const currentTerm = watch("term");

  useEffect(() => {
    if (term) setValue("term", term);
  }, [term, setValue]);

  // Click-outside + Escape close the panel, matching how any modern
  // disclosure/combobox behaves.
  useEffect(() => {
    if (!isPaletteOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setIsPaletteOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsPaletteOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPaletteOpen]);

  const onSubmitHandler: SubmitHandler<IFormInputs> = async ({
    term,
  }: IFormInputs) => onSubmit(term.trim());

  const handleClear = () => {
    setValue("term", "");
    onSubmit("");
  };

  return (
    <div
      ref={rootRef}
      id="SearchBar"
      className={containerStyles({
        fullWidth,
        sticky,
        commandPalette: !!commandPalette,
      })}
      {...props}
    >
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <div className="flex">
          <Controller
            name="term"
            control={control}
            render={({ field }) => (
              <>
                <TextInput
                  id="term"
                  type="search"
                  sizing="md"
                  color="custom"
                  icon={IoSearchOutline}
                  rightIcon={
                    currentTerm
                      ? () => (
                          <button
                            type="button"
                            onClick={handleClear}
                            aria-label={t(
                              "components.SearchBar.clear"
                            )}
                            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                          >
                            <IoCloseCircle size={18} />
                          </button>
                        )
                      : undefined
                  }
                  placeholder={
                    placeholder || t("components.SearchBar.placeholder")
                  }
                  autoComplete="off"
                  list="autocompleteOff"
                  theme={{
                    base: "flex w-full xl:max-w-4xl",
                    field: {
                      icon: {
                        svg: "h-5 w-5 text-brand-violet-500 dark:text-brand-violet-400",
                      },
                      input: {
                        base: "block w-full border disabled:cursor-not-allowed disabled:opacity-50 text-start",
                        colors: {
                          custom:
                            "border-brand-600 bg-brand-violet-50 text-zinc-900 focus:border-infra-400 focus:ring-zinc-500 dark:bg-brand-950 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 dark:focus:border-brand-violet-500 dark:focus:ring-brand-violet-500",
                        },
                        withAddon: {
                          off: "rounded-lg",
                        },
                      },
                    },
                  }}
                  {...field}
                />
                <p className="text-sm text-red-500">
                  {errors?.term?.message}
                </p>
              </>
            )}
          />

          <input type="submit" className="hidden" />
        </div>
      </form>

      {commandPalette && (
        <div className="relative flex flex-col justify-start mt-2">
          <button
            type="button"
            onClick={() => setIsPaletteOpen((prev) => !prev)}
            aria-expanded={isPaletteOpen}
            className={[
              "flex items-center gap-2 self-start px-3 py-1.5 rounded-lg border transition-colors",
              "font-mono text-xs uppercase tracking-wide",
              "text-zinc-600 dark:text-zinc-300 bg-white dark:bg-brand-950",
              isPaletteOpen
                ? "border-infra-400"
                : "border-brand-600 hover:border-infra-400",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-infra-400",
            ].join(" ")}
          >
            <MdTune className="text-brand-violet-500 dark:text-brand-violet-400" />
            {t("components.SearchBar.commandPalette.title")}
            <MdKeyboardArrowDown
              className={`transition-transform motion-reduce:transition-none ${isPaletteOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isPaletteOpen && (
            <CommandPaletteCloseContext.Provider
              value={() => setIsPaletteOpen(false)}
            >
              <div
                className={[
                  "absolute left-0 top-full mt-2 z-10 origin-top",
                  "transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none",
                  "opacity-100 scale-100",
                ].join(" ")}
              >
                {commandPalette}
              </div>
            </CommandPaletteCloseContext.Provider>
          )}
        </div>
      )}
    </div>
  );
}

const commandPaletteContentStyles = cva(
  "flex flex-col gap-6 max-h-[300px] overflow-y-auto bg-white dark:bg-brand-950 p-3 rounded-lg border border-brand-600 scrollbar w-full sm:w-96 shadow-sm dark:shadow-none",
  {
    variants: {},
    defaultVariants: {},
  }
);

interface CommandPaletteContentProps
  extends VariantProps<typeof commandPaletteContentStyles> {
  children: React.ReactNode;
}

function CommandPaletteContent({ children }: CommandPaletteContentProps) {
  return <div className={commandPaletteContentStyles()}>{children}</div>;
}

const commandPaletteItemStyles = cva(
  "flex flex-col gap-0.5 rounded-lg px-2 py-1.5 w-full group transition-colors",
  {
    variants: {
      disabled: {
        true: "opacity-50 cursor-not-allowed",
        false:
          "cursor-pointer hover:bg-brand-violet-100 dark:hover:bg-brand-900",
      },
    },
    defaultVariants: {
      disabled: false,
    },
  }
);

interface CommandPaletteItemProps
  extends VariantProps<typeof commandPaletteItemStyles> {
  brief: string;
  description?: string;
  command: string;
  onClick: (command: string) => void;
}

function CommandPaletteItem({
  brief,
  command,
  description,
  onClick,
  disabled,
}: CommandPaletteItemProps) {
  const closePalette = useContext(CommandPaletteCloseContext);

  const handleClick = () => {
    if (disabled) return;
    onClick(command);
    closePalette?.();
  };

  return (
    <div
      className={commandPaletteItemStyles({ disabled })}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200 group-hover:text-brand-violet-600 dark:group-hover:text-brand-violet-300">
          {brief}
        </span>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-lg border border-brand-600/40 text-zinc-500 dark:text-zinc-400">
          {command}
        </span>
      </div>

      {description && (
        <Typography as="small" decoration="smooth" margin="none">
          {description}
        </Typography>
      )}
    </div>
  );
}

const SearchBar = Object.assign(Container, {
  Content: CommandPaletteContent,
  Item: CommandPaletteItem,
});

export default SearchBar;
