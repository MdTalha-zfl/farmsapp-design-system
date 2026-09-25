import { forwardRef, useState, type AnchorHTMLAttributes, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertCircleIcon, CheckIcon, EyeIcon, SearchIcon, XIcon } from "@farmsapp/icons";
import { SideNav } from "./SideNav";
import { SideNavHeader } from "./SideNavHeader";
import { SideNavBody } from "./SideNavBody";
import { SideNavFooter } from "./SideNavFooter";
import { SideNavSection } from "./SideNavSection";
import { SideNavLink } from "./SideNavLink";
import { SideNavLevel } from "./SideNavLevel";
import { SideNavItem } from "./SideNavItem";
import { Badge } from "../Badge/Badge";
import { Switch } from "../Switch/Switch";
import { Heading } from "../Heading/Heading";
import { IconButton } from "../IconButton/IconButton";
import { Text } from "../Text/Text";

const meta = {
  title: "Components/SideNav",
  component: SideNav,
  tags: ["autodocs"],
  // The nav is `position: fixed`; rendering each docs story in its own iframe
  // stops several navs stacking on the left edge of the one docs page.
  parameters: { layout: "fullscreen", docs: { story: { inline: false, iframeHeight: 520 } } },
  args: { children: null },
} satisfies Meta<typeof SideNav>;

export default meta;
type Story = StoryObj<typeof meta>;

/** SideNav is fixed and takes no space in the page, so the content beside it
 * is offset by its width token. */
function Page({ children, id = "main" }: { children?: ReactNode; id?: string }) {
  return (
    <main id={id} style={{ minHeight: "100vh", padding: "var(--ds-space-6)", marginInlineStart: "var(--ds-layout-side-nav-width-expanded)" }}>
      <Heading level="2" variant="heading-md">
        Page content
      </Heading>
      <Text variant="body" color="secondary">
        Offset by var(--ds-layout-side-nav-width-expanded).
      </Text>
      {children}
    </main>
  );
}

/** A stand-in brand mark. On the collapsed rail it is all that shows of the
 * header, so it carries the accessible name. */
function Logo() {
  return (
    <span
      role="img"
      aria-label="Farms"
      style={{
        display: "grid",
        placeItems: "center",
        width: 32,
        height: 32,
        borderRadius: "var(--ds-radius-md)",
        backgroundColor: "var(--ds-color-action-primary)",
        color: "var(--ds-color-text-inverse)",
        fontWeight: 700,
      }}
    >
      F
    </span>
  );
}

/** SideNavHeader is pinned above the body, as the footer is below it: a
 * logo, a title and subtitle, and an optional `trailing` action. It spans
 * the whole nav and stays in place while a level is open (see
 * NestedLevels); with `isExpanded={false}` only the logo shows. */
export const Header: Story = {
  render: () => (
    <>
      <SideNav accessibilityLabel="With header">
        <SideNavHeader
          leading={<Logo />}
          title="Farms Business"
          trailing={<IconButton icon={SearchIcon} size="small" emphasis="subtle" accessibilityLabel="Search" />}
        />
        <SideNavBody>
          <SideNavLink title="Home" href="#home" icon={CheckIcon} isActive />
          <SideNavLink title="Payouts" href="#payouts" icon={EyeIcon} />
        </SideNavBody>
      </SideNav>
      <Page />
    </>
  ),
};

/** Two titled sections in the scrolling body and a pinned footer. The
 * consumer owns the active state (`isActive`) — SideNav never reads the URL. */
export const Default: Story = {
  render: () => {
    function Example() {
      const [active, setActive] = useState("dashboard");
      const item = (id: string, title: string, icon?: typeof SearchIcon) => (
        <SideNavLink
          key={id}
          title={title}
          {...(icon ? { icon } : {})}
          isActive={active === id}
          onClick={() => setActive(id)}
        />
      );
      return (
        <>
          <SideNav accessibilityLabel="Main">
            <SideNavBody>
              <SideNavSection title="Overview">
                {item("dashboard", "Dashboard", CheckIcon)}
                {item("reports", "Reports", EyeIcon)}
                {item("search", "Search", SearchIcon)}
              </SideNavSection>
              <SideNavSection title="Account">
                {item("alerts", "Alerts", AlertCircleIcon)}
                {item("settings", "Settings")}
              </SideNavSection>
            </SideNavBody>
            <SideNavFooter>
              {item("help", "Help & support")}
              {item("logout", "Log out")}
            </SideNavFooter>
          </SideNav>
          <Page />
        </>
      );
    }
    return <Example />;
  },
};

