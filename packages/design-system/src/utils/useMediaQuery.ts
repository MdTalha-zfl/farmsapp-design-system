import { useSyncExternalStore } from "react";

/**
 * Whether a CSS media query currently matches, updating as it changes. Used to
 * choose between a Dropdown's overlay and a BottomSheet:
 *
 *   const isMobile = useMediaQuery("(max-width: 640px)");
 *   <Dropdown>… {isMobile ? <BottomSheet>…</BottomSheet> : <DropdownOverlay>…</DropdownOverlay>}</Dropdown>
 *
 * `false` on the server and until the browser can answer.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => (typeof window === "undefined" || typeof window.matchMedia !== "function" ? false : window.matchMedia(query).matches),
    () => false,
  );
}
