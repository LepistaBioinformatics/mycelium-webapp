"use client";

import { cva, VariantProps } from "class-variance-authority";
import { IoMdSend } from "react-icons/io";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import Button from "./Button";

const styles = cva("container lg:w-[50%] w-[100%] mx-auto my-12 rounded-lg", {
  variants: {
    fullWidth: {
      true: "w-full",
      false: "max-w-lg"
    },
  },
  defaultVariants: {
    fullWidth: false,
  },
});

interface IFormInputs {
  term: string;
}

interface Props extends BaseProps, VariantProps<typeof styles> {
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
}: Props) {

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
    <div className={styles({ fullWidth })} {...props}>
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <div className="flex">
          <Controller
            name="term"
            control={control}
            render={({ field }) => (
              <>
                <input
                  id="term"
                  type="search"
                  placeholder={placeholder || "Type to search..."}
                  autoComplete="off"
                  list="autocompleteOff"
                  className="bg-slate-50 dark:bg-slate-700 text-center text-lg placeholder:text-center w-full  rounded-l-full"
                  {...field}
                />
                <p className="text-sm text-red-500">{errors?.term?.message}</p>
              </>
            )}
          />

          <Button intent="primary" role="search" rounded="right">
            <IoMdSend />
          </Button>
        </div>
      </form>
    </div>
  );
}
