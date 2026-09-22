import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertCircleIcon, CheckIcon, EyeIcon, SearchIcon } from "@farmsapp/icons";
import { ActionList } from "./ActionList";
import { ActionListItem, ActionListItemBadge, ActionListItemIcon, ActionListItemText } from "./ActionListItem";
import { ActionListSection } from "./ActionListSection";

const meta = {
  title: "Components/ActionList",
  component: ActionList,
  tags: ["autodocs"],
  // ActionList reads Dropdown context, so it only renders inside a Dropdown.
  // Every story builds its own trigger and overlay — these args only satisfy
  // the required `children` at the meta level.
  args: { children: null },
} satisfies Meta<typeof ActionList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Items with a title only. */
export const Default: Story = {
  render: () => (

    <ActionList>
      <ActionListItem title="View details" value="view" />
      <ActionListItem title="Duplicate" value="duplicate" />
      <ActionListItem title="Archive" value="archive" />
      <ActionListItem title="Delete" value="delete" />
    </ActionList>
  ),
};

/** A leading icon on each item, via `leading` + ActionListItemIcon. */
export const LeadingIcons: Story = {
  render: () => (
    <ActionList>
      <ActionListItem title="View details" value="view" leading={<ActionListItemIcon icon={EyeIcon} />} />
      <ActionListItem title="Search" value="search" leading={<ActionListItemIcon icon={SearchIcon} />} />
      <ActionListItem title="Report issue" value="report" leading={<ActionListItemIcon icon={AlertCircleIcon} />} />
    </ActionList>
  ),
};

/** Trailing content via `trailing`: helper text (ActionListItemText) or an
 * icon (ActionListItemIcon). */
export const TrailingIconsAndText: Story = {
  render: () => (
    <ActionList>
      <ActionListItem title="Duplicate" value="duplicate" trailing={<ActionListItemText>Ctrl+D</ActionListItemText>} />
      <ActionListItem title="Find" value="find" trailing={<ActionListItemText>Ctrl+F</ActionListItemText>} />
      <ActionListItem title="Selected" value="selected" trailing={<ActionListItemIcon icon={CheckIcon} />} />
    </ActionList>
  ),
};

/** Items grouped under titled sections (`role="group"`). */
export const WithSections: Story = {
  render: () => (
    <ActionList>
      <ActionListSection title="Account">
        <ActionListItem title="Profile" value="profile" />
        <ActionListItem title="Settings" value="settings" />
      </ActionListSection>
      {/* <ActionListSection title="Danger zone"> */}
        <ActionListItem title="Delete account" value="delete" intent="negative" />
      {/* </ActionListSection> */}
    </ActionList>
  ),
};

function UserItem({ name, email }: { name: string; email: string }) {
  return <ActionListItem title={name} value={email} description={email} />;
}

/** Items register themselves, so your own wrapper components, fragments and
 * conditional items all work as children — nothing scans the children. */
export const CustomItems: Story = {
  render: () => {
    const showAdmin = true;
    return (
      <ActionList>
        <UserItem name="Asha Patel" email="asha@example.com" />
        <>
          <UserItem name="Ravi Kumar" email="ravi@example.com" />
          <UserItem name="Meera Shah" email="meera@example.com" />
        </>
        {showAdmin ? <UserItem name="Admin" email="admin@example.com" /> : null}
      </ActionList>
    );
  },
};

/** Every slot together: leading icon, title, description, badge after the
 * title, trailing icon; plus a disabled and a destructive item. */
export const ItemSlots: Story = {
  render: () => (
    <ActionList>
      <ActionListItem
        title="Alerts"
        value="alerts"
        description="Notifications that need attention"
        leading={<ActionListItemIcon icon={AlertCircleIcon} />}
        titleSuffix={<ActionListItemBadge color="danger">3</ActionListItemBadge>}
        trailing={<ActionListItemIcon icon={CheckIcon} />}
      />
      <ActionListItem title="Unavailable" value="unavailable" isDisabled />
      <ActionListItem title="Delete" value="delete" intent="negative" leading={<ActionListItemIcon icon={AlertCircleIcon} />} />
    </ActionList>
  ),
};
