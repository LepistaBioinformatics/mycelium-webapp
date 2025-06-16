/**
 * Convert a snake_case string to a human-readable string
 * 
 * @param text - The snake_case string to convert
 * @returns The human-readable string
 */
export default function snakeToHumanText(text: string, capitalizeFirstLetter = false) {
    if (!text) return text;

    const result = text.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

    if (capitalizeFirstLetter) {
        return result.charAt(0).toUpperCase() + result.slice(1);
    }

    return result;
}