/** Items with real destinations render as anchors; ones with no `href` render
 * as buttons, so a click-only action isn't a fake link. */
export const LinksAndButtons: Story = {
  render: () => (
    <>
      <SideNav accessibilityLabel="Links and buttons">
        <SideNavBody>
          <SideNavLink title="A real link (href)" href="#link" icon={CheckIcon} isActive />
          <SideNavLink title="Opens in a new tab" href="https://example.com" target="_blank" icon={EyeIcon} />
          <SideNavLink title="A button (no href)" icon={SearchIcon} onClick={() => window.alert("clicked")} />
        </SideNavBody>
      </SideNav>
      <Page />
    </>
  ),
};

/** `isDisabled` renders a non-navigating item with `aria-disabled`; it can't
 * be reached with Tab and shows no hover state. (Blade has no disabled
 * state.) */
export const ActiveAndDisabled: Story = {
  render: () => (
    <>
      <SideNav accessibilityLabel="States">
        <SideNavBody>
          <SideNavLink title="Default" href="#a" icon={CheckIcon} />
          <SideNavLink title="Active (aria-current=page)" href="#b" icon={CheckIcon} isActive />
          <SideNavLink title="Disabled" href="#c" icon={CheckIcon} isDisabled />
        </SideNavBody>
      </SideNav>
      <Page />
    </>
  ),
};

/** `titleSuffix` is non-interactive content after the title (a Badge).
 * `trailing` appears on hover or keyboard focus and may be interactive — it
 * sits beside the link, not inside it, so a real button is valid there. */
export const TitleSuffixAndTrailing: Story = {
  render: () => (
    <>
      <SideNav accessibilityLabel="Suffix and trailing">
        <SideNavBody>
          <SideNavLink title="Alerts" href="#a" icon={AlertCircleIcon} titleSuffix={<Badge color="danger">3</Badge>} />
          <SideNavLink
            title="Saved filters"
            href="#b"
            icon={SearchIcon}
            trailing={<IconButton icon={XIcon} size="small" emphasis="subtle" accessibilityLabel="Remove saved filters" />}
          />
        </SideNavBody>
      </SideNav>
      <Page />
    </>
  ),
};

/** A label too long for the rail ellipsizes; hovering it reveals the full text
 * as a native tooltip (only when it is actually truncated). */
export const LongLabels: Story = {
  render: () => (
    <>
      <SideNav accessibilityLabel="Long labels">
        <SideNavBody>
          <SideNavSection title="A section title that is far too long to fit in the rail">
            <SideNavLink title="A very long navigation label that cannot possibly fit" href="#a" icon={CheckIcon} />
            <SideNavLink title="Short" href="#b" icon={CheckIcon} />
          </SideNavSection>
        </SideNavBody>
      </SideNav>
      <Page />
    </>
  ),
};

/** Many items: only the body scrolls; the footer stays pinned. */
export const ManyItemsScroll: Story = {
  render: () => (
    <>
      <SideNav accessibilityLabel="Many items">
        <SideNavBody>
          <SideNavSection title="Everything">
            {Array.from({ length: 40 }, (_, i) => (
              <SideNavLink key={i} title={`Item ${i + 1}`} href={`#item-${i + 1}`} icon={CheckIcon} isActive={i === 2} />
            ))}
          </SideNavSection>
        </SideNavBody>
        <SideNavFooter>
          <SideNavLink title="Pinned footer link" href="#footer" />
        </SideNavFooter>
      </SideNav>
      <Page />
    </>
  ),
};

/** SideNav has no built-in toggle — the consumer owns `isExpanded` and its
 * own button (here, an IconButton in the footer). The collapsed rail keeps
 * every label in the accessibility tree (visually clipped, not hidden); the
 * icon's title attribute stands in for sighted mouse users. */
export const Collapsible: Story = {
  render: () => {
    function Example() {
      const [isExpanded, setIsExpanded] = useState(true);
      return (
        <>
          <SideNav accessibilityLabel="Collapsible" isExpanded={isExpanded}>
            <SideNavHeader leading={<Logo />} title="Farms Business" subtitle="RBL20I43" />
            <SideNavBody>
              <SideNavSection title="Overview">
                <SideNavLink title="Dashboard" href="#a" icon={CheckIcon} isActive />
                <SideNavLink title="Reports" href="#b" icon={EyeIcon} />
                <SideNavLink title="Search" href="#c" icon={SearchIcon} />
              </SideNavSection>
            </SideNavBody>
            <SideNavFooter>
              <SideNavLink
                title={isExpanded ? "Collapse" : "Expand"}
                icon={isExpanded ? XIcon : CheckIcon}
                onClick={() => setIsExpanded((prev) => !prev)}
              />
            </SideNavFooter>
          </SideNav>
          <Page />
        </>
      );
    }
    return <Example />;
  },
};

