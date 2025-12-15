import { useCallback } from "react";

/**
 * Salva um Blob como arquivo no disco do usuário.
 */
export function useDownload() {
  const saveBlob = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "download";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, []);

  return { saveBlob };
}
