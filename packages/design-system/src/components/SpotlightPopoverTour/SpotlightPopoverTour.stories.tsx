import { forwardRef, useState, type ComponentType } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ShoppingCartIcon, PackageIcon, HeartIcon, AlertCircleIcon, InfoIcon, type IconOwnProps } from "@farmsapp/icons";
import { SpotlightPopoverTour } from "./SpotlightPopoverTour";
import { SpotlightPopoverTourStep } from "./SpotlightPopoverTourStep";
import { SpotlightPopoverTourFooter } from "./SpotlightPopoverTourFooter";
import type { SpotlightPopoverTourSteps, SpotlightPopoverTourStepRenderProps } from "./SpotlightPopoverTour";
import { Button } from "../Button/Button";
import { Text } from "../Text/Text";
import { Heading } from "../Heading/Heading";
import { Stack } from "../Stack/Stack";
import { Inline } from "../Inline/Inline";
import { Box } from "../Box/Box";
import { TextInput } from "../Input/TextInput/TextInput";
import { BottomBar } from "../BottomBar/BottomBar";

const meta = {
  title: "Components/SpotlightPopoverTour",
  component: SpotlightPopoverTour,
  tags: ["autodocs"],
  // Every story below supplies its own `render` with real steps/state, so
  // these are just placeholder values satisfying SpotlightPopoverTour's required props —
  // matches Popover.stories.tsx's own convention.
  args: {
    steps: [],
    isOpen: false,
    activeStep: 0,
    children: null,
  },
} satisfies Meta<typeof SpotlightPopoverTour>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Small ecommerce-flavored stat card, reused across the onboarding stories
 * below — not part of the public API, just story-local dressing.
 *
 * Must forward its ref: `SpotlightPopoverTourStep` clones its child and attaches a ref to
 * measure it, and a plain function component can't receive one — React
 * silently drops it (with a dev-console warning), the target never
 * registers, and the tour has nothing to spotlight, so it never opens. */
const DashboardCard = forwardRef<HTMLElement, { icon: ComponentType<IconOwnProps>; label: string; value: string }>(
  function DashboardCard({ icon: Icon, label, value }, ref) {
    return (
      <Box ref={ref} padding="4" backgroundColor="raised" borderRadius="lg">
        <Stack gap="2">
          <Inline gap="2" alignItems="center">
            <Icon />
            <Text variant="body" weight="semibold">
              {label}
            </Text>
          </Inline>
          <Text variant="body" color="secondary">
            {value}
          </Text>
        </Stack>
      </Box>
    );
  },
);

/** One target, one step, the simplest possible shape. */
export const Default: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      const steps: SpotlightPopoverTourSteps = [
        {
          name: "cart-card",
          title: "Your cart",
          content: () => (
            <Text variant="body">Items you add stay here for 24 hours, even if you close the app.</Text>
          ),
          footer: ({ stopSpotlightPopoverTour }) => (
            <Button size="small" variant="primary" onClick={stopSpotlightPopoverTour}>
              Got it
            </Button>
          ),
        },
      ];
      return (
        <Stack gap="6">
          <Button variant="primary" onClick={() => setIsOpen(true)}>
            {isOpen ? "SpotlightPopoverTour in progress" : "Start tour"}
          </Button>
          <SpotlightPopoverTour steps={steps} isOpen={isOpen} activeStep={0} onOpenChange={setIsOpen} onFinish={() => setIsOpen(false)}>
            <SpotlightPopoverTourStep name="cart-card">
              <DashboardCard icon={ShoppingCartIcon} label="Cart" value="3 items" />
            </SpotlightPopoverTourStep>
          </SpotlightPopoverTour>
        </Stack>
      );
    }
    return <Example />;
  },
};

/** Three-step feature walkthrough over an ecommerce dashboard, using the
 * `SpotlightPopoverTourFooter` helper for the standard "1 / 3 ... Back / Next" row. */
