import { CiEdit } from "react-icons/ci";
import { VscEye } from "react-icons/vsc";
import { components } from "@/services/openapi/mycelium-schema";
import { cva, VariantProps } from "class-variance-authority";

type Permission = components["schemas"]["Permission"];

const styles = cva("", {
  variants: {
    size: {
      sm: "text-xl",
      md: "text-2xl",
      lg: "text-3xl"
    },
    color: {
      read: "text-green-500",
      write: "text-blue-500",
      readWrite: "text-yellow-500"
    }
  },
  defaultVariants: {
    size: "md",
    color: "read"
  },
});

interface Props extends BaseProps, VariantProps<typeof styles> {
  permission: Permission,
}


export default function PermissionIcon({ permission, size }: Props) {
  switch (permission) {
    case "read":
      return <VscEye className={styles({ size, color: permission })} />;
    case "write":
      return <CiEdit className={styles({ size, color: permission })} />;
    case "readWrite":
      return <CiEdit className={styles({ size, color: permission })} />;
  }
}
