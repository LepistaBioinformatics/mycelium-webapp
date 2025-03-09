import { CiEdit } from "react-icons/ci";
import { VscEye } from "react-icons/vsc";
import { components } from "@/services/openapi/mycelium-schema";
import { cva, VariantProps } from "class-variance-authority";
import { Tooltip } from "flowbite-react";

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
  ignoreTooltip?: boolean
}


export default function PermissionIcon({ permission, size, ignoreTooltip }: Props) {
  const HandleTooltip = (children: React.ReactNode, content: string) => {
    if (ignoreTooltip) return children;

    return (
      <Tooltip
        className="px-2 text-blue-800 dark:text-lime-400 bg-blue-100 dark:bg-slate-700 border-2 border-white dark:border-lime-500"
        content={content}
      >
        {children}
      </Tooltip>
    );
  }

  switch (permission) {
    case "read":
      return HandleTooltip(<VscEye className={styles({ size, color: permission })} />, "Read");
    case "write":
      return HandleTooltip(<CiEdit className={styles({ size, color: permission })} />, "Write");
    case "readWrite":
      return HandleTooltip(<CiEdit className={styles({ size, color: permission })} />, "Read/Write");
  }
}
