import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertCircleIcon, CheckIcon, ChevronDownIcon, SearchIcon } from "@farmsapp/icons";
import { Dropdown } from "./Dropdown";
import { DropdownOverlay } from "./DropdownOverlay";
import { DropdownButton } from "./DropdownButton";
import { DropdownIconButton } from "./DropdownIconButton";
import { ActionList } from "../ActionList/ActionList";
import { ActionListSection } from "../ActionList/ActionListSection";
import { ActionListItem, ActionListItemBadge, ActionListItemIcon } from "../ActionList/ActionListItem";
import { DropdownFooter, DropdownHeader } from "./DropdownHeaderFooter";
import { SelectInput } from "./SelectInput";
import { AutoComplete } from "./AutoComplete";
import { Button } from "../Button/Button";
import { Inline } from "../Inline/Inline";
import { Modal } from "../Modal/Modal";
import { ModalBody } from "../Modal/ModalBody";
import { ModalHeader } from "../Modal/ModalHeader";
import { Popover } from "../Popover/Popover";
import { Stack } from "../Stack/Stack";
import { Text } from "../Text/Text";

const meta = {
  title: "Components/Dropdown",
  component: Dropdown,
  tags: ["autodocs"],
  // Every story below builds its own trigger and overlay — these args only
  // satisfy the required `children` at the meta level.
  args: { children: null },
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A menu opened from a button. Keyboard: Enter, Space or ArrowDown on the
 * button opens it and focuses the first item; Up/Down move (and wrap), Home/
 * End jump, typing a letter jumps to the next item that starts with it,
 * Enter/Space choose, Escape closes and returns focus to the button, and Tab
 * closes it. Disabled items are skipped. */
export const ButtonMenu: Story = {
  render: () => (
    <Dropdown>
      <DropdownButton variant="primary" icon={ChevronDownIcon} iconPosition="right">
        Actions
      </DropdownButton>
      <DropdownOverlay>
        <ActionList>
          <ActionListItem title="View details" value="view"  />
          <ActionListItem title="Duplicate" value="duplicate" />
          <ActionListItem title="Archive" value="archive"  />
          <ActionListItem title="Delete" value="delete" intent="negative" />
        </ActionList>
      </DropdownOverlay>
    </Dropdown>
  ),
};

/** An icon-only trigger. */
export const IconButtonTrigger: Story = {
  render: () => (
    <Dropdown>
      <DropdownIconButton icon={ChevronDownIcon} accessibilityLabel="More actions" emphasis="subtle" />
      <DropdownOverlay>
        <ActionList>
          <ActionListItem title="Rename" value="rename" />
          <ActionListItem title="Move" value="move" />
          <ActionListItem title="Remove" value="remove" intent="negative" />
        </ActionList>
      </DropdownOverlay>
    </Dropdown>
  ),
};

/** `defaultPlacement` picks the preferred side. The panel still flips to the
 * other side and shifts along the edge to stay in view — try narrowing the
 * viewport, or scrolling a trigger near the bottom. */
export const Placement: Story = {
  render: () => (
    <Inline gap="4" wrap>
      {(["bottom-start", "bottom-end", "top-start", "right-start"] as const).map((placement) => (
        <Dropdown key={placement}>
          <DropdownButton variant="tertiary">{placement}</DropdownButton>
          <DropdownOverlay defaultPlacement={placement}>
            <ActionList>
              <ActionListItem title="One" value="1" />
              <ActionListItem title="Two" value="2" />
              <ActionListItem title="Three" value="3" />
            </ActionList>
          </DropdownOverlay>
        </Dropdown>
      ))}
    </Inline>
  ),
};

/** Every item slot: `leading`, `description`, `titleSuffix`, `trailing`. A
 * label too long for the panel ellipsizes. */
export const ItemSlots: Story = {
  render: () => (
    <Dropdown>
      <DropdownButton variant="secondary">Item slots</DropdownButton>
      <DropdownOverlay>
        <ActionList>
          <ActionListItem
            title="Search records"
            value="search"
            description="Find anything across your account"
            leading={<ActionListItemIcon icon={SearchIcon} />}
          />
          <ActionListItem
            title="Alerts"
            value="alerts"
            leading={<ActionListItemIcon icon={AlertCircleIcon} />}
            titleSuffix={<ActionListItemBadge color="danger">3</ActionListItemBadge>}
            trailing={<ActionListItemIcon icon={CheckIcon} />}
          />
          <ActionListItem title="A label that is far too long to fit inside the panel without being truncated" value="long" />
        </ActionList>
      </DropdownOverlay>
    </Dropdown>
  ),
};

/** 60 items: the panel is capped at 300px (or the space actually available,
 * whichever is smaller) and scrolls; keyboard navigation scrolls the focused
 * item into view. */
export const LongList: Story = {
  render: () => (
    <Dropdown>
      <DropdownButton variant="secondary">Long list</DropdownButton>
      <DropdownOverlay>
        <ActionList>
          {Array.from({ length: 60 }, (_, i) => (
            <ActionListItem key={i} title={`Option ${i + 1}`} value={`option-${i + 1}`} />
          ))}
        </ActionList>
      </DropdownOverlay>
    </Dropdown>
  ),
};

function Group({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

/** Items register themselves, so none of this needs special handling: a
 * fragment, a wrapper component, a conditional item, and items added or
 * removed while the menu is open (Blade's ActionList throws in dev on a
 * fragment or wrapper, and keeps position by index, which drifts). Toggle the
 * extra item, then use the arrow keys. */
export const DynamicItems: Story = {
  render: () => {
    function Example() {
      const [showExtra, setShowExtra] = useState(false);
      return (
        <Stack gap="2">
          <Button size="small" variant="tertiary" onClick={() => setShowExtra((value) => !value)}>
            {showExtra ? "Remove the extra item" : "Add an extra item"}
          </Button>
          <Dropdown>
            <DropdownButton variant="secondary">Dynamic items</DropdownButton>
            <DropdownOverlay>
              <ActionList>
                <ActionListItem title="Always here" value="always" />
                <>
                  <ActionListItem title="Inside a fragment" value="fragment" />
                </>
                <Group>
                  <ActionListItem title="Inside a wrapper component" value="wrapper" />
                </Group>
                {showExtra ? <ActionListItem title="The extra item" value="extra" /> : null}
                <ActionListItem title="Last item" value="last" />
              </ActionList>
            </DropdownOverlay>
          </Dropdown>
        </Stack>
      );
    }
    return <Example />;
  },
};

/** `onClick` receives the item's `value` as `name`. */
export const OnClickPayload: Story = {
  render: () => {
    function Example() {
      const [chosen, setChosen] = useState("nothing yet");
      return (
        <Stack gap="2">
          <Text variant="body">{`Last chosen: ${chosen}`}</Text>
          <Dropdown>
            <DropdownButton variant="secondary">Choose</DropdownButton>
            <DropdownOverlay>
              <ActionList>
                <ActionListItem title="Alpha" value="alpha" onClick={({ name }) => setChosen(name)} />
                <ActionListItem title="Beta" value="beta" onClick={({ name }) => setChosen(name)} />
              </ActionList>
            </DropdownOverlay>
          </Dropdown>
        </Stack>
      );
    }
    return <Example />;
  },
};

/** Fully controlled from outside with `isOpen`/`onOpenChange`. */
export const Controlled: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <Stack gap="2">
          <Inline gap="2">
            <Button size="small" variant="tertiary" onClick={() => setIsOpen(true)}>
              Open externally
            </Button>
            <Button size="small" variant="tertiary" onClick={() => setIsOpen(false)}>
              Close externally
            </Button>
          </Inline>
          <Dropdown isOpen={isOpen} onOpenChange={setIsOpen}>
            <DropdownButton variant="secondary">Controlled</DropdownButton>
            <DropdownOverlay>
              <ActionList>
                <ActionListItem title="One" value="1" />
                <ActionListItem title="Two" value="2" />
              </ActionList>
            </DropdownOverlay>
          </Dropdown>
        </Stack>
      );
    }
    return <Example />;
  },
};