export const EcommerceOnboarding: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      const [activeStep, setActiveStep] = useState(0);

      const renderFooter = ({ activeStep: current, totalSteps, goToNext, goToPrevious, stopSpotlightPopoverTour }: SpotlightPopoverTourStepRenderProps) => (
        <SpotlightPopoverTourFooter
          activeStep={current}
          totalSteps={totalSteps}
          actions={{
            primary: current === totalSteps - 1 ? { text: "Done", onClick: stopSpotlightPopoverTour } : { text: "Next", onClick: goToNext },
            ...(current > 0 ? { secondary: { text: "Back", onClick: goToPrevious } } : {}),
          }}
        />
      );

      const steps: SpotlightPopoverTourSteps = [
        {
          name: "orders-card",
          title: "Track your orders",
          titleLeading: <PackageIcon />,
          content: () => <Text variant="body">See real-time status for every order, from packed to delivered.</Text>,
          placement: "bottom",
          footer: renderFooter,
        },
        {
          name: "wishlist-card",
          title: "Save for later",
          titleLeading: <HeartIcon color="danger" />,
          content: () => <Text variant="body">Add items to your wishlist — we'll tell you when they go on sale.</Text>,
          placement: "bottom",
          footer: renderFooter,
        },
        {
          name: "cart-card",
          title: "Your cart",
          titleLeading: <ShoppingCartIcon />,
          content: () => <Text variant="body">Items stay in your cart for 24 hours, across every device.</Text>,
          placement: "bottom",
          footer: renderFooter,
        },
      ];

      return (
        <Stack gap="6">
          <Button
            variant="primary"
            onClick={() => {
              setActiveStep(0);
              setIsOpen(true);
            }}
          >
            {isOpen ? "SpotlightPopoverTour in progress" : "Take the tour"}
          </Button>
          <SpotlightPopoverTour
            steps={steps}
            isOpen={isOpen}
            activeStep={activeStep}
            onOpenChange={setIsOpen}
            onStepChange={setActiveStep}
            onFinish={() => setIsOpen(false)}
          >
            <Inline gap="4" wrap>
              <SpotlightPopoverTourStep name="orders-card">
                <DashboardCard icon={PackageIcon} label="Orders" value="2 active" />
              </SpotlightPopoverTourStep>
              <SpotlightPopoverTourStep name="wishlist-card">
                <DashboardCard icon={HeartIcon} label="Wishlist" value="5 items" />
              </SpotlightPopoverTourStep>
              <SpotlightPopoverTourStep name="cart-card">
                <DashboardCard icon={ShoppingCartIcon} label="Cart" value="3 items" />
              </SpotlightPopoverTourStep>
            </Inline>
          </SpotlightPopoverTour>
        </Stack>
      );
    }
    return <Example />;
  },
};

/** A skippable onboarding tour — a custom footer's "Skip" jumps straight to
 * the final step (`goToStep(totalSteps - 1)`), and the final step's own
 * content differs depending on whether the tour was skipped or completed.
 * The last step targets the same button that started the tour, so it also
 * doubles as "come back here to retake it." Mirrors Blade's real
 * "Interruptible SpotlightPopoverTour" pattern. */
