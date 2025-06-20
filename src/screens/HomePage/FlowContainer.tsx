//
// Flow Container
//
// Container used to animate the show/hide a child component. The show/hide
// should be animated using the `fadeIn` animation.
//
// The container should be hidden by default.
//

import { cva, VariantProps } from "class-variance-authority";

export const flowContainerStyles = cva("w-full p-3 h-[calc(100vh-10rem)]", {
  variants: {
    show: {
      true: "block animate-fadeIn",
      false: "hidden animate-fadeOut",
    },
  },
  defaultVariants: {
    show: false,
  },
});

interface Props extends BaseProps, VariantProps<typeof flowContainerStyles> {}

export default function FlowContainer({ show, children }: Props) {
  return <div className={flowContainerStyles({ show })}>{children}</div>;
}