/** A level-1 SideNavLink wrapping a `<SideNavLevel>` opens that level
 * whenever it is `isActive`. The trigger must therefore stay active while
 * any of its children is, just as a router marks a parent route active on a
 * sub-route. Here `active` is a path, and a trigger is active for anything
 * under it. Clicking a trigger goes to its first child, as a router link to
 * that section would.
 *
 * While a level is open, L1 shrinks to the rail on top of it; the nav keeps
 * its width. Hovering the rail widens L1 back over the level until the
 * pointer leaves. A SideNavLink with plain children inside a level is an
 * inline accordion (L3), as "Business" shows. */
export const NestedLevels: Story = {
  parameters: { docs: { story: { iframeHeight: 680 } } },
  render: () => {
    function Example() {
      const [active, setActive] = useState("card/user-profile");
      const [isTestMode, setIsTestMode] = useState(false);
      const link = (path: string, title: string, props: { icon?: typeof SearchIcon; description?: string } = {}) => (
        <SideNavLink key={path} title={title} {...props} isActive={active === path} onClick={() => setActive(path)} />
      );
      const trigger = (group: string, title: string, icon: typeof SearchIcon, firstChild: string) => ({
        title,
        icon,
        isActive: active.startsWith(`${group}/`),
        onClick: () => setActive(`${group}/${firstChild}`),
      });
      return (
        <>
          <SideNav accessibilityLabel="Nested levels">
            <SideNavHeader leading={<Logo />} title="Farms Business" subtitle="RBL20I43" />
            <SideNavBody>
              {link("home", "Home", { icon: CheckIcon })}
              {link("payouts", "Payouts", { icon: EyeIcon })}
              {link("statement", "Account Statement", { icon: SearchIcon })}
              <SideNavSection title="International Payments">
                <SideNavLink {...trigger("global", "Global", AlertCircleIcon, "user-profile")}>
                  <SideNavLevel>
                    {link("global/user-profile", "User Profile", { description: "RBL20I43" })}
                    {link("global/billing", "Billing", { description: "RBL20I43" })}
                  </SideNavLevel>
                </SideNavLink>
              </SideNavSection>
              <SideNavSection title="Offerings" maxVisibleItems={3}>
                <SideNavLink {...trigger("card", "Corporate Credit Card", CheckIcon, "user-profile")}>
                  <SideNavLevel>
                    {link("card/user-profile", "User Profile")}
                    <SideNavLink title="Business" defaultIsExpanded={active.startsWith("card/business/")}>
                      {link("card/business/details", "Business Details")}
                      {link("card/business/documents", "Business Documents")}
                    </SideNavLink>
                    {link("card/billing", "Billing")}
                    {link("card/bank-accounts", "Bank Accounts")}
                    {link("card/payment-methods", "Payment Methods")}
                    {link("card/transactions", "Transactions")}
                  </SideNavLevel>
                </SideNavLink>
                {link("vendor-payments", "Vendor Payments", { icon: EyeIcon })}
                {link("tax-payments", "Tax Payments", { icon: SearchIcon })}
                {link("payroll", "Payroll", { icon: CheckIcon })}
                {link("invoices", "Invoices", { icon: EyeIcon })}
              </SideNavSection>
            </SideNavBody>
            <SideNavFooter>
              <li>
                <SideNavItem
                  title="Test Mode"
                  leading={AlertCircleIcon}
                  trailing={<Switch accessibilityLabel="Test Mode" size="small" isChecked={isTestMode} onChange={({ isChecked }) => setIsTestMode(isChecked)} />}
                />
              </li>
              {link("settings", "Settings", { icon: SearchIcon })}
            </SideNavFooter>
          </SideNav>
          <Page />
        </>
      );
    }
    return <Example />;
  },
};

/** Below 768px, passing `onDismiss` turns SideNav into a Drawer you open
 * with your own button (`isOpen`). A level replaces the list inside the same
 * Drawer, with a Back button; following a link closes the menu. Opening the
 * menu while a level's page is active goes straight to that level. Opens at
 * a phone viewport — at desktop width it renders the rail instead. */