export const SkippableOnboarding: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      const [activeStep, setActiveStep] = useState(0);
      const [isSkipped, setIsSkipped] = useState(false);

      const renderFooter = ({
        activeStep: current,
        totalSteps,
        goToNext,
        goToPrevious,
        goToStep,
        stopSpotlightPopoverTour,
      }: SpotlightPopoverTourStepRenderProps) => {
        const isFirst = current === 0;
        const isLast = current === totalSteps - 1;
        return (
          <Inline gap="4" justifyContent="between" alignItems="center">
            <Text variant="body" size="small" weight="semibold" color="secondary">
              {current + 1} / {totalSteps}
            </Text>
            <Inline gap="2">
              {!isLast && (
                <Button
                  size="small"
                  variant="tertiary"
                  onClick={() => {
                    setIsSkipped(true);
                    goToStep(totalSteps - 1);
                  }}
                >
                  Skip
                </Button>
              )}
              {!isFirst && !isLast && (
                <Button size="small" variant="secondary" onClick={goToPrevious}>
                  Back
                </Button>
              )}
              <Button size="small" variant="primary" onClick={isLast ? stopSpotlightPopoverTour : goToNext}>
                {isLast ? "Done" : "Next"}
              </Button>
            </Inline>
          </Inline>
        );
      };

      const steps: SpotlightPopoverTourSteps = [
        {
          name: "seller-step-1",
          title: "List your first product",
          content: () => <Text variant="body">Add photos, pricing and stock — it takes about 2 minutes.</Text>,
          footer: renderFooter,
        },
        {
          name: "seller-step-2",
          title: "Set your delivery area",
          content: () => <Text variant="body">Choose the pin codes you can ship to before you go live.</Text>,
          footer: renderFooter,
        },
        isSkipped
          ? {
              name: "seller-final",
              title: "Setup incomplete",
              titleLeading: <AlertCircleIcon color="warning" />,
              content: () => (
                <Text variant="body">You can finish setting up your store any time from Seller Settings.</Text>
              ),
              footer: renderFooter,
            }
          : {
              name: "seller-final",
              title: "You're all set!",
              content: () => <Text variant="body">Your store is ready. Add more products whenever you like.</Text>,
              footer: renderFooter,
            },
      ];

      return (
        <Stack gap="6">
          <Inline gap="4" wrap>
            <SpotlightPopoverTourStep name="seller-step-1">
              <DashboardCard icon={PackageIcon} label="Products" value="0 listed" />
            </SpotlightPopoverTourStep>
            <SpotlightPopoverTourStep name="seller-step-2">
              <DashboardCard icon={InfoIcon} label="Delivery area" value="Not set" />
            </SpotlightPopoverTourStep>
          </Inline>
          <SpotlightPopoverTour
            steps={steps}
            isOpen={isOpen}
            activeStep={activeStep}
            onOpenChange={setIsOpen}
            onStepChange={setActiveStep}
            onFinish={() => {
              setIsOpen(false);
              setIsSkipped(false);
              setActiveStep(0);
            }}
          >
            <SpotlightPopoverTourStep name="seller-final">
              <Button
                variant="primary"
                onClick={() => {
                  setIsSkipped(false);
                  setActiveStep(0);
                  setIsOpen(true);
                }}
              >
                {isOpen ? "SpotlightPopoverTour in progress" : "New seller walkthrough"}
              </Button>
            </SpotlightPopoverTourStep>
          </SpotlightPopoverTour>
        </Stack>
      );
    }
    return <Example />;
  },
};

const ADDRESS_FIELDS = [
  { name: "full-name", key: "fullName", label: "Full Name", required: true, placeholder: "Enter your full name" },
  { name: "mobile", key: "mobile", label: "Mobile Number", required: true, placeholder: "10-digit mobile number" },
  { name: "flat-no", key: "flatNo", label: "Flat / House no (If Any)", required: false, placeholder: "Enter Flat / House no (If Any)" },
  {
    name: "area",
    key: "area",
    label: "Area / Street / Village / Taluk",
    required: true,
    placeholder: "Enter Area / Street / Village / Taluk",
  },
  { name: "landmark", key: "landmark", label: "Landmark", required: false, placeholder: "Eg: Near Temple/School" },
  { name: "district", key: "district", label: "City / District", required: false, placeholder: "Enter city or district" },
  { name: "state", key: "state", label: "State", required: true, placeholder: "Enter state" },
  { name: "pincode", key: "pincode", label: "Pincode", required: true, placeholder: "6-digit pincode" },
] as const;

