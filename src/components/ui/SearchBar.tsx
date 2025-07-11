import { cva, VariantProps } from "class-variance-authority";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { TextInput } from "flowbite-react";
import { useEffect } from "react";
import Typography from "./Typography";
import { useTranslation } from "react-i18next";

const containerStyles = cva("sticky top-2 my-2 sm:my-12", {
  variants: {
    commandPalette: {
      true: "rounded-lg w-full z-[997]",
      false: "rounded-full",
    },
    fullWidth: {
      true: "w-[100%]",
      false: "mx-auto w-full xl:max-w-4xl",
    },
  },
  defaultVariants: {
    fullWidth: false,
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

function Container({
  fullWidth,
  term,
  onSubmit,
  placeholder,
  commandPalette,
  ...props
}: SearchProps) {
  const { t } = useTranslation();

  const {
    formState: { errors },
    handleSubmit,
    control,
    setValue,
  } = useForm<IFormInputs>({
    defaultValues: {
      term: term || "",
    },
  });

  useEffect(() => {
    if (term) setValue("term", term);
  }, [term, setValue]);

  const onSubmitHandler: SubmitHandler<IFormInputs> = async ({
    term,
  }: IFormInputs) => {
    console.log("Search term submitted:", term);

    onSubmit(term.trim())
  };

  return (
    <div
      id="SearchBar"
      className={containerStyles({
        fullWidth,
        commandPalette: !!commandPalette,
      })}
      {...props}
    >
      <div className="rounded-full">
        <form onSubmit={handleSubmit(onSubmitHandler)}>
          <div className="flex">
            <Controller
              name="term"
              control={control}
              render={({ field }) => (
                <>
                  <TextInput
                    id="term"
                    autoFocus
                    type="search"
                    sizing="md"
                    color="custom"
                    placeholder={
                      placeholder || t("components.SearchBar.placeholder")
                    }
                    autoComplete="off"
                    list="autocompleteOff"
                    theme={{
                      base: "flex w-full xl:max-w-4xl",
                      field: {
                        input: {
                          base: "block w-full border disabled:cursor-not-allowed disabled:opacity-50 text-start sm:text-center text-lg",
                          colors: {
                            custom:
                              "border-zinc-400 bg-indigo-50 text-zinc-900 focus:border-cyan-500 focus:ring-zinc-500 dark:border-zinc-900 sm:dark:border-zinc-800 dark:bg-zinc-900 sm:dark:bg-zinc-800 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 dark:focus:border-lime-500 dark:focus:ring-lime-500",
                          },
                          withAddon: {
                            off: "rounded-lg sm:rounded-full",
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
      </div>

      {commandPalette && (
        <details className="flex flex-col justify-start">
          <summary className="text-xs text-left px-2 pt-2 text-indigo-500 dark:text-lime-400 hover:cursor-pointer">
            {t("components.SearchBar.commandPalette.title")}
          </summary>

          {commandPalette}
        </details>
      )}
    </div>
  );
}

const commandPaletteContentStyles = cva(
  "flex flex-col absolute left-0 gap-8 max-h-[250px] overflow-y-auto bg-indigo-50 dark:bg-zinc-800 rounded-lg p-2 mt-4 border-2 border-zinc-300 dark:border-zinc-500 scrollbar w-full shadow-lg dark:shadow-zinc-900",
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
  "flex flex-col gap-0 mb-1 hover:bg-indigo-100 dark:hover:bg-zinc-700 w-full group",
  {
    variants: {
      disabled: {
        true: "opacity-80 cursor-not-allowed",
        false: "hover:text-indigo-500 dark:hover:text-lime-400",
      },
    },
    defaultVariants: {
      disabled: false,
    },
  }
);

const commandPaletteItemButtonStyles = cva(
  "flex flex-col sm:flex-row justify-start text-gray-700 dark:text-gray-300 items-start sm:items-center gap-1 sm:gap-3 ml-3",
  {
    variants: {
      disabled: {
        true: "opacity-50 cursor-not-allowed",
        false:
          "hover:text-indigo-500 dark:hover:text-lime-400 group-hover:text-indigo-500 dark:group-hover:text-lime-400 group-hover:cursor-pointer",
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
  return (
    <div
      className={commandPaletteItemStyles({ disabled })}
      onClick={() => !disabled && onClick(command)}
    >
      <div className={commandPaletteItemButtonStyles({ disabled })}>
        <span className="font-semibold">{brief}</span>
        <span className="ml-2">{command}</span>
      </div>

      <div className="ml-5 text-left">
        {description && (
          <Typography as="small" decoration="smooth" margin="none">
            {description}
          </Typography>
        )}
      </div>
    </div>
  );
}

const SearchBar = Object.assign(Container, {
  Content: CommandPaletteContent,
  Item: CommandPaletteItem,
});

export default SearchBar;