export const Mobile: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
  parameters: { docs: { story: { iframeHeight: 680 } } },
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      const [active, setActive] = useState("home");
      const link = (path: string, title: string, props: { icon?: typeof SearchIcon; description?: string } = {}) => (
        <SideNavLink key={path} title={title} {...props} isActive={active === path} onClick={() => setActive(path)} />
      );
      return (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-3)", padding: "var(--ds-space-3)" }}>
            <IconButton icon={SearchIcon} accessibilityLabel="Open menu" onClick={() => setIsOpen(true)} />
            <Text variant="body" weight="semibold">
              {active}
            </Text>
          </div>
          <SideNav accessibilityLabel="Main" isOpen={isOpen} onDismiss={() => setIsOpen(false)}>
            <SideNavHeader leading={<Logo />} title="Farms Business" subtitle="RBL20I43" />
            <SideNavBody>
              {link("home", "Home", { icon: CheckIcon })}
              {link("payouts", "Payouts", { icon: EyeIcon })}
              <SideNavSection title="Offerings">
                <SideNavLink
                  title="Corporate Credit Card"
                  icon={CheckIcon}
                  isActive={active.startsWith("card/")}
                  onClick={() => setActive("card/user-profile")}
                >
                  <SideNavLevel>
                    {link("card/user-profile", "User Profile", { description: "RBL20I43" })}
                    <SideNavLink title="Business" defaultIsExpanded={active.startsWith("card/business/")}>
                      {link("card/business/details", "Business Details")}
                      {link("card/business/documents", "Business Documents")}
                    </SideNavLink>
                    {link("card/billing", "Billing", { description: "RBL20I43" })}
                  </SideNavLevel>
                </SideNavLink>
                {link("vendor-payments", "Vendor Payments", { icon: EyeIcon })}
              </SideNavSection>
            </SideNavBody>
            <SideNavFooter>{link("settings", "Settings", { icon: SearchIcon })}</SideNavFooter>
          </SideNav>
        </>
      );
    }
    return <Example />;
  },
};

/** `maxVisibleItems` on SideNavSection collapses the rest behind a
 * "+N More" toggle. */
export const SectionOverflow: Story = {
  render: () => (
    <>
      <SideNav accessibilityLabel="Section overflow">
        <SideNavBody>
          <SideNavSection title="Everything" maxVisibleItems={3}>
            {Array.from({ length: 8 }, (_, i) => (
              <SideNavLink key={i} title={`Item ${i + 1}`} href={`#item-${i + 1}`} icon={CheckIcon} />
            ))}
          </SideNavSection>
        </SideNavBody>
      </SideNav>
      <Page />
    </>
  ),
};

/** A router link via `as`. SideNav passes `href` as `to` (React Router's
 * `NavLink` convention, as Blade does). This stand-in just renders an anchor
 * and shows the `to` it received. */
const FakeRouterLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement> & { to?: string }>(
  function FakeRouterLink({ to, children, ...rest }, ref) {
    return (
      <a ref={ref} href={`#route${to ?? ""}`} data-to={to} {...rest}>
        {children}
      </a>
    );
  },
);

export const RouterLink: Story = {
  render: () => (
    <>
      <SideNav accessibilityLabel="Router links">
        <SideNavBody>
          <SideNavLink as={FakeRouterLink} title="Dashboard" href="/dashboard" icon={CheckIcon} isActive />
          <SideNavLink as={FakeRouterLink} title="Reports" href="/reports" icon={EyeIcon} />
        </SideNavBody>
      </SideNav>
      <Page />
    </>
  ),
};

/** `skipToContentId` adds a "Skip to content" link, revealed on keyboard
 * focus. Press Tab once after the page loads. */
export const SkipLink: Story = {
  render: () => (
    <>
      <SideNav accessibilityLabel="With skip link" skipToContentId="main-content">
        <SideNavBody>
          <SideNavLink title="Dashboard" href="#a" icon={CheckIcon} isActive />
          <SideNavLink title="Reports" href="#b" icon={EyeIcon} />
        </SideNavBody>
      </SideNav>
      <Page id="main-content" />
    </>
  ),
};

/** Logical CSS properties: in a right-to-left context the nav moves to the
 * start (right) edge and the content offset follows. */
export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl">
      <SideNav accessibilityLabel="RTL">
        <SideNavBody>
          <SideNavLink title="Dashboard" href="#a" icon={CheckIcon} isActive />
          <SideNavLink title="Reports" href="#b" icon={EyeIcon} />
        </SideNavBody>
      </SideNav>
      <Page />
    </div>
  ),
};
