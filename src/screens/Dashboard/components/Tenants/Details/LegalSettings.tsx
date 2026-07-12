import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import useProfile from "@/hooks/use-profile";
import { components } from "@/services/openapi/mycelium-schema";
import { metaCreate } from "@/services/rpc/tenantOwner";
import { setNotification } from "@/states/notification.state";
import { MycPermission } from "@/types/MyceliumPermission";
import { MycRole } from "@/types/MyceliumRole";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { LEGAL_FIELD_KEYS as FIELD_KEYS } from "./legal-field-keys";

type Tenant = components["schemas"]["Tenant"];

interface Props {
  tenant: Tenant;
  mutateTenantStatus: () => void;
}

interface LegalFormValues {
  federal_revenue_register: string;
  federal_revenue_register_type: string;
  country: string;
  state: string;
  province: string;
  city: string;
  zip_code: string;
  address1: string;
  address2: string;
  legal_name: string;
  trading_name: string;
  contact_person: string;
}

const REGISTER_TYPE_OPTIONS = [
  { value: "", label: "—" },
  { value: "CNPJ", label: "CNPJ (Brazil)" },
  { value: "EIN", label: "EIN (USA)" },
  { value: "VAT", label: "VAT (EU)" },
  { value: "NIF", label: "NIF (Portugal / Spain)" },
  { value: "CIF", label: "CIF (Spain, companies)" },
  { value: "RFC", label: "RFC (Mexico)" },
  { value: "ABN", label: "ABN (Australia)" },
  { value: "TAX_ID", label: "TAX ID (generic)" },
];

// New CNPJ format (Receita Federal 2025+) supports alphanumeric characters.
// Mask: XX.XXX.XXX/XXXX-XX — same punctuation, but chars can be A-Z or 0-9.
function cnpjMask(raw: string): string {
  const chars = raw
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase()
    .slice(0, 14);
  if (chars.length <= 2) return chars;
  if (chars.length <= 5) return `${chars.slice(0, 2)}.${chars.slice(2)}`;
  if (chars.length <= 8)
    return `${chars.slice(0, 2)}.${chars.slice(2, 5)}.${chars.slice(5)}`;
  if (chars.length <= 12)
    return `${chars.slice(0, 2)}.${chars.slice(2, 5)}.${chars.slice(5, 8)}/${chars.slice(8)}`;
  return `${chars.slice(0, 2)}.${chars.slice(2, 5)}.${chars.slice(5, 8)}/${chars.slice(8, 12)}-${chars.slice(12)}`;
}

// Alphanumeric CNPJ check-digit algorithm (Receita Federal / SERPRO, in
// effect from 2026): mod-11 over ASCII-48 character values (digits keep
// their value 0-9; letters A-Z map to 17-42), same weight sequences as the
// legacy purely-numeric CNPJ. The 2 trailing check digits are always
// numeric; only the 12 base characters may be letters.
function cnpjCharValue(char: string): number {
  return char.charCodeAt(0) - 48;
}

