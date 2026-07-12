import Card from "@/components/ui/Card";
import Divider from "@/components/ui/Divider";
import FormField from "@/components/ui/FomField";
import { MdClose, MdEdit } from "react-icons/md";
import Typography from "@/components/ui/Typography";
import Button from "@/components/ui/Button";
import { components } from "@/services/openapi/mycelium-schema";
import { useCallback, useMemo, useRef, useState } from "react";
import { TenantTagMeta, TenantTagTypes } from "@/types/TenantTagTypes";
import { tagsCreate, tagsUpdate } from "@/services/rpc/tenantManager";
import useSuspenseError from "@/hooks/use-suspense-error";
import useProfile from "@/hooks/use-profile";
import { MycRole } from "@/types/MyceliumRole";
import { MycPermission } from "@/types/MyceliumPermission";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";

const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

const FONT_SUGGESTIONS = [
  "Bricolage Grotesque",
  "Hanken Grotesk",
  "Space Mono",
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Source Sans Pro",
  "IBM Plex Sans",
  "Georgia",
  "Arial",
  "Helvetica",
  "Verdana",
];

type Tenant = components["schemas"]["Tenant"];

// Images wider or taller than this are resized proportionally before encoding.
const MAX_DIMENSION = 512;
// JPEG quality used when compressing (0–1). Applied after resize if needed.
const COMPRESS_QUALITY = 0.82;

interface CompressResult {
  dataUrl: string;
  originalKb: number;
  compressedKb: number;
}

