import { FaPlus } from "react-icons/fa";
import Button from "@/components/ui/Button";
import CopyToClipboard from "@/components/ui/CopyToClipboard";
import PageBody from "@/components/ui/PageBody";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import { components } from "@/services/openapi/mycelium-schema";
import { tenantsGetPublicInfo } from "@/services/rpc/beginners";
import { tenantsList } from "@/services/rpc/managers";
import { useCallback, useMemo, useState } from "react";
import useLoadMore from "@/hooks/use-load-more";
import TenantModal from "./TenantModal";
import DashBoardBody from "../DashBoardBody";
import useSearchBarParams from "@/hooks/use-search-bar-params";
import PaginatedContent from "../PaginatedContent";
import ListItem from "@/components/ui/ListItem";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/states/store";
import { FaRegStar, FaStar } from "react-icons/fa6";
import { setTenantInfo, setTenantIsLoading } from "@/states/tenant.state";
import { SlOrganization } from "react-icons/sl";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { MycRole } from "@/types/MyceliumRole";
import { MycPermission } from "@/types/MyceliumPermission";

type Tenant = components["schemas"]["Tenant"];

const PAGE_SIZE = 20;

export default function Tenants() {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const { tenantInfo, isLoading: isLoadingTenantInfo } = useSelector(
    (state: RootState) => state.tenant
  );

  const dispatch = useDispatch();

  const {
    isLoadingUser,
    isAuthenticated,
    getAccessTokenSilently,
    hasEnoughPermissions,
  } = useProfile({
    roles: [MycRole.TenantManager],
    permissions: [MycPermission.Read, MycPermission.Write],
    restrictSystemAccount: true,
    shouldBeManager: true,
    shouldBeStaff: true,
  });

  const { searchTerm, setSearchTerm } = useSearchBarParams({
    initialSkip: 0,
    initialPageSize: PAGE_SIZE,
  });

  const tenants = useLoadMore<Tenant>({
    baseKey:
      isAuthenticated && hasEnoughPermissions
        ? ["rpc", "managers.tenants.list", searchTerm ?? ""]
        : null,
    pageSize: PAGE_SIZE,
    fetchPage: (skip, pageSize) =>
      tenantsList(
        { skip: skip || undefined, pageSize, name: searchTerm || undefined },
        getAccessTokenSilently
      ),
  });

  const setTokenPublicInformation = useCallback(
    async (tenantId: string | null | undefined) => {
      if (!tenantId) return;

      if (isLoadingTenantInfo) return;

      if (tenantInfo?.id === tenantId) {
        dispatch(setTenantInfo(null));
        return;
      }

      dispatch(setTenantIsLoading(true));

      tenantsGetPublicInfo({ tenantId }, getAccessTokenSilently)
        .then((data) => dispatch(setTenantInfo(data)))
        .catch((err) => console.error(err))
        .finally(() => dispatch(setTenantIsLoading(false)));
    },
    [isLoadingTenantInfo, tenantInfo?.id, dispatch, getAccessTokenSilently]
  );

  const onSubmit = (term?: string) => {
    if (term !== undefined) setSearchTerm(term);

    tenants.mutate();
  };

  const handleCloseModal = () => {
    setIsNewModalOpen(false);
    tenants.mutate();
  };

  const handleSuccess = () => {
    handleCloseModal();
    tenants.mutate();
  };

  return (
    <DashBoardBody
      breadcrumb={
        <PageBody.Breadcrumb.Item icon={SlOrganization}>
          {t("screens.Dashboard.Tenants.title")}
        </PageBody.Breadcrumb.Item>
      }
      onSubmit={onSubmit}
      isLoading={isLoadingUser}
      authorized={hasEnoughPermissions}
    >
      <div
        id="TenantsContent"
        className="flex flex-col justify-center gap-4 w-full mx-auto"
      >
        <div className="flex justify-end mx-auto w-full sm:max-w-4xl">
          <Button
            onClick={() => setIsNewModalOpen(true)}
            size="sm"
            intent="link"
            disabled={!hasEnoughPermissions}
          >
            <FaPlus
              title={t("screens.Dashboard.Tenants.createTenant")}
              className="text-2xl"
            />
          </Button>
        </div>

        <PaginatedContent
          isLoading={tenants.isLoading}
          loaded={tenants.records.length}
          total={tenants.count}
          hasMore={tenants.hasMore}
          isLoadingMore={tenants.isLoadingMore}
          onLoadMore={tenants.loadMore}
        >
          {tenants.records.map((tenant) => (
            <ListItem key={tenant?.id}>
              {/* The whole row opens the tenant; the name is the keyboard
                  target, the star and copy buttons keep their own action. */}
              <div
                className="flex flex-col gap-1 cursor-pointer"
                onClick={() => navigate(`/dashboard/tenants/${tenant.id}`)}
              >
                <div className="flex justify-between items-start gap-3 group">
                  <Typography as="h3" highlight>
                    <Link
                      to={`/dashboard/tenants/${tenant.id}`}
                      title={t(
                        "screens.Dashboard.Tenants.TenantDetails.name.viewDetailsButton"
                      )}
                      className="hover:underline rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {tenant?.name}
                    </Link>
                  </Typography>
                  <div
                    className="flex gap-5"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <TenantStar
                      tenantId={tenant.id}
                      handleClick={() => setTokenPublicInformation(tenant.id)}
                    />
                    <CopyToClipboard text={tenant?.id ?? ""} />
                  </div>
                </div>
                <Typography as="span">{tenant?.description}</Typography>
              </div>
            </ListItem>
          ))}
        </PaginatedContent>
      </div>

      <TenantModal
        isOpen={isNewModalOpen}
        tenant={null}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
      />

    </DashBoardBody>
  );
}

function TenantStar({
  tenantId,
  handleClick,
}: {
  tenantId: string | null | undefined;
  handleClick: () => void;
}) {
  const { tenantInfo, isLoading: isLoadingTenantInfo } = useSelector(
    (state: RootState) => state.tenant
  );

  const style = useMemo(() => {
    if (isLoadingTenantInfo) return "cursor-not-allowed";
    if (tenantInfo?.id === tenantId) return "text-yellow-300";

    return "text-zinc-500 group-hover:text-brand-violet-400 group-hover:block cursor-pointer";
  }, [isLoadingTenantInfo, tenantInfo, tenantId]);

  return (
    <span className="cursor-pointer">
      {tenantInfo?.id === tenantId ? (
        <FaStar className={style} onClick={handleClick} />
      ) : (
        <FaRegStar className={style} onClick={handleClick} />
      )}
    </span>
  );
}