/** The driving use case: submitting the address form spotlights the first
 * empty required field. A single-entry `steps` array is a first-class
 * shape, not a degraded case of multi-step onboarding — the tour always
 * has exactly one step here, it's just re-created pointing at whichever
 * field failed. The red border/helper text is entirely `TextInput`'s own
 * `validationState="error"` — SpotlightPopoverTour only draws a neutral spotlight ring
 * around whatever the target already looks like.
 *
 * **To see it spotlight the first / a middle / the last field:** fill in
 * every required field except one, then submit — whichever one you left
 * empty gets spotlighted, wherever it sits in the form (Full Name at the
 * top, State/Pincode near the bottom bar). Leaving several empty still
 * spotlights only the first one found, then re-submitting after fixing it
 * moves on to the next.
 *
 * **To see the spotlight/card adjust for less vertical space** (what a
 * mobile keyboard opening does): shrink your actual browser window
 * shorter, or use your browser's device toolbar/responsive mode, while a
 * field near the bottom (State/Pincode) is spotlighted — the card flips
 * from below the field to above it once there's no longer room underneath,
 * and the mask/card both re-measure. This is a genuine resize, which is
 * what a real on-screen keyboard opening also triggers; see the
 * `visualViewport` listeners in `SpotlightPopoverTour.tsx` for why that's not the same
 * event as a plain `window` resize on some mobile browsers. */
export const AddressFormValidation: Story = {
  parameters: {
    // BottomBar is `position: fixed` — fullscreen + its own iframe stops it
    // stacking oddly against the rest of the docs page, same as
    // BottomBar.stories.tsx's own convention.
    layout: "fullscreen",
    docs: { story: { inline: false, iframeHeight: 640 } },
  },
  render: () => {
    function Example() {
      const [values, setValues] = useState<Record<string, string>>({});
      const [errorField, setErrorField] = useState<string | null>(null);
      const [isOpen, setIsOpen] = useState(false);

      const activeField = ADDRESS_FIELDS.find((field) => field.name === errorField);

      const steps: SpotlightPopoverTourSteps = activeField
        ? [
            {
              name: activeField.name,
              content: () => (
                <Text variant="body">
                  {activeField.label} is required to deliver your order.
                </Text>
              ),
              footer: ({ stopSpotlightPopoverTour }) => (
                <Button size="small" variant="primary" onClick={stopSpotlightPopoverTour}>
                  Got it
                </Button>
              ),
              placement: "bottom",
            },
          ]
        : [];

      const handleSubmit = () => {
        const firstInvalid = ADDRESS_FIELDS.find((field) => field.required && !values[field.key]?.trim());
        if (firstInvalid) {
          setErrorField(firstInvalid.name);
          setIsOpen(true);
          return;
        }
        setErrorField(null);
        setIsOpen(false);
      };

      return (
        <div style={{ maxWidth: 360, minHeight: "100vh", padding: "var(--ds-space-4)", paddingBottom: 120 }}>
          <SpotlightPopoverTour steps={steps} isOpen={isOpen} activeStep={0} onOpenChange={setIsOpen} onFinish={() => setIsOpen(false)}>
            <Stack gap="4">
              <Heading level="4" variant="heading-sm">
                Delivery address
              </Heading>
              {ADDRESS_FIELDS.map((field) => {
                const hasError = errorField === field.name;
                const input = (
                  <TextInput
                    id={field.name}
                    label={field.label}
                    necessityIndicator={field.required ? "required" : "none"}
                    placeholder={field.placeholder}
                    value={values[field.key] ?? ""}
                    onChange={({ value }) => {
                      setValues((v) => ({ ...v, [field.key]: value }));
                      if (hasError) setErrorField(null);
                    }}
                    validationState={hasError ? "error" : "none"}
                    errorText={hasError ? `${field.label} is required.` : undefined}
                  />
                );
                return (
                  <SpotlightPopoverTourStep key={field.name} name={field.name}>
                    {input}
                  </SpotlightPopoverTourStep>
                );
              })}
            </Stack>
          </SpotlightPopoverTour>
          <BottomBar accessibilityLabel="Address actions">
            <Button variant="primary" isFullWidth onClick={handleSubmit}>
              Review address
            </Button>
          </BottomBar>
        </div>
      );
    }
    return <Example />;
  },
};