function cnpjCheckDigit(base: string, weights: number[]): number {
  const sum = base
    .split("")
    .reduce((acc, char, i) => acc + cnpjCharValue(char) * (weights[i] ?? 0), 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

function isValidCnpj(raw: string): boolean {
  const clean = raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  if (!/^[A-Z0-9]{12}[0-9]{2}$/.test(clean)) return false;

  const base = clean.slice(0, 12);
  const dv1 = cnpjCheckDigit(base, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const dv2 = cnpjCheckDigit(
    base + dv1,
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  );

  return clean.slice(12) === `${dv1}${dv2}`;
}

const INPUT =
  "w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 px-0 py-1.5 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-brand-violet-500 dark:focus:border-brand-violet-400 placeholder-zinc-400 dark:placeholder-zinc-600";
const LABEL =
  "text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide";

export default function LegalSettings({ tenant, mutateTenantStatus }: Props) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isSaving, setIsSaving] = useState(false);

  const { hasEnoughPermissions, getAccessTokenSilently } = useProfile({
    tenantOwnerNeeded: [tenant.id ?? ""],
    roles: [MycRole.TenantManager],
    permissions: [MycPermission.Read],
    restrictSystemAccount: true,
  });

  const meta = (tenant.meta ?? {}) as Record<string, string>;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm<LegalFormValues>({
      defaultValues: {
        federal_revenue_register: meta["federal_revenue_register"] ?? "",
        federal_revenue_register_type:
          meta["federal_revenue_register_type"] ?? "",
        country: meta["country"] ?? "",
        state: meta["state"] ?? "",
        city: meta["city"] ?? "",
        zip_code: meta["zip_code"] ?? "",
        address1: meta["address1"] ?? "",
        address2: meta["address2"] ?? "",
        province: meta["province"] ?? "",
        legal_name: meta["legal_name"] ?? "",
        trading_name: meta["trading_name"] ?? "",
        contact_person: meta["contact_person"] ?? "",
      },
    });

  const registerType = watch("federal_revenue_register_type");
  const isCnpj = registerType === "CNPJ";

  if (!hasEnoughPermissions) return null;

  const BASE =
    "screens.Dashboard.Tenants.AdvancedManagement.legalSettingsAndPeople.legalSettings";

  const onSubmit = async (values: LegalFormValues) => {
    if (!tenant.id) return;

    setIsSaving(true);

    const results = await Promise.allSettled(
      FIELD_KEYS.filter(
        (key) => values[key as keyof LegalFormValues] !== ""
      ).map((key) =>
        metaCreate(
          {
            tenantId: tenant.id!,
            key,
            value: values[key as keyof LegalFormValues],
          },
          getAccessTokenSilently
        )
      )
    );

    setIsSaving(false);

    const failed = results.filter((r) => r.status === "rejected");

    if (failed.length > 0) {
      dispatch(
        setNotification({
          type: "error",
          notification: `${failed.length} field(s) failed to save.`,
        })
      );
      return;
    }

    reset(values);
    mutateTenantStatus();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
    >
      <Card padding="sm" height="adaptive" group scroll={false}>
        <Card.Header>
          <div className="flex flex-col gap-2">
            <Typography as="h5">{t(`${BASE}.title`)}</Typography>
            <Typography as="span" decoration="smooth" width="sm">
              {t(`${BASE}.description`)}
            </Typography>
          </div>
        </Card.Header>

        <Card.Body>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            {/* Register type — select with preset options */}
            <div className="flex flex-col gap-1">
              <label className={LABEL}>
                {t(`${BASE}.federalRevenueRegisterType.title`)}
              </label>
              <select
                {...register("federal_revenue_register_type")}
                className={`${INPUT} cursor-pointer bg-white dark:bg-brand-950`}
              >
                {REGISTER_TYPE_OPTIONS.map(({ value, label }) => (
                  <option
                    key={value}
                    value={value}
                    className="bg-white dark:bg-brand-950"
                  >
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Register number — CNPJ mask when type is CNPJ */}
            <div className="flex flex-col gap-1">
              <label className={LABEL}>
                {t(`${BASE}.federalRevenueRegister.title`)}
                {isCnpj && (
                  <span className="ml-2 normal-case tracking-normal text-zinc-400 dark:text-zinc-500">
                    XX.XXX.XXX/XXXX-XX
                  </span>
                )}
              </label>
              <Controller
                name="federal_revenue_register"
                control={control}
                rules={{
                  validate: (value) =>
                    !isCnpj ||
                    !value ||
                    isValidCnpj(value) ||
                    (t(
                      `${BASE}.federalRevenueRegister.invalidCnpj`
                    ) as string),
                }}
                render={({ field }) => (
                  <input
                    {...field}
                    className={INPUT}
                    placeholder="—"
                    maxLength={isCnpj ? 18 : undefined}
                    onChange={(e) => {
                      const value = isCnpj
                        ? cnpjMask(e.target.value)
                        : e.target.value;
                      field.onChange(value);
                    }}
                  />
                )}
              />
              {errors.federal_revenue_register && (
                <span className="text-xs text-red-500 dark:text-red-400">
                  {errors.federal_revenue_register.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className={LABEL}>{t(`${BASE}.country.title`)}</label>
              <input
                {...register("country")}
                className={INPUT}
                placeholder="—"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={LABEL}>{t(`${BASE}.state.title`)}</label>
              <input
                {...register("state")}
                className={INPUT}
                placeholder="—"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={LABEL}>{t(`${BASE}.province.title`)}</label>
              <input
                {...register("province")}
                className={INPUT}
                placeholder="—"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={LABEL}>{t(`${BASE}.city.title`)}</label>
              <input
                {...register("city")}
                className={INPUT}
                placeholder="—"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={LABEL}>{t(`${BASE}.zipCode.title`)}</label>
              <input
                {...register("zip_code")}
                className={INPUT}
                placeholder="—"
              />
            </div>

            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className={LABEL}>{t(`${BASE}.address1.title`)}</label>
              <input
                {...register("address1")}
                className={INPUT}
                placeholder="—"
              />
            </div>

            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className={LABEL}>{t(`${BASE}.address2.title`)}</label>
              <input
                {...register("address2")}
                className={INPUT}
                placeholder="—"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={LABEL}>{t(`${BASE}.legalName.title`)}</label>
              <input
                {...register("legal_name")}
                className={INPUT}
                placeholder="—"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={LABEL}>{t(`${BASE}.tradingName.title`)}</label>
              <input
                {...register("trading_name")}
                className={INPUT}
                placeholder="—"
              />
            </div>

            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className={LABEL}>{t(`${BASE}.contactPerson.title`)}</label>
              <input
                {...register("contact_person")}
                className={INPUT}
                placeholder="—"
              />
            </div>
          </div>
        </Card.Body>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? t(`${BASE}.saving`) : t(`${BASE}.save`)}
        </Button>
      </div>
    </form>
  );
}
