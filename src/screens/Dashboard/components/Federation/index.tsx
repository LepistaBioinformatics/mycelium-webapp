import AuthorizedOr from "@/components/ui/AuthorizedOr";
import PageBody from "@/components/ui/PageBody";
import VerticalTabNav, {
  VerticalTabNavItem,
} from "@/components/ui/VerticalTabNav";
import useProfile from "@/hooks/use-profile";
import { useTranslation } from "react-i18next";
import { MdHub, MdLink, MdTranslate, MdVerified } from "react-icons/md";
import { useSearchParams } from "react-router";
import ControlPanelBreadcrumbItem from "../ControlPanelBreadcrumbItem";
import AssertionsTab from "./AssertionsTab";
import LinksTab from "./LinksTab";
import PeersTab from "./PeersTab";
import { PREFIX } from "./shared";
import TranslationsTab from "./TranslationsTab";

const TABS = ["peers", "links", "assertions", "translations"] as const;
type Tab = (typeof TABS)[number];

const NAV_ITEMS: VerticalTabNavItem[] = [
  { tab: "peers", labelKey: `${PREFIX}.tabs.peers`, icon: <MdHub size={16} /> },
  { tab: "links", labelKey: `${PREFIX}.tabs.links`, icon: <MdLink size={16} /> },
  {
    tab: "assertions",
    labelKey: `${PREFIX}.tabs.assertions`,
    icon: <MdVerified size={16} />,
  },
  {
    tab: "translations",
    labelKey: `${PREFIX}.tabs.translations`,
    icon: <MdTranslate size={16} />,
  },
];

/** Staff-only operator screens for instance federation (FED-36) */
export default function Federation() {
  const { t } = useTranslation();
  const { profile, isLoadingUser, isLoadingProfile } = useProfile();
  const [searchParams, setSearchParams] = useSearchParams();

  const requested = searchParams.get("tab");
  const activeTab: Tab = TABS.includes(requested as Tab)
    ? (requested as Tab)
    : "peers";

  return (
    <PageBody padding="md" width="full">
      <PageBody.Breadcrumb>
        <ControlPanelBreadcrumbItem />
        <PageBody.Breadcrumb.Item icon={MdHub}>
          {t(`${PREFIX}.title`)}
        </PageBody.Breadcrumb.Item>
      </PageBody.Breadcrumb>

      <PageBody.Content padding="md" container flex="col" gap={12}>
        <AuthorizedOr
          authorized={profile?.isStaff}
          isLoading={isLoadingUser || isLoadingProfile}
        >
          <div className="flex flex-col sm:flex-row gap-0 w-full h-full">
            <VerticalTabNav
              items={NAV_ITEMS}
              activeTab={activeTab}
              onSelect={(tab) => setSearchParams({ tab })}
              t={t}
            />

            <div className="flex-1 min-w-0 pt-4 sm:pt-0 sm:pl-6">
              {activeTab === "peers" && <PeersTab />}
              {activeTab === "links" && <LinksTab />}
              {activeTab === "assertions" && <AssertionsTab />}
              {activeTab === "translations" && <TranslationsTab />}
            </div>
          </div>
        </AuthorizedOr>
      </PageBody.Content>
    </PageBody>
  );
}
