/**
 * Converts a camelCase string to a human-readable string
 * 
 * @example
 * camelToHumanText("camelCaseString") // "Camel Case String"
 * 
 * @param text - The camelCase string to convert
 * @returns The human-readable string
 */
export function camelToHumanText(text: string) {
    const textCopy = text.replace(/([A-Z])/g, " $1").trim();

    return textCopy.charAt(0).toUpperCase() + textCopy.slice(1);
}
