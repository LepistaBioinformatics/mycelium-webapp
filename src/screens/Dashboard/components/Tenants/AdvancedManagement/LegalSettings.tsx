import Card from "@/components/ui/Card";
import IntroSection from "@/components/ui/IntroSection";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import { components } from "@/services/openapi/mycelium-schema";
import { useMemo, useState } from "react";
import { MdEdit } from "react-icons/md";
import EditMetadataModal from "./EditMetadataModal";

type Tenant = components["schemas"]["Tenant"];
type TenantMetaKey = components["schemas"]["TenantMetaKey"];

interface Props {
  tenant: Tenant,
  mutateTenantStatus: () => void,
}

export default function LegalSettings({ tenant }: Props) {
  const [isEditMetadataModalOpen, setIsEditMetadataModalOpen] = useState(false);
  const [editMetadataKey, setEditMetadataKey] = useState<TenantMetaKey | null>(null);
  const [editMetadataValue, setEditMetadataValue] = useState<string | null>(null);

  const { hasEnoughPermissions } = useProfile({
    tenantOwnerNeeded: [tenant.id ?? ""],
  });

  const handleEditMetadata = (key: TenantMetaKey, value: string) => {
    setEditMetadataKey(key);
    setEditMetadataValue(value);
    setIsEditMetadataModalOpen(true);
  }

  const frrWithType = useMemo(() => {
    if (!tenant?.meta) return null;

    const frr = tenant?.meta?.["federal_revenue_register"];
    const frrType = tenant?.meta?.["federal_revenue_register_type"];

    if (!frr || !frrType) return null;

    return `${frr} (${frrType})`;
  }, [tenant?.meta]);

  const country = useMemo(() => {
    if (!tenant?.meta) return null;

    return tenant?.meta?.["country"];
  }, [tenant?.meta]);

  const state = useMemo(() => {
    if (!tenant?.meta) return null;

    return tenant?.meta?.["state"];
  }, [tenant?.meta]);

  const city = useMemo(() => {
    if (!tenant?.meta) return null;

    return tenant?.meta?.["city"];
  }, [tenant?.meta]);

  const address1 = useMemo(() => {
    if (!tenant?.meta) return null;

    return tenant?.meta?.["address1"];
  }, [tenant?.meta]);

  const address2 = useMemo(() => {
    if (!tenant?.meta) return null;

    return tenant?.meta?.["address2"];
  }, [tenant?.meta]);

  const zipCode = useMemo(() => {
    if (!tenant?.meta) return null;

    return tenant?.meta?.["zip_code"];
  }, [tenant?.meta]);

  if (!hasEnoughPermissions) {
    return null;
  }

  const NotSet = ({ metadataKey, value }: { metadataKey: TenantMetaKey, value: string }) => (
    <MdEdit
      className="cursor-pointer text-blue-500 dark:text-lime-400 hover:scale-150 transition-all duration-200"
      title="Edit"
      onClick={() => handleEditMetadata(metadataKey, value)}
    />
  );

  return (
    <>
      <Card
        minHeight="50vh"
        maxHeight="80vh"
        padding="sm"
        width="2xl"
        group
        flex1
      >
        <Card.Header>
          <Typography as="h6" decoration="smooth">
            <span>Legal information</span>
          </Typography>
        </Card.Header>

        <Card.Body>
          <IntroSection
            prefix="Name"
            content={tenant?.name}
            title="Tenant name"
            as="h3"
          >
            <IntroSection.Item
              prefix="FRR"
              title="Federal Revenue Register"
              fullWidth
              linkLine
            >
              {frrWithType
                ? <span>{frrWithType}</span>
                : <NotSet metadataKey="federal_revenue_register" value={frrWithType ?? ""} />}
            </IntroSection.Item>

            <IntroSection.Item
              prefix="Country"
              title="Country"
              fullWidth
              linkLine
            >
              {country
                ? <span>{country}</span>
                : <NotSet metadataKey="country" value={country ?? ""} />}
            </IntroSection.Item>

            <IntroSection.Item
              prefix="State"
              title="State"
              fullWidth
              linkLine
            >
              {state
                ? <span>{state}</span>
                : <NotSet metadataKey="state" value={state ?? ""} />}
            </IntroSection.Item>

            <IntroSection.Item
              prefix="City"
              title="City"
              fullWidth
              linkLine
            >
              {city
                ? <span>{city}</span>
                : <NotSet metadataKey="city" value={city ?? ""} />}
            </IntroSection.Item>

            <IntroSection.Item
              prefix="Address 1"
              title="Address 1"
              fullWidth
              linkLine
            >
              {address1
                ? <span>{address1}</span>
                : <NotSet metadataKey="address1" value={address1 ?? ""} />}
            </IntroSection.Item>

            <IntroSection.Item
              prefix="Address 2"
              title="Address 2"
              fullWidth
              linkLine
            >
              {address2
                ? <span>{address2}</span>
                : <NotSet metadataKey="address2" value={address2 ?? ""} />}
            </IntroSection.Item>

            <IntroSection.Item
              prefix="Zip code"
              title="Zip code"
              fullWidth
              linkLine
            >
              {zipCode
                ? <span>{zipCode}</span>
                : <NotSet metadataKey="zip_code" value={zipCode ?? ""} />}
            </IntroSection.Item>
          </IntroSection>
        </Card.Body>
      </Card>

      {tenant.id && (
        <EditMetadataModal
          isOpen={isEditMetadataModalOpen}
          onClose={() => setIsEditMetadataModalOpen(false)}
          onSuccess={() => {
            setIsEditMetadataModalOpen(false);
            setEditMetadataKey(null);
            setEditMetadataValue(null);
          }}
          tenantId={tenant.id}
          editMetadataKey={editMetadataKey}
          editMetadataValue={editMetadataValue}
        />
      )}
    </>
  )
}
