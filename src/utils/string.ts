/**
 * Converts a string to Title Case (e.g. "john doe" -> "John Doe", "MARY JANE" -> "Mary Jane").
 */
export function capitalizeWords(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .trim()
    .split(/\s+/)
    .map((word) => {
      if (!word) return "";
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}
