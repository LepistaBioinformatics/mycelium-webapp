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

export default function GuestRoleDetails({ isOpen, onClose, guestRole, mutateGuestRoles }: Props) {
  const [openedSection, setOpenedSection] = useState<OpenedSection>(OpenedSection.Details);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRegisterChildModalOpen, setIsRegisterChildModalOpen] = useState(false);

  const handleToggleSection = (section: OpenedSection, state: "open" | "closed") => {
    if (state === "open") setOpenedSection(section);
  }

  const handleEditFinish = () => {
    setIsEditModalOpen(false);
    mutateGuestRoles();
  }

  const children = useMemo(
    () => getChildren(guestRole?.children),
    [guestRole?.children]
  );

  return (
    <SideCurtain
      open={isOpen}
      title="Guest role details"
      handleClose={onClose}
    >
      {guestRole && (
        <IntroSection
          prefix="Seeing"
          content={(
            <>
              <span>{guestRole.name}</span>
              <PermissionIcon permission={guestRole.permission} />
            </>
          )}
          title="Guest role name"
        />
      )}

      <DetailsBox
        open={openedSection === OpenedSection.Details}
        onToggle={(state) => handleToggleSection(OpenedSection.Details, state)}
      >
        <DetailsBox.Summary>
          <Typography as="span">
            Details
          </Typography>
        </DetailsBox.Summary>

        <DetailsBox.Content minHeight="50">
          <div className="flex flex-col gap-8">
            <div>
              <Typography
                as="span"
                decoration="smooth"
                title="The slug of the guest role. Use this slug to setup guest roles in downstream systems and services"
              >
                Guest Role Slug
              </Typography>
              <Typography as="div">
                <div className="flex items-center gap-2 group group/clip">
                  {guestRole.slug}
                  <CopyToClipboard text={guestRole.slug} inline groupHidden />
                </div>
              </Typography>
            </div>

            <div>
              <Typography as="span" decoration="smooth">Description</Typography>
              <Typography as="p">{guestRole.description}</Typography>
            </div>

            <div>
              <Typography
                as="span"
                decoration="smooth"
                title="Is this a system guest role?"
              >
                System Guest Role
              </Typography>
              <Typography as="p" uppercase>
                {guestRole.system ? "Yes" : "No"}
              </Typography>
            </div>

            <div>
              <Typography
                as="span"
                decoration="smooth"
                title="What can do users with this role?"
              >
                Permission
              </Typography>
              <Typography as="p" uppercase>
                {guestRole.permission}
              </Typography>
            </div>

            <div>
              <Typography as="span" decoration="smooth">Guest Role ID</Typography>
              <Typography as="p">
                <span className="flex items-center gap-2 group group/clip">
                  {guestRole.id}
                  <CopyToClipboard text={guestRole.id ?? ""} groupHidden />
                </span>
              </Typography>
            </div>
          </div>
        </DetailsBox.Content>
      </DetailsBox>

      {children && (
        <DetailsBox
          open={openedSection === OpenedSection.Children}
          onToggle={(state) => handleToggleSection(OpenedSection.Children, state)}
        >
          <DetailsBox.Summary>
            <Typography as="span">
              Children roles
            </Typography>
          </DetailsBox.Summary>

          <DetailsBox.Content minHeight="50">
            <div className="flex flex-col gap-8">
              {children?.map((child) => (
                <div key={child.id}>{child.name}</div>
              ))}
            </div>
          </DetailsBox.Content>
        </DetailsBox>
      )}

      <DetailsBox
        open={openedSection === OpenedSection.AdvancedActions}
        onToggle={(state) => handleToggleSection(OpenedSection.AdvancedActions, state)}
      >
        <DetailsBox.Summary>
          <Typography as="span">
            Advanced actions
          </Typography>
        </DetailsBox.Summary>

        <DetailsBox.Content minHeight="50">
          <Banner intent="info">
            <div className="flex justify-between gap-2 my-5">
              <div className="flex flex-col gap-2">
                <Typography as="span">
                  Edit guest role
                </Typography>

                <Typography as="small" decoration="smooth">
                  Edit the guest role details.
                </Typography>
              </div>

              <div>
                <Button rounded intent="info" onClick={() => setIsEditModalOpen(true)}>
                  Edit
                </Button>
              </div>
            </div>
          </Banner>

          <Banner intent="info">
            <div className="flex justify-between gap-2 my-5">
              <div className="flex flex-col gap-2">
                <Typography as="span">
                  Register guest role child
                </Typography>

                <Typography as="small" decoration="smooth">
                  Register a new guest role as a child of the current guest role.
                </Typography>
              </div>

              <div>
                <Button rounded intent="info" onClick={() => setIsRegisterChildModalOpen(true)}>
                  Register
                </Button>
              </div>
            </div>
          </Banner>

          <Banner intent="error">
            <div className="flex justify-between gap-2 my-5">
              <div className="flex flex-col gap-2">
                <Typography as="span">
                  Delete guest role
                </Typography>

                <Typography as="small" decoration="smooth">
                  This action cannot be undone.
                </Typography>
              </div>

              <div>
                <Button rounded intent="danger" onClick={() => setIsDeleteModalOpen(true)}>
                  Delete
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
  )
}

function getChildren(children: GuestRole["children"]) {
  if (children && "records" in children) {
    return children.records;
  }

  return null;
}
