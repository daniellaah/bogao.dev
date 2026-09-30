// Clipboard API first; fall back to a hidden textarea for contexts that block
// it (insecure origins, embedded browsers, some permission settings).
export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    try {
      // Deprecated, but still the only fallback that works without the
      // Clipboard API.
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      field.remove();
    }
  }
}
