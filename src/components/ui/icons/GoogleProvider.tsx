import { cva, VariantProps } from "class-variance-authority";
import { FcGoogle } from "react-icons/fc";

const styles = cva("flex justify-center", {
  variants: {
    size: {
      sm: "text-2xl",
      md: "text-3xl",
      lg: "text-4xl",
    }
  },
  defaultVariants: {
    size: "md",
  },
});

interface Props extends BaseProps, VariantProps<typeof styles> { }

export function GoogleProvider({ size, ...props }: Props) {
  return (
    <span className={styles({ size })} {...props}>
      <FcGoogle className="mt-1" /><span>oogle</span>
    </span>
  )
}
