import Card from "@/components/ui/Card";
import { MdClose, MdEdit } from "react-icons/md";
import Typography from "@/components/ui/Typography";
import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";
import { components } from "@/services/openapi/mycelium-schema";
import { useCallback, useMemo, useState } from "react";
import { TenantTagTypes } from "@/types/TenantTagTypes";
import { FileInput } from "flowbite-react";
import { buildPath } from "@/services/openapi/mycelium-api";
import useSuspenseError from "@/hooks/use-suspense-error";
import useProfile from "@/hooks/use-profile";
import { TENANT_ID_HEADER } from "@/constants/http-headers";
import { MycRole } from "@/types/MyceliumRole";
import { MycPermission } from "@/types/MyceliumPermission";

type Tenant = components["schemas"]["Tenant"];

const DIMENSIONS = {
  WIDTH: 128,
  HEIGHT: 128,
}

interface Props {
  tenant: Tenant,
  mutateTenantStatus: () => void,
}

export default function BrandCard({ tenant, mutateTenantStatus }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [updatingBrand, setUpdatingBrand] = useState(false);

  const [validationState, setValidationState] = useState<{
    state: "valid" | "invalid" | "waiting",
    message: string | null,
  }>({
    state: "waiting",
    message: null,
  });

  const { hasEnoughPermissions, getAccessTokenSilently } = useProfile({
    roles: [MycRole.TenantManager],
    permissions: [MycPermission.Write],
  });

  const { parseHttpError } = useSuspenseError();

  const brandTag = useMemo(() => {
    if (!tenant) return null;

    if (!tenant.tags) return null;

    return tenant.tags.find((tag) => tag.value === TenantTagTypes.Brand);
  }, [tenant]);

  /**
   * Handles the image upload event.
   *
   * @description This function is used to handle the input image and validate
   * its dimensions. For now, the image must be 128x128 pixels.
   *
   * @param event - The change event from the file input.
   */
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        if (img.width !== DIMENSIONS.WIDTH || img.height !== DIMENSIONS.HEIGHT) {
          setPreview(null);
          setValidationState({
            state: "invalid",
            message: `The image must be ${DIMENSIONS.WIDTH}x${DIMENSIONS.HEIGHT} pixels.`,
          });
          return;
        }

        setPreview(e.target?.result as string);
        setValidationState({
          state: "valid",
          message: null,
        });
      };
      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  /**
   * Converts a blob to a base64 string.
   *
   * @param blob - The blob to convert.
   * @returns The base64 string.
   */
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  /**
   * Converts a preview image to a base64 string.
   *
   * @returns The base64 string.
   */
  const convertPreviewToBase64 = useCallback(async () => {
    if (!preview) return null;

    const response = await fetch(preview);
    const blob = await response.blob();
    return await blobToBase64(blob) as string;
  }, [preview]);

  /**
   * Returns the method and url for the brand tag update.
   *
   * @returns The method and url.
   */
  const { method, url } = useMemo(() => {
    if (updatingBrand && brandTag?.id) {
      return {
        method: "PUT",
        url: buildPath("/adm/rs/tenant-manager/tags/{tag_id}", { path: { tag_id: brandTag.id } })
      }
    }

    return {
      method: "POST",
      url: buildPath("/adm/rs/tenant-manager/tags")
    }
  }, [updatingBrand, brandTag]);

  /**
   * Converts a file to a base64 string.
   *
   * @returns The base64 string.
   */
  const convertFileToBase64 = useCallback(async () => {
    setIsUploading(true);

    if (!preview) {
      setIsUploading(false);
      return;
    }

    if (!tenant.id) {
      setIsUploading(false);
      return;
    }

    const token = await getAccessTokenSilently();

    const response = await fetch(
      url,
      {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          [TENANT_ID_HEADER]: tenant.id
        },
        body: JSON.stringify({
          value: TenantTagTypes.Brand,
          meta: { base64Logo: await convertPreviewToBase64() }
        })
      }
    )

    if (!response.ok) {
      parseHttpError(response)
    }

    setIsUploading(false);
    setUpdatingBrand(false);
    mutateTenantStatus();
  }, [
    preview,
    tenant.id,
    brandTag,
    updatingBrand,
    getAccessTokenSilently,
    method,
    url,
    mutateTenantStatus,
  ]);

  if (!hasEnoughPermissions) {
    return null;
  }

  return (
    <Card
      minHeight="50vh"
      maxHeight="80vh"
      padding="sm"
      width="2xl"
      flex1
      group
    >
      <Card.Header>
        <Typography as="h6" decoration="smooth">Brand</Typography>
      </Card.Header>

      <Card.Body>
        <div className="flex flex-col gap-8">
          <Typography as="small" width="xs" decoration="smooth">
            Setup a brand for the tenant. This will be used to identify the
            tenant in the UI.
          </Typography>

          {brandTag && (
            <div className="flex justify-center gap-2">
              <img
                src={brandTag.meta?.base64Logo}
                alt="Preview"
                className="w-full h-full object-cover"
                style={{
                  width: "200px",
                  height: "200px",
                  objectFit: "cover",
                  borderRadius: "10%",
                }}
              />

              <MdEdit
                className="cursor-pointer text-blue-500 text-2xl dark:text-lime-400 hover:scale-150 transition-all duration-200 -ml-5 bg-white dark:bg-gray-800 rounded-full p-1 border border-blue-300 dark:border-lime-700"
                onClick={() => setUpdatingBrand(true)}
              />
            </div>
          )}

          {(!brandTag || updatingBrand) && (
            <Banner intent="info">
              <div className="flex flex-col justify-between gap-8 my-5">
                <div className="flex justify-between w-full">
                  <div className="flex flex-col gap-2">
                    <Typography as="span">
                      Register a tenant brand
                    </Typography>

                    <Typography as="small" decoration="smooth">
                      A brand is used to identify the tenant in the UI.
                    </Typography>
                  </div>

                  <button
                    className="flex justify-end w-full"
                    onClick={() => setUpdatingBrand(false)}
                  >
                    <MdClose className="text-red-500 text-2xl" title="Close" />
                  </button>
                </div>

                <div>
                  <FileInput
                    accept='image/*'
                    id='image'
                    name='Upload image'
                    onChange={handleImageUpload}
                  />
                </div>
              </div>

              {preview && (
                <div className="flex justify-center gap-2">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    style={{
                      width: "250px",
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}

              {(preview && validationState.state === "valid") && (
                <div className="flex justify-end mt-5">
                  <Button
                    rounded
                    fullWidth
                    intent="info"
                    onClick={() => convertFileToBase64()}
                    disabled={isUploading}
                  >
                    {isUploading ? "Uploading..." : "Upload logo"}
                  </Button>
                </div>
              )}

              {validationState.state === "invalid" && (
                <div className="flex justify-end mt-5">
                  <Typography as="small">
                    <span className="text-red-500">
                      {validationState.message}
                    </span>
                  </Typography>
                </div>
              )}
            </Banner>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