const REQUIRED_CHECKOUT_FIELDS = [
  { name: "email", label: "Email address" },
  { name: "phone", label: "Phone number" },
  { name: "address1", label: "Address line 1" },
  { name: "pincode", label: "Pincode" },
] as const;

/** A checkout form with several required fields left empty on submit —
 * SpotlightPopoverTour steps through every invalid field in one guided pass (Next/Done)
 * instead of making the user resubmit for each one. Demonstrates the same
 * API driving a materially different flow from `AddressFormValidation`. */
export const MultiFieldValidation: Story = {
  render: () => {
    function Example() {
      const [values, setValues] = useState<Record<string, string>>({});
      const [invalidFields, setInvalidFields] = useState<string[]>([]);
      const [isOpen, setIsOpen] = useState(false);
      const [activeStep, setActiveStep] = useState(0);

      const handleSubmit = () => {
        const missing = REQUIRED_CHECKOUT_FIELDS.filter((field) => !values[field.name]?.trim()).map((field) => field.name);
        setInvalidFields(missing);
        if (missing.length > 0) {
          setActiveStep(0);
          setIsOpen(true);
        } else {
          setIsOpen(false);
        }
      };

      const steps: SpotlightPopoverTourSteps = invalidFields.map((name) => {
        const field = REQUIRED_CHECKOUT_FIELDS.find((f) => f.name === name)!;
        return {
          name,
          title: `${field.label} is required`,
          titleLeading: <AlertCircleIcon color="danger" />,
          content: () => <Text variant="body">We need this to confirm your order.</Text>,
          footer: ({ activeStep: current, totalSteps, goToNext, stopSpotlightPopoverTour }: SpotlightPopoverTourStepRenderProps) => (
            <Button size="small" variant="primary" onClick={current === totalSteps - 1 ? stopSpotlightPopoverTour : goToNext}>
              {current === totalSteps - 1 ? "Done" : `Next (${current + 1}/${totalSteps})`}
            </Button>
          ),
        };
      });

      return (
        <div style={{ maxWidth: 360 }}>
          <SpotlightPopoverTour
            steps={steps}
            isOpen={isOpen}
            activeStep={activeStep}
            onOpenChange={setIsOpen}
            onStepChange={setActiveStep}
            onFinish={() => setIsOpen(false)}
          >
            <Stack gap="4">
              <Heading level="4" variant="heading-sm">
                Checkout details
              </Heading>
              {REQUIRED_CHECKOUT_FIELDS.map((field) => (
                <SpotlightPopoverTourStep key={field.name} name={field.name}>
                  <TextInput
                    id={field.name}
                    label={field.label}
                    necessityIndicator="required"
                    value={values[field.name] ?? ""}
                    onChange={({ value }) => setValues((v) => ({ ...v, [field.name]: value }))}
                    validationState={invalidFields.includes(field.name) ? "error" : "none"}
                    errorText={invalidFields.includes(field.name) ? `${field.label} is required.` : undefined}
                  />
                </SpotlightPopoverTourStep>
              ))}
              <Button variant="primary" onClick={handleSubmit}>
                Place order
              </Button>
            </Stack>
          </SpotlightPopoverTour>
        </div>
      );
    }
    return <Example />;
  },
};

/** The target sits far below the fold on a long order-summary page —
 * opening the tour scrolls it into view before the spotlight fades in. */
