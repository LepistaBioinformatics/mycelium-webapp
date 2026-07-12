export enum TenantTagTypes {
    Brand = "brand",
}

export type TenantTagMeta = {
    base64Logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    headingFontFamily?: string;
    bodyFontFamily?: string;
}
