import Button from "@/components/ui/Button";
import SideCurtain from "@/components/ui/SideCurtain";
import Typography from "@/components/ui/Typography";
import { formatDDMMYY } from "@/functions/format-dd-mm-yy";
import useProfile from "@/hooks/use-profile";
import { buildPath } from "@/services/openapi/mycelium-api";
import { components } from "@/services/openapi/mycelium-schema";
import { useCallback, useMemo, useState } from "react";
import DeleteTenant from "./DeleteTenant";
import { useDispatch, useSelector } from "react-redux";
import { FaExternalLinkAlt, FaRegStar, FaStar } from "react-icons/fa";
import { RootState } from "@/states/store";
import { setTenantInfo } from "@/states/tenant.state";
import Banner from "@/components/ui/Banner";
import CreateManagementAccount from "./CreateManagementAccount";
import DetailsBox from "@/components/ui/DetailsBox";
import PaginatedAccounts from "../Accounts/PaginatedAccounts";
import CopyToClipboard from "@/components/ui/CopyToClipboard";
import { Link } from "react-router";
import IntroSection from "@/components/ui/IntroSection";

type Tenant = components["schemas"]["Tenant"];

interface Props {
  tenant: Tenant;
  isOpen: boolean;
  onClose: () => void;
}

enum OpenedSection {
  Details,
  AssociatedAccounts,
  AdvancedActions,
}

export default function TenantDetails({ isOpen, onClose, tenant }: Props) {
  const { profile, getAccessTokenSilently } = useProfile();

  const [openedSection, setOpenedSection] = useState<OpenedSection>(OpenedSection.Details);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [isCreateManagementAccountModalOpen, setIsCreateManagementAccountModalOpen] = useState(false);

  const { tenantInfo } = useSelector((state: RootState) => state.tenant);

  const dispatch = useDispatch();

  const handleToggleSection = (section: OpenedSection, state: "open" | "closed") => {
    if (state === "open") setOpenedSection(section);
  }

  const setTokenPublicInformation = useCallback(async (tenantId: string | null | undefined) => {
    if (!tenantId) return;

    if (tenantInfo?.id === tenantId) {
      dispatch(setTenantInfo(null));
      return;
    };

    const token = await getAccessTokenSilently();

    await fetch(
      buildPath(
        "/adm/rs/beginners/tenants/{tenant_id}",
        { path: { tenant_id: tenantId } }
      ),
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then((res) => res.json())
      .then((data) => dispatch(setTenantInfo(data)))
      .catch((err) => console.error(err));
  }, [tenantInfo, getAccessTokenSilently]);

  const owners = useMemo(() => {
    if (!tenant) return null;

    if ("ids" in tenant.owners) {
      const tenantOwners = tenant.owners.ids;

      if (tenantOwners.includes(
        profile?.owners.find((owner) => owner.isPrincipal)?.id ?? ""
      )) {

        if (tenantOwners.length === 1) {
          return "You";
        } else {
          return <>You and {tenantOwners.length - 1} other</>
        }
      };

      return null;
    }
  }, [tenant, profile?.owners]);

  const manager = useMemo(() => {
    if (!tenant.manager) return null;

    if ("record" in tenant.manager) {
      return tenant.manager.record;
    }

    return null;
  }, [tenant.manager]);

  return (
    <SideCurtain
      open={isOpen}
      title="Tenant details"
      handleClose={onClose}
    >
      <IntroSection
        prefix="Seeing"
        content={(
          <div className="flex items-center gap-5">
            <span>{tenant.name}</span>
            <span className="cursor-pointer">
              {tenantInfo?.id === tenant.id ? (
                <FaStar
                  className="text-yellow-300"
                  onClick={() => setTokenPublicInformation(tenant.id)}
                />
              ) : (
                <FaRegStar
                  className="text-gray-500"
                  onClick={() => setTokenPublicInformation(tenant.id)}
                />
              )}
            </span>

            <Link
              to={`/dashboard/tenants/${tenant.id}`}
              title="View tenant advanced details"
              className="cursor-pointer"
            >
              <FaExternalLinkAlt size={16} />
            </Link>
          </div>
        )}
        title="Tenant name"
      >
        <IntroSection.Item
          prefix="described as"
          title="Tenant description"
        >
          {tenant.description}
        </IntroSection.Item>
      </IntroSection>

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
              <Typography as="span" decoration="smooth">Description</Typography>
              <Typography as="p">{tenant.description}</Typography>
            </div>

            <div>
              <Typography as="span" decoration="smooth">Created</Typography>
              <Typography as="p">{formatDDMMYY(new Date(tenant.created), true)}</Typography>
            </div>

            {tenant.updated && (
              <div>
                <Typography as="span" decoration="smooth">Last updated</Typography>
                <Typography as="p">{formatDDMMYY(new Date(tenant.updated), true)}</Typography>
              </div>
            )}

            {owners && (
              <div>
                <Typography as="span" decoration="smooth">Owners</Typography>
                <Typography as="p">{owners}</Typography>
              </div>
            )}

            {manager && (
              <div>
                <Typography as="span" decoration="smooth">Management account</Typography>
                <Typography as="p">{manager.name}</Typography>
              </div>
            )}

            <div>
              <Typography as="span" decoration="smooth">Tenant ID</Typography>
              <Typography as="p">
                <span className="flex items-center gap-2 group group/clip">
                  {tenant.id}
                  <CopyToClipboard text={tenant.id ?? ""} groupHidden />
                </span>
              </Typography>
            </div>
          </div>
        </DetailsBox.Content>
      </DetailsBox>

      <DetailsBox
        open={openedSection === OpenedSection.AssociatedAccounts}
        onToggle={(state) => handleToggleSection(OpenedSection.AssociatedAccounts, state)}
      >
        <DetailsBox.Summary>
          <Typography as="span">
            Associated accounts
          </Typography>
        </DetailsBox.Summary>

        {openedSection === OpenedSection.AssociatedAccounts && (
          <DetailsBox.Content minHeight="50">
            {tenant.id && <AssociatedAccounts tenantId={tenant.id} />}
          </DetailsBox.Content>
        )}
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
                  Create management account
                </Typography>

                <Typography as="small" decoration="smooth">
                  Management accounts are used to manage the tenant.
                </Typography>
              </div>

              <div>
                <Button
                  rounded
                  intent="info"
                  onClick={() => setIsCreateManagementAccountModalOpen(true)}
                >
                  Create
                </Button>
              </div>
            </div>
          </Banner>

          <Banner intent="error">
            <div className="flex justify-between gap-2 my-5">
              <div className="flex flex-col gap-2">
                <Typography as="span">
                  Delete tenant
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

      <CreateManagementAccount
        isOpen={isCreateManagementAccountModalOpen}
        tenantId={tenant.id}
        onClose={() => setIsCreateManagementAccountModalOpen(false)}
      />

      <DeleteTenant
        tenant={tenant}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </SideCurtain>
  )
}

/**
 * Renders the associated accounts of the tenant
 * 
 * @param tenantId - The tenant id
 * @returns The associated accounts of the tenant
 */
function AssociatedAccounts({ tenantId }: { tenantId: string }) {
  return (
    <PaginatedAccounts
      tiny
      tenantId={tenantId}
      padding="xs"
      initialPageSize={3}
      restrictAccountTypeTo={["subscription", "tenantManager"]}
    />
  )
}