function SampleMenu({ label }: { label: string }) {
  return (
    <Dropdown>
      <DropdownButton variant="secondary" icon={ChevronDownIcon} iconPosition="right">
        {label}
      </DropdownButton>
      <DropdownOverlay>
        <ActionList>
          <ActionListItem title="First " value="1" />
          <ActionListItem title="Second" value="2" />
          <ActionListItem title="Third" value="3" />
        </ActionList>
      </DropdownOverlay>
    </Dropdown>
  );
}

/** A dropdown inside a Modal renders above it, and Escape closes only the
 * dropdown — the first press must not also close the Modal. (Its z-index token
 * is above Modal, Drawer, BottomSheet and Popover.) */
export const InsideModal: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setIsOpen(true)}>Open modal</Button>
          <Modal isOpen={isOpen} onDismiss={() => setIsOpen(false)} accessibilityLabel="Dropdown in a modal">
            <ModalHeader title="Dropdown in a modal" />
            <ModalBody>
              <SampleMenu label="Menu in a modal" />
            </ModalBody>
          </Modal>
        </>
      );
    }
    return <Example />;
  },
};

export const InsidePopover: Story = {
  render: () => (
    <Popover title="Dropdown in a popover" content={<SampleMenu label="Menu in a popover" />}>
      <Button variant="secondary">Open popover</Button>
    </Popover>
  ),
};

