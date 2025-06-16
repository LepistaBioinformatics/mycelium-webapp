"use client";

import { cva, VariantProps } from "class-variance-authority";

const styles = cva("sm:hidden", {
  variants: {},
});

interface Props extends VariantProps<typeof styles> {}

export default function MobileNavbar({}: Props) {
  return <div className={styles({})}>MobileNavbar</div>;
}
