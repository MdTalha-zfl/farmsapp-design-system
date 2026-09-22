import { forwardRef, type HTMLProps } from "react";
import { useMergeRefs } from "@farmsapp/utilities";
import { IconButton, type IconButtonProps } from "../IconButton/IconButton";
import { useDropdownContext } from "./DropdownContext";

export type DropdownIconButtonProps = IconButtonProps;

export const DropdownIconButton = forwardRef<HTMLButtonElement, DropdownIconButtonProps>(
  function DropdownIconButton(props, forwardedRef) {
    const { refs, getReferenceProps } = useDropdownContext();
    const ref = useMergeRefs(refs.setReference, forwardedRef);
    const merged = getReferenceProps(props as unknown as HTMLProps<Element>) as unknown as IconButtonProps;
    return <IconButton ref={ref} {...merged} />;
  },
);
