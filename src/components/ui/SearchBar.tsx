import { cva, VariantProps } from "class-variance-authority";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { TextInput } from "flowbite-react";

const containerStyles = cva("mx-auto my-12 sticky top-0", {
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

const inputStyles = cva("", {
  variants: {
    fullWidth: {
      true: "w-[100%]",
      false: "w-full xl:max-w-4xl",
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
  onSubmit: (term?: string, tag?: string) => void;
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
  }: IFormInputs) => {
    if (term.startsWith("#")) {
      onSubmit(undefined, term.trim().slice(1));
      return;
    }

    onSubmit(term);
  };

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
                  placeholder={placeholder || "Type to search..."}
                  autoComplete="off"
                  list="autocompleteOff"
                  className={inputStyles({ fullWidth })}
                  theme={{
                    field: {
                      input: {
                        base: "block w-full disabled:cursor-not-allowed disabled:opacity-50",
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
