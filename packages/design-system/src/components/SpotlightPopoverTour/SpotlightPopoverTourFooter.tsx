import { Inline } from "../Inline/Inline";
import { Text } from "../Text/Text";
import { Button } from "../Button/Button";

export interface SpotlightPopoverTourFooterAction {
  text: string;
  onClick: () => void;
}

export interface SpotlightPopoverTourFooterProps {
  activeStep: number;
  totalSteps: number;
  actions: {
    primary: SpotlightPopoverTourFooterAction;
    secondary?: SpotlightPopoverTourFooterAction;
  };
}

/**
 * SpotlightPopoverTourFooter — optional helper for the standard "1 / 3 ... Prev Next" nav
 * row, matching Blade's real exported SpotlightPopoverTourFooter. Not
 * required: a step's `footer` render function can return anything.
 */
export function SpotlightPopoverTourFooter({ activeStep, totalSteps, actions }: SpotlightPopoverTourFooterProps) {
  return (
    <Inline gap="4" justifyContent="between" alignItems="center">
      <Text variant="body" size="small" weight="semibold" color="secondary">
        {activeStep + 1} / {totalSteps}
      </Text>
      <Inline gap="2">
        {actions.secondary ? (
          <Button size="small" variant="secondary" onClick={actions.secondary.onClick}>
            {actions.secondary.text}
          </Button>
        ) : null}
        <Button size="small" variant="primary" onClick={actions.primary.onClick}>
          {actions.primary.text}
        </Button>
      </Inline>
    </Inline>
  );
}
