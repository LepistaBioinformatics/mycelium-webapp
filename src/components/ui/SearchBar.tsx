import { cva, VariantProps } from "class-variance-authority";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { TextInput } from "flowbite-react";

const containerStyles = cva("mx-auto my-12 sticky top-0 rounded-full shadow", {
  variants: {
    fullWidth: {
      true: "w-[100%]",
      false: "mx-auto w-full xl:max-w-4xl"
    },
  },
  defaultVariants: {
    fullWidth: false,
  },
});

interface IFormInputs {
  term: string;
}

export interface SearchProps extends BaseProps, VariantProps<typeof containerStyles> {
  onSubmit: (term?: string) => void;
  setSkip?: (skip: number) => void;
  setPageSize?: (pageSize: number) => void;
  placeholder?: string;
}

export default function SearchBar({
  fullWidth,
  onSubmit,
  setSkip,
  setPageSize,
  placeholder,
  ...props
}: SearchProps) {

  const {
    formState: { errors },
    handleSubmit,
    control,
  } = useForm<IFormInputs>({
    defaultValues: {
      term: "",
    },
  });

  const onSubmitHandler: SubmitHandler<IFormInputs> = async ({
    term,
  }: IFormInputs) => onSubmit(term);

  return (
    <div id="SearchBar" className={containerStyles({ fullWidth })} {...props}>
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
                  sizing="lg"
                  color="custom"
                  placeholder={placeholder || "Type to search..."}
                  autoComplete="off"
                  list="autocompleteOff"
                  theme={{
                    base: "flex w-full xl:max-w-4xl",
                    field: {
                      input: {
                        base: "block w-full border disabled:cursor-not-allowed disabled:opacity-50",
                        colors: {
                          custom: "border-slate-400 bg-white text-slate-900 focus:border-cyan-500 focus:ring-slate-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white placeholder-slate-500  dark:placeholder-slate-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500",
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
  );
}
