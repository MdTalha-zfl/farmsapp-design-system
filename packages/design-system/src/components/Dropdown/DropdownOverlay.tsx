import { useLayoutEffect, type ReactNode } from "react";
import { FloatingFocusManager, FloatingPortal, type Placement } from "@floating-ui/react";
import { useDropdownContext } from "./DropdownContext";

export interface DropdownOverlayProps {
  /** An ActionList (Phase 2 adds DropdownHeader/DropdownFooter alongside it). */
  children: ReactNode;
  /** Defaults to "bottom-start". The panel still flips and shifts to stay in
   * view. */
  defaultPlacement?: Placement;
  /** Overrides. A menu is content-sized between 240px and 400px by default. */
  width?: string;
  minWidth?: string;
  maxWidth?: string;
}

/**
 * The floating panel. It is portalled, and stays rendered (hidden with
 * `display: none`) while the dropdown is closed — the same `isLazy={false}`
 * idea as Drawer — so items are always registered.
 */
export function DropdownOverlay({ children, defaultPlacement = "bottom-start", width, minWidth, maxWidth }: DropdownOverlayProps) {
  const { isMounted, refs, floatingContext, floatingStyles, transitionStyles, handleEscape, setOverlayConfig } =
    useDropdownContext();

  useLayoutEffect(() => {
    setOverlayConfig({ placement: defaultPlacement });
  }, [defaultPlacement, setOverlayConfig]);

  return (
    <FloatingPortal>
      {/* Non-modal: the page behind stays reachable, Tab leaves the panel (and
          closes it), and focus returns to the trigger on close. Disabled while
          hidden so a closed dropdown never traps or steals focus. */}
      <FloatingFocusManager context={floatingContext} modal={false} initialFocus={-1} disabled={!isMounted}>
        {/* The outer element is what `refs.setFloating` points at: it owns
            floating-ui's own position/size (including the `maxHeight` the
            `size` middleware writes to it directly), and nothing else, so
            nothing here can collide with its positioning `transform`. The
            inner element is the visible panel and owns the enter/exit
            animation — a `transform` on it is safe, since it's a different
            element from the one floating-ui positions. */}
        <div
          ref={refs.setFloating}
          className="ds-dropdown__position"
          style={{
            ...floatingStyles,
            ...(isMounted ? {} : { display: "none" }),
            width,
            minWidth,
            maxWidth,
          }}
        >
          {/* `display: none` when closed is set on *both* elements, not just
              the outer one: an ancestor's `display: none` stops this element
              from being rendered, but `getComputedStyle` on the element
              itself still reports its own specified value ("flex"), not
              "none" — code elsewhere (including this project's own test
              scripts) that finds "the currently open dropdown" by checking
              *this* class's own computed `display` needs it set here too. */}
          <div
            className="ds-dropdown__overlay"
            style={{ ...transitionStyles, ...(isMounted ? {} : { display: "none" }) }}
            onKeyDown={handleEscape}
          >
            {children}
          </div>
        </div>
      </FloatingFocusManager>
    </FloatingPortal>
  );
}