function compressImage(file: File): Promise<CompressResult> {
  const originalKb = Math.round(file.size / 1024);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;

    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;

      img.onload = () => {
        const { width, height } = img;
        const scale = Math.min(
          1,
          MAX_DIMENSION / Math.max(width, height)
        );
        const outW = Math.round(width * scale);
        const outH = Math.round(height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = outW;
        canvas.height = outH;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas 2D context unavailable"));
          return;
        }

        ctx.drawImage(img, 0, 0, outW, outH);

        // WebP gives better compression where supported; JPEG as fallback.
        const dataUrl =
          canvas.toDataURL("image/webp", COMPRESS_QUALITY) ||
          canvas.toDataURL("image/jpeg", COMPRESS_QUALITY);

        // base64 payload size ≈ (length - header) * 0.75
        const headerEnd = dataUrl.indexOf(",") + 1;
        const compressedKb = Math.round(
          (dataUrl.length - headerEnd) * 0.75 / 1024
        );

        resolve({ dataUrl, originalKb, compressedKb });
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

interface Props {
  tenant: Tenant;
  mutateTenantStatus: () => void;
}

export default function BrandCard({ tenant, mutateTenantStatus }: Props) {
  const { t } = useTranslation();

  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sizeInfo, setSizeInfo] = useState<{
    originalKb: number;
    compressedKb: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [updatingBrand, setUpdatingBrand] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const { hasEnoughPermissions, getAccessTokenSilently } = useProfile({
    tenantOwnerNeeded: [tenant.id ?? ""],
    roles: [MycRole.TenantManager],
    permissions: [MycPermission.Read],
    restrictSystemAccount: true,
  });

  const { dispatchError } = useSuspenseError();

  const brandTag = useMemo(() => {
    if (!tenant?.tags) return null;
    return tenant.tags.find((tag) => tag.value === TenantTagTypes.Brand) ?? null;
  }, [tenant]);

  const brandMeta = brandTag?.meta as TenantTagMeta | undefined;

  const [isSavingIdentity, setIsSavingIdentity] = useState(false);

  const {
    register: registerIdentity,
    handleSubmit: handleIdentitySubmit,
    reset: resetIdentity,
    watch: watchIdentity,
    formState: { errors: identityErrors },
  } = useForm<TenantTagMeta>({
    defaultValues: {
      primaryColor: brandMeta?.primaryColor ?? "",
      secondaryColor: brandMeta?.secondaryColor ?? "",
      accentColor: brandMeta?.accentColor ?? "",
      headingFontFamily: brandMeta?.headingFontFamily ?? "",
      bodyFontFamily: brandMeta?.bodyFontFamily ?? "",
    },
  });

  const onSubmitIdentity = useCallback(
    async (values: TenantTagMeta) => {
      if (!tenant.id) return;

      setIsSavingIdentity(true);

      const meta: Record<string, string> = {
        ...(brandTag?.meta as Record<string, string> | undefined),
      };

      (Object.entries(values) as [string, string | undefined][]).forEach(
        ([key, value]) => {
          if (value) meta[key] = value;
          else delete meta[key];
        }
      );

      try {
        if (brandTag?.id) {
          await tagsUpdate(
            {
              tenantId: tenant.id,
              tagId: brandTag.id,
              value: TenantTagTypes.Brand,
              meta,
            },
            getAccessTokenSilently
          );
        } else {
          await tagsCreate(
            {
              tenantId: tenant.id,
              value: TenantTagTypes.Brand,
              meta,
            },
            getAccessTokenSilently
          );
        }

        resetIdentity(values);
      } catch (err) {
        dispatchError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsSavingIdentity(false);
        mutateTenantStatus();
      }
    },
    [
      tenant.id,
      brandTag,
      getAccessTokenSilently,
      dispatchError,
      mutateTenantStatus,
      resetIdentity,
    ]
  );

  const handleFile = useCallback(async (file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    setIsProcessing(true);
    setPreview(null);
    setSizeInfo(null);

    try {
      const result = await compressImage(file);
      setPreview(result.dataUrl);
      setSizeInfo({
        originalKb: result.originalKb,
        compressedKb: result.compressedKb,
      });
    } catch (err) {
      dispatchError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsProcessing(false);
    }
  }, [dispatchError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleSave = useCallback(async () => {
    if (!preview || !tenant.id) return;

    setIsUploading(true);

    // Spread existing brand meta first — tagsCreate/tagsUpdate replace the
    // whole meta map, so omitting this would silently drop any colors/fonts
    // already saved via the Brand Identity section below.
    const meta: Record<string, string> = {
      ...(brandTag?.meta as Record<string, string> | undefined),
      base64Logo: preview,
    };

    try {
      if (updatingBrand && brandTag?.id) {
        await tagsUpdate(
          {
            tenantId: tenant.id,
            tagId: brandTag.id,
            value: TenantTagTypes.Brand,
            meta,
          },
          getAccessTokenSilently
        );
      } else {
        await tagsCreate(
          {
            tenantId: tenant.id,
            value: TenantTagTypes.Brand,
            meta,
          },
          getAccessTokenSilently
        );
      }

      setPreview(null);
      setSizeInfo(null);
      setUpdatingBrand(false);
    } catch (err) {
      dispatchError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsUploading(false);
      mutateTenantStatus();
    }
  }, [
    preview,
    tenant.id,
    updatingBrand,
    brandTag,
    getAccessTokenSilently,
    dispatchError,
    mutateTenantStatus,
  ]);

  const handleCancelUpdate = () => {
    setUpdatingBrand(false);
    setPreview(null);
    setSizeInfo(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  if (!hasEnoughPermissions) return null;

  const showUploader = !brandTag || updatingBrand;

  return (
    <Card padding="sm" group scroll={false}>
      <Card.Header>
        <div className="flex flex-col gap-2">
          <Typography as="h6">
            {t(
              "screens.Dashboard.Tenants.AdvancedManagement.customization.brand.title"
            )}
          </Typography>

          <Typography as="small" decoration="smooth" width="sm">
            {t(
              "screens.Dashboard.Tenants.AdvancedManagement.customization.brand.description"
            )}
          </Typography>
        </div>
      </Card.Header>

      <Card.Body>
        <div className="flex flex-col gap-6">
          {/* Current logo */}
          {brandTag && !updatingBrand && (
            <div className="flex items-start gap-4">
              <img
                src={brandTag.meta?.base64Logo}
                alt="Brand logo"
                className="w-32 h-32 object-contain rounded-lg border border-zinc-200 dark:border-zinc-700"
              />
              <Button
                intent="link"
                padding="none"
                onClick={() => setUpdatingBrand(true)}
              >
                <span className="flex items-center gap-1.5">
                  <MdEdit size={16} />
                  {t(
                    "screens.Dashboard.Tenants.AdvancedManagement.customization.brand.registerTenantBrand"
                  )}
                </span>
              </Button>
            </div>
          )}

          {/* Uploader */}
          {showUploader && (
            <div className="flex flex-col gap-4">
              {updatingBrand && (
                <div className="flex justify-end">
                  <button
                    onClick={handleCancelUpdate}
                    className="flex items-center gap-1 text-sm text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <MdClose size={16} />
                  </button>
                </div>
              )}

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={[
                  "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-brand-600 px-6 py-10 cursor-pointer transition-colors",
                  dragOver
                    ? "bg-brand-violet-50 dark:bg-brand-violet-950"
                    : "hover:border-brand-violet-400 dark:hover:border-brand-violet-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
                ].join(" ")}
              >
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {t(
                    "screens.Dashboard.Tenants.AdvancedManagement.customization.brand.registerTenantBrandDescription"
                  )}
                </span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  {t(
                    "screens.Dashboard.Tenants.AdvancedManagement.customization.brand.anyFormat"
                  )}
                </span>

                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleInputChange}
                />
              </div>

              {isProcessing && (
                <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center">
                  {t(
                    "screens.Dashboard.Tenants.AdvancedManagement.customization.brand.processing"
                  )}
                </p>
              )}

              {/* Preview + size info */}
              {preview && !isProcessing && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-4">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-32 h-32 object-contain rounded-lg border border-zinc-200 dark:border-zinc-700"
                    />

                    {sizeInfo && (
                      <div className="flex flex-col gap-1 text-xs text-zinc-500 dark:text-zinc-400 pt-1">
                        <span>
                          {t(
                            "screens.Dashboard.Tenants.AdvancedManagement.customization.brand.original"
                          )}
                          {": "}
                          <span className="text-zinc-700 dark:text-zinc-300">
                            {sizeInfo.originalKb} KB
                          </span>
                        </span>
                        <span>
                          {t(
                            "screens.Dashboard.Tenants.AdvancedManagement.customization.brand.compressed"
                          )}
                          {": "}
                          <span className="text-brand-violet-600 dark:text-brand-violet-400 font-medium">
                            {sizeInfo.compressedKb} KB
                          </span>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      fullWidth
                      intent="info"
                      onClick={handleSave}
                      disabled={isUploading}
                    >
                      {isUploading
                        ? t(
                            "screens.Dashboard.Tenants.AdvancedManagement.customization.brand.submitting"
                          )
                        : t(
                            "screens.Dashboard.Tenants.AdvancedManagement.customization.brand.submit"
                          )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <Divider thickness="sm" />

          {/* Brand identity — hex colors + typography */}
          <form
            onSubmit={handleIdentitySubmit(onSubmitIdentity)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1">
              <Typography as="h6">
                {t(
                  "screens.Dashboard.Tenants.AdvancedManagement.customization.brand.identity.title"
                )}
              </Typography>
              <Typography as="small" decoration="smooth" width="sm">
                {t(
                  "screens.Dashboard.Tenants.AdvancedManagement.customization.brand.identity.description"
                )}
              </Typography>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
              {(
                [
                  ["primaryColor", "primaryColor"],
                  ["secondaryColor", "secondaryColor"],
                  ["accentColor", "accentColor"],
                ] as const
              ).map(([field, labelKey]) => (
                <div key={field} className="flex flex-col gap-1">
                  <FormField
                    id={field}
                    label={t(
                      `screens.Dashboard.Tenants.AdvancedManagement.customization.brand.identity.${labelKey}`
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-6 h-6 shrink-0 rounded-lg border border-zinc-300 dark:border-zinc-700"
                        style={{
                          backgroundColor: HEX_COLOR_PATTERN.test(
                            watchIdentity(field) ?? ""
                          )
                            ? watchIdentity(field)
                            : "transparent",
                        }}
                      />
                      <input
                        id={field}
                        className="rounded-lg border border-brand-600 bg-brand-violet-50 px-2 py-1.5 text-sm text-zinc-900 focus:border-brand-violet-500 focus:ring-1 focus:ring-brand-violet-500 focus:outline-none dark:bg-brand-950 dark:text-white dark:focus:border-brand-violet-400 dark:focus:ring-brand-violet-400 w-full"
                        placeholder="#9260C4"
                        {...registerIdentity(field, {
                          pattern: {
                            value: HEX_COLOR_PATTERN,
                            message: t(
                              "screens.Dashboard.Tenants.AdvancedManagement.customization.brand.identity.invalidHex"
                            ),
                          },
                        })}
                      />
                    </div>
                  </FormField>
                  {identityErrors[field] && (
                    <span className="text-xs text-red-500 dark:text-red-400">
                      {identityErrors[field]?.message}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <FormField
                id="headingFontFamily"
                label={t(
                  "screens.Dashboard.Tenants.AdvancedManagement.customization.brand.identity.headingFontFamily"
                )}
              >
                <input
                  id="headingFontFamily"
                  list="brand-font-suggestions"
                  className="rounded-lg border border-brand-600 bg-brand-violet-50 px-2 py-1.5 text-sm text-zinc-900 focus:border-brand-violet-500 focus:ring-1 focus:ring-brand-violet-500 focus:outline-none dark:bg-brand-950 dark:text-white dark:focus:border-brand-violet-400 dark:focus:ring-brand-violet-400 w-full"
                  placeholder="Bricolage Grotesque"
                  {...registerIdentity("headingFontFamily")}
                />
              </FormField>

              <FormField
                id="bodyFontFamily"
                label={t(
                  "screens.Dashboard.Tenants.AdvancedManagement.customization.brand.identity.bodyFontFamily"
                )}
              >
                <input
                  id="bodyFontFamily"
                  list="brand-font-suggestions"
                  className="rounded-lg border border-brand-600 bg-brand-violet-50 px-2 py-1.5 text-sm text-zinc-900 focus:border-brand-violet-500 focus:ring-1 focus:ring-brand-violet-500 focus:outline-none dark:bg-brand-950 dark:text-white dark:focus:border-brand-violet-400 dark:focus:ring-brand-violet-400 w-full"
                  placeholder="Hanken Grotesk"
                  {...registerIdentity("bodyFontFamily")}
                />
              </FormField>

              <datalist id="brand-font-suggestions">
                {FONT_SUGGESTIONS.map((font) => (
                  <option key={font} value={font} />
                ))}
              </datalist>
            </div>

            <div className="flex justify-end">
              <Button
                intent="secondary"
                size="sm"
                type="submit"
                disabled={isSavingIdentity}
              >
                {isSavingIdentity
                  ? t(
                      "screens.Dashboard.Tenants.AdvancedManagement.customization.brand.identity.saving"
                    )
                  : t(
                      "screens.Dashboard.Tenants.AdvancedManagement.customization.brand.identity.save"
                    )}
              </Button>
            </div>
          </form>
        </div>
      </Card.Body>
    </Card>
  );
}