const COUNTRIES = [
  { value: "in", title: "India" },
  { value: "np", title: "Nepal" },
  { value: "bd", title: "Bangladesh" },
  { value: "lk", title: "Sri Lanka" },
  { value: "bt", title: "Bhutan" },
] as const;

function CountryItems() {
  return (
    <ActionList>
      {COUNTRIES.map((country) => (
        <ActionListItem key={country.value} title={country.title} value={country.value} />
      ))}
    </ActionList>
  );
}

/** A select. The field shows the chosen item's *title* (India), even before
 * the list has ever been opened, because the items report their titles by
 * value. Focus stays on the field the whole time (`aria-activedescendant`
 * tracks the highlighted option): ArrowDown/Up move, Home/End jump, typing
 * jumps by title, Enter/Space choose, Escape closes. Opening starts on the
 * selected option, and the panel is exactly as wide as the field. */
export const SingleSelect: Story = {
  render: () => (
    <div>
      <Dropdown>
        <SelectInput label="Country" placeholder="Choose a country" defaultValue="in" />
        <DropdownOverlay>
          <CountryItems />
        </DropdownOverlay>
      </Dropdown>
    </div>
  ),
};

/** Controlled with `value`/`onChange`. `onChange` receives Blade's shape:
 * `values` is an array even for a single select. Passing `""` clears it. */
export const ControlledSelect: Story = {
  render: () => {
    function Example() {
      const [country, setCountry] = useState("np");
      return (
        <Stack gap="2">
          <Text variant="body">{`Selected: ${country || "nothing"}`}</Text>
          <div style={{ width: 280 }}>
            <Dropdown>
              <SelectInput
                label="Country"
                placeholder="Choose a country"
                value={country}
                onChange={({ values }) => setCountry(values[0] ?? "")}
              />
              <DropdownOverlay>
                <CountryItems />
              </DropdownOverlay>
            </Dropdown>
          </div>
          <Button size="small" variant="tertiary" onClick={() => setCountry("")}>
            Clear
          </Button>
        </Stack>
      );
    }
    return <Example />;
  },
};

/** Sections group options under a title (a `role="group"` named by it) with a
 * divider between groups. Keyboard navigation runs straight through them, and
 * disabled options are skipped. */
