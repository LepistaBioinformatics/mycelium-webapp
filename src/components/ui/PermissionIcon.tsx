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
      lg: "text-3xl",
    },
    color: {
      read: "text-green-500",
      write: "text-yellow-400 dark:text-yellow-500",
    },
    inline: {
      true: "inline",
    },
  },
  defaultVariants: {
    size: "md",
    color: "read",
    inline: true,
  },
});

interface Props extends BaseProps, VariantProps<typeof styles> {
  permission: Permission;
}

export default function PermissionIcon({ permission, size, inline }: Props) {
  const HandleTooltip = ({
    children,
    content,
  }: BaseProps & { content: string }) => {
    return (
      <span
        title={content}
        className="p-1 text-indigo-800 dark:text-lime-400 cursor-help"
      >
        {children}
      </span>
    );
  };

  switch (permission) {
    case "read":
      return (
        <HandleTooltip content="Read">
          <VscEye className={styles({ size, color: permission, inline })} />
        </HandleTooltip>
      );
    case "write":
      return (
        <HandleTooltip content="Write">
          <CiEdit className={styles({ size, color: permission, inline })} />
        </HandleTooltip>
      );
  }
}
