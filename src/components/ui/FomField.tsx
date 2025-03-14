import { cva, VariantProps } from "class-variance-authority";
import { Label } from "flowbite-react";
import Typography from "./Typography";

const styles = cva("flex flex-col text-left gap-1 my-2", {
  variants: {
    width: {
      full: "w-full",
      half: "w-1/2",
      quarter: "w-1/4",
    },
  },
  defaultVariants: {
    width: "full",
  },
});

interface Props extends BaseProps, VariantProps<typeof styles> {
  id?: string;
  title?: string;
  label: string;
}

export default function FormField({ label, title, children, width, id, ...props }: Props) {
  return (
    <div className={styles({ width })} {...props}>
      <Label htmlFor={id ?? label}>
        <Typography as="small" decoration="smooth" title={title}>
          {label}
        </Typography>
      </Label>
      {children}
    </div>
  );
}
