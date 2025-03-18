import Button from "@/components/ui/Button";
import SideCurtain from "@/components/ui/SideCurtain";
import Typography from "@/components/ui/Typography";
import { components } from "@/services/openapi/mycelium-schema";
import Banner from "@/components/ui/Banner";
import DetailsBox from "@/components/ui/DetailsBox";
import { useState } from "react";
import CopyToClipboard from "@/components/ui/CopyToClipboard";
import DeleteGuestRole from "./DeleteGuestRole";
import EditGuestRoleModal from "./EditGuestRoleModal";

type GuestRole = components["schemas"]["GuestRole"];

interface Props {
  guestRole: GuestRole;
  isOpen: boolean;
  onClose: () => void;
  mutateGuestRoles: () => void;
}

enum OpenedSection {
  Details,
  AdvancedActions,
}

export default function GuestRoleDetails({ isOpen, onClose, guestRole, mutateGuestRoles }: Props) {
  const [openedSection, setOpenedSection] = useState<OpenedSection>(OpenedSection.Details);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleToggleSection = (section: OpenedSection, state: "open" | "closed") => {
    if (state === "open") setOpenedSection(section);
  }

  const handleEditFinish = () => {
    setIsEditModalOpen(false);
    mutateGuestRoles();
  }

  return (
    <SideCurtain
      open={isOpen}
      title="Guest role details"
      handleClose={onClose}
    >
      {guestRole && (
        <div className="flex items-baseline gap-2 -mb-1">
          <Typography as="span" decoration="smooth">Seeing</Typography>
          <Typography as="h2" title="Guest role name">
            {guestRole.name}
          </Typography>
        </div>
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
                <div className="flex items-center gap-2 group">
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
                <span className="flex items-center gap-2 group">
                  {guestRole.id}
                  <CopyToClipboard text={guestRole.id ?? ""} groupHidden />
                </span>
              </Typography>
            </div>
          </div>
        </DetailsBox.Content>
      </DetailsBox>

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
    </SideCurtain>
  )
}
