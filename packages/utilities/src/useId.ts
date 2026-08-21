import { useId as useReactId } from "react";

export function useId(providedId?: string): string {
  const generatedId = useReactId();
  return providedId ?? generatedId;
}
