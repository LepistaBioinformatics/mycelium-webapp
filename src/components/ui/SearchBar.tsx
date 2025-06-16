import { cva, VariantProps } from "class-variance-authority";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { TextInput } from "flowbite-react";
import { useEffect } from "react";
import Typography from "./Typography";

const containerStyles = cva("mx-auto sticky top-2 bg-white dark:bg-gray-700 shadow z-50", {
  variants: {
    commandPalette: {
      true: "rounded-lg p-2 border border-slate-200 dark:border-slate-600 w-full",
      false: "rounded-full"
    },
    fullWidth: {
      true: "w-[100%]",
      false: "mx-auto w-full xl:max-w-4xl"
    },
    tiny: {
      true: "mt-2 mb-8",
      false: "my-12"
    }
  },
  defaultVariants: {
    fullWidth: false,
    tiny: false,
  },
});

interface IFormInputs {
  term: string;
}

export interface SearchProps extends BaseProps, VariantProps<typeof containerStyles> {
  term?: string;
  onSubmit: (term?: string) => void;
  setSkip?: (skip: number) => void;
  setPageSize?: (pageSize: number) => void;
  placeholder?: string;
  commandPalette?: any;
}

function Container({
  fullWidth,
  term,
  onSubmit,
  setSkip,
  setPageSize,
  placeholder,
  tiny,
  commandPalette,
  ...props
}: SearchProps) {
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
  }: IFormInputs) => onSubmit(term);

  return (
    <div id="SearchBar"
      className={containerStyles({ fullWidth, tiny, commandPalette: !!commandPalette })}
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
                    sizing={tiny ? "sm" : "lg"}
                    color="custom"
                    placeholder={placeholder || "Type to search..."}
                    autoComplete="off"
                    list="autocompleteOff"
                    theme={{
                      base: "flex w-full xl:max-w-4xl",
                      field: {
                        input: {
                          base: "block w-full border disabled:cursor-not-allowed disabled:opacity-50 text-center text-lg",
                          colors: {
                            custom: "border-slate-400 bg-blue-50 text-slate-900 focus:border-cyan-500 focus:ring-slate-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white placeholder-slate-500  dark:placeholder-slate-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500",
                          },
                          withAddon: {
                            off: "rounded-full"
                          },
                        }
                      }
                    }}
                    {...field}
                  />
                  <p className="text-sm text-red-500">{errors?.term?.message}</p>
                </>
              )}
            />

            <input type="submit" className="hidden" />
          </div>
        </form>
      </div>

      {commandPalette && (
        <details className="flex flex-col justify-start">
          <summary className="text-xs text-left px-2 pt-2 text-blue-500 dark:text-lime-400 hover:cursor-pointer">
            Command Palette
          </summary>

          {commandPalette}
        </details>
      )}
    </div>
  );
}

const commandPaletteContentStyles = cva("flex flex-col absolute left-0 gap-8 max-h-[250px] overflow-y-auto bg-blue-50 dark:bg-gray-800 rounded-lg p-2 mt-4 border-2 border-slate-300 dark:border-slate-500 scrollbar w-full shadow-lg dark:shadow-slate-900", {
  variants: {},
  defaultVariants: {},
});

interface CommandPaletteContentProps extends VariantProps<typeof commandPaletteContentStyles> {
  children: React.ReactNode;
}

function CommandPaletteContent({
  children,
}: CommandPaletteContentProps) {
  return <div className={commandPaletteContentStyles()}>{children}</div>;
}

const commandPaletteItemStyles = cva("flex flex-col gap-0 mb-1 hover:bg-blue-100 dark:hover:bg-gray-700 w-full group", {
  variants: {
    disabled: {
      true: "opacity-80 cursor-not-allowed",
      false: "hover:text-blue-500 dark:hover:text-lime-400"
    }
  },
  defaultVariants: {
    disabled: false
  },
});

const commandPaletteItemButtonStyles = cva("flex justify-start text-gray-700 dark:text-gray-300 items-center gap-3 ml-3", {
  variants: {
    disabled: {
      true: "opacity-50 cursor-not-allowed",
      false: "hover:text-blue-500 dark:hover:text-lime-400 group-hover:text-blue-500 dark:group-hover:text-lime-400 group-hover:cursor-pointer"
    }
  },
  defaultVariants: {
    disabled: false
  },
});

interface CommandPaletteItemProps extends VariantProps<typeof commandPaletteItemStyles> {
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
    <div className={commandPaletteItemStyles({ disabled })}>
      <div
        className={commandPaletteItemButtonStyles({ disabled })}
        onClick={() => !disabled && onClick(command)}
      >
        <span>{command}</span>
        <span className="font-semibold">{brief}</span>
      </div>

      <div className="ml-8 text-left">
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