export const SelectWithSections: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <Dropdown>
        <SelectInput label="Crop" placeholder="Choose a crop" />
        <DropdownOverlay>
          <ActionList>
            <ActionListSection title="Grains">
              <ActionListItem title="Wheat" value="wheat" />
              <ActionListItem title="Rice" value="rice" />
              <ActionListItem title="Barley" value="barley" isDisabled />
            </ActionListSection>
            <ActionListSection title="Pulses">
              <ActionListItem title="Lentil" value="lentil" />
              <ActionListItem title="Chickpea" value="chickpea" />
            </ActionListSection>
          </ActionList>
        </DropdownOverlay>
      </Dropdown>
    </div>
  ),
};

/** Help text, validation error, disabled. */
export const SelectStates: Story = {
  render: () => (
    <Stack gap="4">
      <div style={{ width: 280 }}>
        <Dropdown>
          <SelectInput label="With help text" helpText="Pick the closest match" placeholder="Choose" />
          <DropdownOverlay>
            <CountryItems />
          </DropdownOverlay>
        </Dropdown>
      </div>
      <div style={{ width: 280 }}>
        <Dropdown>
          <SelectInput
            label="With an error"
            necessityIndicator="required"
            validationState="error"
            errorText="Please choose a country"
            placeholder="Choose"
          />
          <DropdownOverlay>
            <CountryItems />
          </DropdownOverlay>
        </Dropdown>
      </div>
      <div style={{ width: 280 }}>
        <Dropdown>
          <SelectInput label="Disabled" isDisabled defaultValue="bd" />
          <DropdownOverlay>
            <CountryItems />
          </DropdownOverlay>
        </Dropdown>
      </div>
    </Stack>
  ),
};

/** 60 options with the 45th selected: opening the list scrolls straight to the
 * selected option. */
export const SelectLongList: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <Dropdown>
        <SelectInput label="Option" defaultValue="option-45" />
        <DropdownOverlay>
          <ActionList>
            {Array.from({ length: 60 }, (_, i) => (
              <ActionListItem key={i} title={`Option ${i + 1}`} value={`option-${i + 1}`} />
            ))}
          </ActionList>
        </DropdownOverlay>
      </Dropdown>
    </div>
  ),
};

/** With a `name`, the select renders a hidden input, so it takes part in a
 * plain HTML form. */
export const InsideAForm: Story = {
  render: () => {
    function Example() {
      const [submitted, setSubmitted] = useState("(not submitted)");
      return (
        <form
          style={{ width: 280 }}
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))));
          }}
        >
          <Stack gap="2">
            <Dropdown>
              <SelectInput name="country" label="Country" defaultValue="lk" />
              <DropdownOverlay>
                <CountryItems />
              </DropdownOverlay>
            </Dropdown>
            <Button type="submit">Submit</Button>
            <Text variant="body">{`FormData: ${submitted}`}</Text>
          </Stack>
        </form>
      );
    }
    return <Example />;
  },
};

/** A header and footer pin above and below the scrolling list, on a select or
 * a menu. They sit outside the list element, so they are never options, and
 * pressing them does not steal focus. */
export const HeaderAndFooter: Story = {
  render: () => (
    <Dropdown>
      <DropdownButton variant="secondary" icon={ChevronDownIcon} iconPosition="right">
        With header and footer
      </DropdownButton>
      <DropdownOverlay>
        <DropdownHeader title="Sort by" subtitle="Applies to this list only" />
        <ActionList>
          {Array.from({ length: 20 }, (_, i) => (
            <ActionListItem key={i} title={`Sort key ${i + 1}`} value={`key-${i + 1}`} />
          ))}
        </ActionList>
        <DropdownFooter>
          <Button size="small" variant="tertiary">
            Reset
          </Button>
        </DropdownFooter>
      </DropdownOverlay>
    </Dropdown>
  ),
};

/** A select inside a Modal: the panel renders above it, and Escape closes just
 * the list, even though DOM focus never leaves the field. */