export const ScrollIntoView: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      const steps: SpotlightPopoverTourSteps = [
        {
          name: "coupon-field",
          title: "Got a coupon?",
          content: () => (
            <Text variant="body">Apply it here before you place your order — the page scrolls to it automatically.</Text>
          ),
          footer: ({ stopSpotlightPopoverTour }) => (
            <Button size="small" variant="primary" onClick={stopSpotlightPopoverTour}>
              Got it
            </Button>
          ),
        },
      ];
      return (
        <SpotlightPopoverTour steps={steps} isOpen={isOpen} activeStep={0} onOpenChange={setIsOpen} onFinish={() => setIsOpen(false)}>
          <Stack gap="4">
            <Button variant="primary" onClick={() => setIsOpen(true)}>
              Highlight coupon field
            </Button>
            {Array.from({ length: 12 }, (_, i) => (
              <Box key={i} padding="6" backgroundColor="sunken" borderRadius="md">
                <Text variant="body" color="secondary">
                  Order item {i + 1}
                </Text>
              </Box>
            ))}
            <SpotlightPopoverTourStep name="coupon-field">
              <TextInput id="coupon" label="Coupon code" placeholder="Enter coupon code" />
            </SpotlightPopoverTourStep>
            <Box padding="6" backgroundColor="sunken" borderRadius="md">
              <Text variant="body" color="secondary">
                Order summary
              </Text>
            </Box>
          </Stack>
        </SpotlightPopoverTour>
      );
    }
    return <Example />;
  },
};

const PLACEMENTS = ["top", "top-start", "top-end", "bottom", "bottom-start", "bottom-end", "left", "right"] as const;

export const Placement: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(true);
      const [activeStep, setActiveStep] = useState(0);
      const steps: SpotlightPopoverTourSteps = PLACEMENTS.map((placement) => ({
        name: placement,
        content: () => <Text variant="body">{placement}</Text>,
        placement,
        footer: ({ activeStep: current, totalSteps, goToNext, goToPrevious }: SpotlightPopoverTourStepRenderProps) => (
          <Inline gap="2">
            <Button size="small" variant="secondary" onClick={goToPrevious} isDisabled={current === 0}>
              Prev
            </Button>
            <Button size="small" variant="primary" onClick={goToNext} isDisabled={current === totalSteps - 1}>
              Next
            </Button>
          </Inline>
        ),
      }));
      return (
        <SpotlightPopoverTour
          steps={steps}
          isOpen={isOpen}
          activeStep={activeStep}
          onOpenChange={setIsOpen}
          onStepChange={setActiveStep}
          onFinish={() => setIsOpen(false)}
        >
          <Inline gap="4" wrap>
            {PLACEMENTS.map((placement) => (
              <SpotlightPopoverTourStep key={placement} name={placement}>
                <Button variant="secondary">{placement}</Button>
              </SpotlightPopoverTourStep>
            ))}
          </Inline>
        </SpotlightPopoverTour>
      );
    }
    return <Example />;
  },
};

/** Escape closes the tour (the card's close button does too — both call
 * `onOpenChange(false)`, not `onFinish`). Tab from the card also reaches
 * the spotlighted input itself, not just the card's own controls — SpotlightPopoverTour's
 * focus manager is deliberately non-modal, so the field it just pointed at
 * stays reachable. Try Tabbing or clicking into the field and typing while
 * the tour card is still open. */
export const KeyboardAndNonModalFocus: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(true);
      const steps: SpotlightPopoverTourSteps = [
        {
          name: "promo-code",
          title: "Try it now",
          content: () => <Text variant="body">Press Escape, or Tab past this card into the field below and type.</Text>,
        },
      ];
      return (
        <SpotlightPopoverTour steps={steps} isOpen={isOpen} activeStep={0} onOpenChange={setIsOpen} onFinish={() => setIsOpen(false)}>
          <Stack gap="4">
            <Button variant="secondary" onClick={() => setIsOpen(true)}>
              Reopen
            </Button>
            <SpotlightPopoverTourStep name="promo-code">
              <TextInput id="promo" label="Promo code" placeholder="Enter promo code" />
            </SpotlightPopoverTourStep>
          </Stack>
        </SpotlightPopoverTour>
      );
    }
    return <Example />;
  },
};
