import { cva, VariantProps } from "class-variance-authority";
import {
  createContext,
  FormEvent,
  KeyboardEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { MdKeyboardArrowDown, MdTune } from "react-icons/md";
import { IoSearchOutline } from "react-icons/io5";
import { X } from "lucide-react";
import {
  composeSearchTerm,
  parseSearchTerm,
  searchFilterLabel,
} from "@/functions/search-term-filters";
import { useTranslation } from "react-i18next";

const containerStyles = cva("", {
  variants: {
    commandPalette: {
      true: "rounded-lg w-full z-997",
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
  const inputRef = useRef<HTMLInputElement>(null);

  // The term mixes filter tokens (shown as chips) and free text (the input).
  const [filters, setFilters] = useState<string[]>(
    () => parseSearchTerm(term).filters
  );
  const [text, setText] = useState(() => parseSearchTerm(term).text);

  // `term` is owned by the caller (palette picks change it from outside), so
  // re-split it whenever it changes.
  useEffect(() => {
    if (term === undefined) return;
    const parsed = parseSearchTerm(term);
    setFilters(parsed.filters);
    setText(parsed.text);
  }, [term]);

  // Click-outside + Escape close the panel, matching how any modern
  // disclosure/combobox behaves.
  useEffect(() => {
    if (!isPaletteOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setIsPaletteOpen(false);
      }
    };

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setIsPaletteOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPaletteOpen]);

  const submit = (nextFilters: string[], nextText: string) => {
    setFilters(nextFilters);
    onSubmit(composeSearchTerm(nextFilters, nextText));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    // Typed filter tokens (e.g. "status:failed") become chips on submit.
    const parsed = parseSearchTerm(text);
    setText(parsed.text);
    submit([...filters, ...parsed.filters], parsed.text);
  };

  const removeFilter = (filter: string) => {
    submit(
      filters.filter((current) => current !== filter),
      text
    );
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Backspace" || text !== "" || filters.length === 0) {
      return;
    }
    submit(filters.slice(0, -1), text);
  };

  const handleClear = () => {
    setText("");
    submit([], "");
  };

  const hasQuery = filters.length > 0 || text !== "";

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
      <form onSubmit={handleSubmit}>
        <div
          className="flex flex-wrap items-center gap-1.5 w-full xl:max-w-4xl rounded-2xl border border-input bg-field px-4 py-2.5 shadow-card transition-[box-shadow,border-color] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/40 focus-within:shadow-raised cursor-text"
          onClick={() => inputRef.current?.focus()}
        >
          <IoSearchOutline
            aria-hidden
            className="size-5 shrink-0 mr-1 text-muted-foreground"
          />

          {filters.map((filter) => (
            <span
              key={filter}
              title={filter}
              className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-100 py-0.5 pl-2.5 pr-1 text-sm text-brand-800 dark:border-brand-700 dark:bg-brand-900/60 dark:text-brand-100"
            >
              {searchFilterLabel(filter)}
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  removeFilter(filter);
                }}
                aria-label={t("components.SearchBar.removeFilter", {
                  filter: searchFilterLabel(filter),
                })}
                className="rounded-full p-0.5 text-brand-600 hover:bg-brand-200 hover:text-brand-900 dark:text-brand-300 dark:hover:bg-brand-800 dark:hover:text-brand-50 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}

          <input
            ref={inputRef}
            id="term"
            type="search"
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              filters.length > 0
                ? t("components.SearchBar.refinePlaceholder")
                : placeholder || t("components.SearchBar.placeholder")
            }
            autoComplete="off"
            className="flex-1 min-w-[10rem] bg-transparent py-1 text-base text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
          />

          {hasQuery && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleClear();
              }}
              className="shrink-0 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t("components.SearchBar.clearFilters")}
            </button>
          )}
        </div>

        <input type="submit" className="hidden" />
      </form>

      {commandPalette && (
        <div className="relative flex flex-col justify-start mt-2">
          <button
            type="button"
            onClick={() => setIsPaletteOpen((prev) => !prev)}
            aria-expanded={isPaletteOpen}
            className={[
              "flex items-center gap-2 self-start px-4 py-2 rounded-full border transition-colors",
              "font-mono text-xs uppercase tracking-wide",
              "text-muted-foreground bg-background shadow-xs",
              isPaletteOpen
                ? "border-ring text-foreground"
                : "border-input hover:bg-muted hover:text-foreground",
              "focus:outline-hidden focus-visible:ring-2 focus-visible:ring-infra-400",
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
                  "absolute inset-x-0 top-full mt-2 z-30 origin-top",
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
  [
    "grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] gap-x-6 gap-y-5 w-full max-h-[min(65vh,32rem)] overflow-y-auto scrollbar",
    // Each group (a div with a title and its options) lays its options out
    // in as many columns as fit, so a single group uses the full width.
    "[&>div]:grid [&>div]:grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] [&>div]:content-start [&>div]:gap-1 [&>div>h4]:col-span-full",
    "bg-popover text-popover-foreground p-4 rounded-2xl border border-border shadow-raised",
    "animate-in fade-in-0 slide-in-from-top-1 duration-150",
    // Group titles (each group renders a Typography h4) read as small
    // eyebrows, so the options carry the visual weight.
    "[&_h4]:font-mono [&_h4]:text-[0.7rem]! [&_h4]:font-normal! [&_h4]:uppercase [&_h4]:tracking-wider [&_h4]:text-muted-foreground! [&_h4]:px-2 [&_h4]:pb-1",
  ].join(" "),
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
  "flex flex-col items-start gap-1 rounded-md px-2.5 py-2 w-full text-left group transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
  {
    variants: {
      disabled: {
        true: "opacity-50 cursor-not-allowed",
        false:
          "cursor-pointer hover:bg-muted focus-visible:bg-muted dark:hover:bg-surface-800 dark:focus-visible:bg-surface-800",
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
    <button
      type="button"
      disabled={!!disabled}
      className={commandPaletteItemStyles({ disabled })}
      onClick={handleClick}
    >
      <span className="text-sm font-medium text-foreground group-hover:text-brand-700 dark:group-hover:text-brand-200">
        {brief}
      </span>
      <span className="w-fit font-mono text-[10px] tracking-wide px-1.5 py-0.5 rounded bg-muted text-muted-foreground dark:bg-surface-800 group-hover:bg-brand-100 group-hover:text-brand-800 dark:group-hover:bg-brand-900/60 dark:group-hover:text-brand-100 transition-colors">
        {command}
      </span>

      {description && (
        <span className="text-xs text-muted-foreground leading-snug">
          {description}
        </span>
      )}
    </button>
  );
}

const SearchBar = Object.assign(Container, {
  Content: CommandPaletteContent,
  Item: CommandPaletteItem,
});

export default SearchBar;