export const SelectInsideModal: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setIsOpen(true)}>Open modal</Button>
          <Modal isOpen={isOpen} onDismiss={() => setIsOpen(false)} accessibilityLabel="Select in a modal">
            <ModalHeader title="Select in a modal" />
            <ModalBody>
              <Dropdown>
                <SelectInput label="Country" placeholder="Choose" />
                <DropdownOverlay>
                  <CountryItems />
                </DropdownOverlay>
              </Dropdown>
            </ModalBody>
          </Modal>
        </>
      );
    }
    return <Example />;
  },
};

/** `selectionType="multiple"`: options get a checkbox, picking one toggles it
 * and the list stays open (Escape, Tab or an outside click closes it). Chosen
 * values show as removable tags in the field. Backspace on the field removes
 * the last tag. Opening starts on the first chosen option. */
export const MultipleSelect: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <Dropdown>
        <SelectInput
          selectionType="multiple"
          label="Countries"
          placeholder="Choose countries"
          defaultValue={["in", "np"]}
        />
        <DropdownOverlay>
          <CountryItems />
        </DropdownOverlay>
      </Dropdown>
    </div>
  ),
};

/** Controlled: `value` is an array and `onChange` reports the whole new array. */
export const ControlledMultipleSelect: Story = {
  render: () => {
    function Example() {
      const [countries, setCountries] = useState<string[]>(["bd"]);
      return (
        <Stack gap="2">
          <Text variant="body">{`Selected: ${countries.join(", ") || "nothing"}`}</Text>
          <div style={{ width: 320 }}>
            <Dropdown>
              <SelectInput
                selectionType="multiple"
                label="Countries"
                placeholder="Choose countries"
                value={countries}
                onChange={({ values }) => setCountries(values)}
              />
              <DropdownOverlay>
                <CountryItems />
              </DropdownOverlay>
            </Dropdown>
          </div>
          <Button size="small" variant="tertiary" onClick={() => setCountries([])}>
            Clear all
          </Button>
        </Stack>
      );
    }
    return <Example />;
  },
};

/** `maxRows` decides how a crowd of tags fits: "single" keeps one row that
 * scrolls sideways, "multiple" (the default) wraps up to three rows and then
 * scrolls, "expandable" wraps and lets the field grow. */
export const MultipleSelectMaxRows: Story = {
  render: () => (
    <Stack gap="4">
      {(["single", "multiple", "expandable"] as const).map((maxRows) => (
        <div key={maxRows} style={{ width: 280 }}>
          <Dropdown>
            <SelectInput
              selectionType="multiple"
              label={`maxRows="${maxRows}"`}
              maxRows={maxRows}
              defaultValue={Array.from({ length: 12 }, (_, i) => `option-${i + 1}`)}
            />
            <DropdownOverlay>
              <ActionList>
                {Array.from({ length: 12 }, (_, i) => (
                  <ActionListItem key={i} title={`Option ${i + 1}`} value={`option-${i + 1}`} />
                ))}
              </ActionList>
            </DropdownOverlay>
          </Dropdown>
        </div>
      ))}
    </Stack>
  ),
};

/** One hidden input per chosen value (repeated keys), the shape a server
 * reading `getAll("country")` expects. */
export const MultipleSelectInAForm: Story = {
  render: () => {
    function Example() {
      const [submitted, setSubmitted] = useState("(not submitted)");
      return (
        <form
          style={{ width: 320 }}
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(JSON.stringify(new FormData(event.currentTarget).getAll("country")));
          }}
        >
          <Stack gap="2">
            <Dropdown>
              <SelectInput selectionType="multiple" name="country" label="Countries" defaultValue={["in", "lk"]} />
              <DropdownOverlay>
                <CountryItems />
              </DropdownOverlay>
            </Dropdown>
            <Button type="submit">Submit</Button>
            <Text variant="body">{`getAll("country"): ${submitted}`}</Text>
          </Stack>
        </form>
      );
    }
    return <Example />;
  },
};

