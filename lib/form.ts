/**
 * Reads a form field from a Server Action's FormData.
 *
 * React namespaces the arguments it sends to a server action, so a field
 * submitted as `title` can arrive as `_1_title`. Reading the bare name alone
 * silently yields an empty string and the action quietly does nothing, so
 * accept the namespaced form too.
 */
export function field(formData: FormData, name: string): string {
  const direct = formData.get(name);
  if (typeof direct === "string") return direct;

  const namespaced = new RegExp(`^_\\d+_${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`);
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && namespaced.test(key)) return value;
  }

  return "";
}
