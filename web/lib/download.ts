/**
 * Downloads a (possibly cross-origin) file. The HTML `download` attribute is ignored by browsers
 * for cross-origin URLs, so we fetch the file as a blob and save it from a local object URL.
 * Falls back to opening the URL in a new tab if the fetch fails.
 */
export async function downloadFile(url: string, filename: string): Promise<void> {
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const blob = await resp.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
  } catch {
    window.open(url, "_blank", "noopener");
  }
}