const FRUITS = [
  "Apple", "Apricot", "Banana", "Blueberry", "Cherry", "Grape",
  "Guava", "Mango", "Orange", "Papaya", "Peach", "Pear",
].map((title) => ({ value: title.toLowerCase(), title }));

function FruitItems() {
  return (
    <ActionList>
      {FRUITS.map((fruit) => (
        <ActionListItem key={fruit.value} title={fruit.title} value={fruit.value} />
      ))}
    </ActionList>
  );
}

/** AutoComplete is a text field that suggests options. It never filters by
 * itself: you own the text (`inputValue` / `onInputValueChange`) and pass the
 * matching `value`s as `filteredValues` (local matching here, but a server
 * search works the same way). Keyboard: typing opens and filters, ArrowDown/Up
 * move the highlight, Enter picks it, Escape closes; Space, Home and End stay
 * text editing keys. Whenever the list closes the text resets to the chosen
 * title, so the value is always a real option. */
export const SingleAutoComplete: Story = {
  render: () => {
    function Example() {
      const [text, setText] = useState("");
      const [chosen, setChosen] = useState("");
      const chosenTitle = FRUITS.find((fruit) => fruit.value === chosen)?.title;
      // While the box just shows the chosen title, show every option rather
      // than only the one that matches it.
      const query = text === chosenTitle ? "" : text.toLowerCase();
      const filteredValues = FRUITS.filter((fruit) => fruit.title.toLowerCase().includes(query)).map((fruit) => fruit.value);
      return (
        <Stack gap="2">
          <Text variant="body">{`Chosen: ${chosen || "nothing"}`}</Text>
          <div style={{ width: 320 }}>
            <Dropdown>
              <AutoComplete
                label="Fruit"
                placeholder="Type to search"
                inputValue={text}
                onInputValueChange={({ value }) => setText(value)}
                value={chosen}
                onChange={({ values }) => setChosen(values[0] ?? "")}
                filteredValues={filteredValues}
              />
              <DropdownOverlay>
                <FruitItems />
              </DropdownOverlay>
            </Dropdown>
          </div>
        </Stack>
      );
    }
    return <Example />;
  },
};

/** Multiple: options get checkboxes, the list stays open after each pick, the
 * search clears ready for the next one, and Backspace in an empty box removes
 * the last tag. A chosen tag keeps its title even while a search filters its
 * option out, because filtered items stay mounted. */
export const MultipleAutoComplete: Story = {
  render: () => {
    function Example() {
      const [text, setText] = useState("");
      const [chosen, setChosen] = useState<string[]>(["mango"]);
      const filteredValues = FRUITS.filter((fruit) => fruit.title.toLowerCase().includes(text.toLowerCase())).map((fruit) => fruit.value);
      return (
        <Stack gap="2">
          <Text variant="body">{`Chosen: ${chosen.join(", ") || "nothing"}`}</Text>
          <div style={{ width: 320 }}>
            <Dropdown>
              <AutoComplete
                selectionType="multiple"
                label="Fruits"
                placeholder="Type to search"
                emptyMessage="No fruit matches that"
                inputValue={text}
                onInputValueChange={({ value }) => setText(value)}
                value={chosen}
                onChange={({ values }) => setChosen(values)}
                filteredValues={filteredValues}
              />
              <DropdownOverlay>
                <FruitItems />
              </DropdownOverlay>
            </Dropdown>
          </div>
        </Stack>
      );
    }
    return <Example />;
  },
};

/** Uncontrolled: no `inputValue` or `filteredValues`, so it just lists every
 * option and the typed text is only scratch space. Useful for seeing the
 * reset-on-close behavior on its own. */
export const AutoCompleteUncontrolled: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <Dropdown>
        <AutoComplete label="Fruit" placeholder="Type to search" defaultValue="peach" name="fruit" />
        <DropdownOverlay>
          <FruitItems />
        </DropdownOverlay>
      </Dropdown>
    </div>
  ),
};

