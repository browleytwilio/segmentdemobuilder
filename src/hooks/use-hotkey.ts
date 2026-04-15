import { useEffect } from "react";

export function useHotkey(
  key: string,
  callback: () => void,
  options?: { meta?: boolean }
) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (options?.meta && !(event.metaKey || event.ctrlKey)) return;
      if (event.key.toLowerCase() !== key.toLowerCase()) return;

      event.preventDefault();
      callback();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [key, callback, options?.meta]);
}
