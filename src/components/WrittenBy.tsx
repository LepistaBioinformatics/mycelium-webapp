import { components } from "@/services/openapi/mycelium-schema";
import IntroSection from "@/components/ui/IntroSection";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { FaExternalLinkAlt } from "react-icons/fa";

type WrittenByType = components["schemas"]["Modifier"];

interface Props {
  writtenBy?: WrittenByType | null;
  action: "created" | "updated";
}

export default function WrittenBy({ writtenBy, action }: Props) {
  const { t } = useTranslation();

  const key = `components.WrittenBy.${action}_by`;

  if (writtenBy?.from === "account") {
    return (
      <IntroSection.Item
        prefix={t(`${key}.prefix`)}
        title={t(`${key}.title`)}
      >
        <Link
          to={`/dashboard/accounts/?accountId=${writtenBy?.id}`}
          className="text-blue-500 hover:underline"
          title={`Account: ${writtenBy?.id}`}
        >
          <FaExternalLinkAlt className="inline text-indigo-500 dark:text-lime-500" />
        </Link>
      </IntroSection.Item>
    );
  }

  return null;
}
