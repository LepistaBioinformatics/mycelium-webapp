/**
 * Converts a camelCase string to a kebab-case string
 * 
 * @param str - The camelCase string to convert
 * @returns The kebab-case string
 */
export function camelCaseToKebabCase(str: string): string {
    return str.replace(/([A-Z])/g, "-$1").toLowerCase();
}
