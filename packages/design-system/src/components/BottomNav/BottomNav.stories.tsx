import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SearchIcon, CheckIcon } from "@farmsapp/icons";
import { BottomNav } from "./BottomNav";
import { BottomNavItem } from "./BottomNavItem";

const meta = {
  title: "Components/BottomNav",
  component: BottomNav,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof BottomNav>;

export default meta;
type Story = StoryObj<typeof meta>;

const tabs = [
  { id: "home", title: "Home", icon: CheckIcon },
  { id: "search", title: "Search", icon: SearchIcon },
  { id: "tasks", title: "Tasks", icon: CheckIcon },
];

export const Default: Story = {
  args: { children: null },
  render: () => {
    const [active, setActive] = useState("home");
    return (
      <div style={{ minHeight: "100vh" }}>
        <BottomNav>
          {tabs.map((tab) => (
            <BottomNavItem
              key={tab.id}
              title={tab.title}
              icon={tab.icon}
              isActive={active === tab.id}
              onClick={() => setActive(tab.id)}
            />
          ))}
        </BottomNav>
      </div>
    );
  },
};
