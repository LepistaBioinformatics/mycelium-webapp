import Button from "@/components/ui/Button";
import SideCurtain from "@/components/ui/SideCurtain";
import Typography from "@/components/ui/Typography";
import { components } from "@/services/openapi/mycelium-schema";
import Banner from "@/components/ui/Banner";
import DetailsBox from "@/components/ui/DetailsBox";
import { useMemo, useState } from "react";
import CopyToClipboard from "@/components/ui/CopyToClipboard";
import DeleteGuestRole from "./DeleteGuestRole";
import EditGuestRoleModal from "./EditGuestRoleModal";
import RegisterGuestRoleChild from "./RegisterGuestRoleChild";
import PermissionIcon from "@/components/ui/PermissionIcon";
import IntroSection from "@/components/ui/IntroSection";
import { useTranslation } from "react-i18next";

type GuestRole = components["schemas"]["GuestRole"];

interface Props {
  guestRole: GuestRole;
  isOpen: boolean;
  onClose: () => void;
  mutateGuestRoles: () => void;
}

enum OpenedSection {
  Details,
  Children,
  AdvancedActions,
}

export default function GuestRoleDetails({
  isOpen,
  onClose,
  guestRole,
  mutateGuestRoles,
}: Props) {
  const { t } = useTranslation();

  const [openedSection, setOpenedSection] = useState<OpenedSection>(
    OpenedSection.Details
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRegisterChildModalOpen, setIsRegisterChildModalOpen] =
    useState(false);

  const handleToggleSection = (
    section: OpenedSection,
    state: "open" | "closed"
  ) => {
    if (state === "open") setOpenedSection(section);
  };

  const handleEditFinish = () => {
    setIsEditModalOpen(false);
    mutateGuestRoles();
  };

  const children = useMemo(
    () => getChildren(guestRole?.children),
    [guestRole?.children]
  );

  return (
    <SideCurtain
      open={isOpen}
      title={t("screens.Dashboard.GuestRoles.GuestRoleDetails.title")}
      handleClose={onClose}
    >
      {guestRole && (
        <IntroSection
          prefix={t(
            "screens.Dashboard.GuestRoles.GuestRoleDetails.name.prefix"
          )}
          content={
            <>
              <span>{guestRole.name}</span>
              <PermissionIcon permission={guestRole.permission} />
            </>
          }
          title={t("screens.Dashboard.GuestRoles.GuestRoleDetails.name.title")}
        />
      )}

      <DetailsBox
        open={openedSection === OpenedSection.Details}
        onToggle={(state) => handleToggleSection(OpenedSection.Details, state)}
      >
        <DetailsBox.Summary>
          <Typography as="span">
            {t("screens.Dashboard.GuestRoles.GuestRoleDetails.details")}
          </Typography>
        </DetailsBox.Summary>

        <DetailsBox.Content minHeight="50">
          <div className="flex flex-col gap-8">
            <IntroSection.Item
              prefix={t(
                "screens.Dashboard.GuestRoles.GuestRoleDetails.slug.prefix"
              )}
              title={t(
                "screens.Dashboard.GuestRoles.GuestRoleDetails.slug.title"
              )}
            >
              <Typography as="div">
                <div className="flex items-center gap-2 group group/clip">
                  {guestRole.slug}
                  <CopyToClipboard text={guestRole.slug} inline groupHidden />
                </div>
              </Typography>
            </IntroSection.Item>

            <IntroSection.Item
              prefix={t(
                "screens.Dashboard.GuestRoles.GuestRoleDetails.description.prefix"
              )}
              title={t(
                "screens.Dashboard.GuestRoles.GuestRoleDetails.description.title"
              )}
            >
              <Typography as="p">{guestRole.description}</Typography>
            </IntroSection.Item>

            <IntroSection.Item
              prefix={t(
                "screens.Dashboard.GuestRoles.GuestRoleDetails.system.prefix"
              )}
              title={t(
                "screens.Dashboard.GuestRoles.GuestRoleDetails.system.title"
              )}
            >
              <Typography as="p">
                {guestRole.system
                  ? t(
                      "screens.Dashboard.GuestRoles.GuestRoleDetails.system.yes"
                    )
                  : t(
                      "screens.Dashboard.GuestRoles.GuestRoleDetails.system.no"
                    )}
              </Typography>
            </IntroSection.Item>

            <IntroSection.Item
              prefix={t(
                "screens.Dashboard.GuestRoles.GuestRoleDetails.permission.prefix"
              )}
              title={t(
                "screens.Dashboard.GuestRoles.GuestRoleDetails.permission.title"
              )}
            >
              <Typography as="p">
                {guestRole.permission.toUpperCase()}
              </Typography>
            </IntroSection.Item>

            <IntroSection.Item
              prefix={t(
                "screens.Dashboard.GuestRoles.GuestRoleDetails.id.prefix"
              )}
              title={t(
                "screens.Dashboard.GuestRoles.GuestRoleDetails.id.title"
              )}
            >
              <Typography as="p">
                <span className="flex items-center gap-2 group group/clip">
                  {guestRole.id}
                  <CopyToClipboard text={guestRole.id ?? ""} groupHidden />
                </span>
              </Typography>
            </IntroSection.Item>
          </div>
        </DetailsBox.Content>
      </DetailsBox>

      {children && (
        <DetailsBox
          open={openedSection === OpenedSection.Children}
          onToggle={(state) =>
            handleToggleSection(OpenedSection.Children, state)
          }
        >
          <DetailsBox.Summary>
            <Typography as="span">
              {t(
                "screens.Dashboard.GuestRoles.GuestRoleDetails.children.title"
              )}
            </Typography>
          </DetailsBox.Summary>

          <DetailsBox.Content minHeight="50">
            <div className="flex flex-col gap-8">
              {children?.map((child) => (
                <div key={child.id}>
                  <Typography as="p">{child.name}</Typography>
                  <Typography as="div" decoration="smooth">
                    <span className="flex items-center gap-2 group group/clip">
                      {child.id}
                      <CopyToClipboard
                        text={child.id ?? ""}
                        inline
                        groupHidden
                      />
                    </span>
                  </Typography>
                </div>
              ))}
            </div>
          </DetailsBox.Content>
        </DetailsBox>
      )}

      <DetailsBox
        open={openedSection === OpenedSection.AdvancedActions}
        onToggle={(state) =>
          handleToggleSection(OpenedSection.AdvancedActions, state)
        }
      >
        <DetailsBox.Summary>
          <Typography as="span">
            {t("screens.Dashboard.GuestRoles.GuestRoleDetails.advancedActions")}
          </Typography>
        </DetailsBox.Summary>

        <DetailsBox.Content minHeight="50">
          <Banner intent="info">
            <div className="flex justify-between gap-2 my-5">
              <div className="flex flex-col gap-2">
                <Typography as="span">
                  {t(
                    "screens.Dashboard.GuestRoles.GuestRoleDetails.edit.title"
                  )}
                </Typography>

                <Typography as="small" decoration="smooth">
                  {t(
                    "screens.Dashboard.GuestRoles.GuestRoleDetails.edit.description"
                  )}
                </Typography>
              </div>

              <div>
                <Button
                  rounded
                  intent="info"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  {t(
                    "screens.Dashboard.GuestRoles.GuestRoleDetails.edit.button"
                  )}
                </Button>
              </div>
            </div>
          </Banner>

          <Banner intent="info">
            <div className="flex justify-between gap-2 my-5">
              <div className="flex flex-col gap-2">
                <Typography as="span">
                  {t(
                    "screens.Dashboard.GuestRoles.GuestRoleDetails.registerChildRole.title"
                  )}
                </Typography>

                <Typography as="small" decoration="smooth">
                  {t(
                    "screens.Dashboard.GuestRoles.GuestRoleDetails.registerChildRole.description"
                  )}
                </Typography>
              </div>

              <div>
                <Button
                  rounded
                  intent="info"
                  onClick={() => setIsRegisterChildModalOpen(true)}
                >
                  {t(
                    "screens.Dashboard.GuestRoles.GuestRoleDetails.registerChildRole.button"
                  )}
                </Button>
              </div>
            </div>
          </Banner>

          <Banner intent="error">
            <div className="flex justify-between gap-2 my-5">
              <div className="flex flex-col gap-2">
                <Typography as="span">
                  {t(
                    "screens.Dashboard.GuestRoles.GuestRoleDetails.delete.title"
                  )}
                </Typography>

                <Typography as="small" decoration="smooth">
                  {t(
                    "screens.Dashboard.GuestRoles.GuestRoleDetails.delete.description"
                  )}
                </Typography>
              </div>

              <div>
                <Button
                  rounded
                  intent="danger"
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  {t(
                    "screens.Dashboard.GuestRoles.GuestRoleDetails.delete.button"
                  )}
                </Button>
              </div>
            </div>
          </Banner>
        </DetailsBox.Content>
      </DetailsBox>

      <DeleteGuestRole
        guestRole={guestRole}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />

      <EditGuestRoleModal
        isOpen={isEditModalOpen}
        onClose={handleEditFinish}
        onSuccess={handleEditFinish}
        guestRole={guestRole}
      />

      <RegisterGuestRoleChild
        parentRole={guestRole}
        isOpen={isRegisterChildModalOpen}
        onClose={() => setIsRegisterChildModalOpen(false)}
        onSuccess={() => setIsRegisterChildModalOpen(false)}
      />
    </SideCurtain>
  );
}

function getChildren(children: GuestRole["children"]) {
  if (children && "records" in children) {
    return children.records;
  }

  return null;
}
