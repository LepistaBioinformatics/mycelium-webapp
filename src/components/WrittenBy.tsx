import { components } from "@/services/openapi/mycelium-schema";
import IntroSection from "@/components/ui/IntroSection";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { FaExternalLinkAlt } from "react-icons/fa";
import useAccountDetailsLink from "@/hooks/use-account-details-link";

type WrittenByType = components["schemas"]["WrittenBy"];

interface Props {
  writtenBy?: WrittenByType | null;
  action: "created" | "updated";
}

export default function WrittenBy({ writtenBy, action }: Props) {
  const { t } = useTranslation();

  const accountDetailsLink = useAccountDetailsLink();

  const key = `components.WrittenBy.${action}_by`;

  if (writtenBy?.from === "account") {
    return (
      <IntroSection.Item prefix={t(`${key}.prefix`)} title={t(`${key}.title`)}>
        <Link
          to={accountDetailsLink(writtenBy?.id ?? "")}
          className="text-blue-500 hover:underline"
          title={`Account: ${writtenBy?.id}`}
        >
          <FaExternalLinkAlt className="inline text-brand-violet-500 dark:text-brand-violet-500" />
        </Link>
      </IntroSection.Item>
    );
  }

  return null;
}
