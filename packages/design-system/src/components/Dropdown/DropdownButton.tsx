import { forwardRef, type HTMLProps } from "react";
import { useMergeRefs } from "@farmsapp/utilities";
import { Button, type ButtonOwnProps } from "../Button/Button";
import { useDropdownContext } from "./DropdownContext";

/** Every Button prop. The trigger wiring (aria-expanded, key handlers, …) is
 * merged in from the Dropdown; a consumer's own handlers are kept. */
export type DropdownButtonProps = ButtonOwnProps;

export const DropdownButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, DropdownButtonProps>(
  function DropdownButton(props, forwardedRef) {
    const { refs, getReferenceProps } = useDropdownContext();
    const ref = useMergeRefs(refs.setReference, forwardedRef);
    const merged = getReferenceProps(props as unknown as HTMLProps<Element>) as unknown as ButtonOwnProps;
    return <Button ref={ref} {...merged} />;
  },
);
