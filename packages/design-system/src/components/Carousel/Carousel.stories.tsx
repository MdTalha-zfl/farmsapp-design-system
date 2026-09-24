import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Carousel } from "./Carousel";
import { CarouselItem } from "./CarouselItem";
import { Button } from "../Button/Button";
import { Inline } from "../Inline/Inline";
import { Stack } from "../Stack/Stack";
import { Text } from "../Text/Text";

const meta = {
  title: "Components/Carousel",
  component: Carousel,
  tags: ["autodocs"],
  // Every story builds its own slides — these args only satisfy the required
  // props at the meta level.
  args: { accessibilityLabel: "Photos", children: [] as never },
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

const COLORS = ["#2f6f3e", "#1f5f8b", "#8b4a1f", "#6b2f8b", "#8b1f4a"];

/** An offline stand-in for a photo: a coloured SVG with the slide number and
 * its own size, so `imageFit` and `aspectRatio` are easy to see. */
function placeholder(n: number, width = 1200, height = 675): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<rect width="100%" height="100%" fill="${COLORS[n % COLORS.length]}"/>` +
    `<text x="50%" y="50%" fill="white" font-family="sans-serif" font-size="96" text-anchor="middle" dominant-baseline="middle">${n + 1}</text>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** Swipe or trackpad-scroll the slides, use the arrow buttons, or focus the
 * slides and press the Left/Right arrow keys. The arrows disable at the ends.
 * Motion is off under `prefers-reduced-motion`. */
export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <Carousel accessibilityLabel="Farm photos">
        {Array.from({ length: 5 }, (_, i) => (
          <CarouselItem key={i}>
            <img src={placeholder(i)} alt={`Photo ${i + 1}`} />
          </CarouselItem>
        ))}
      </Carousel>
    </div>
  ),
};

/** `aspectRatio` sets the slide shape; `imageFit="contain"` shows the whole
 * image instead of cropping it (here a portrait image in a 1:1 frame). */
export const AspectRatioAndFit: Story = {
  render: () => (
    <Stack gap="6">
      <div style={{ maxWidth: 360 }}>
        <Text>cover (default), 1 / 1</Text>
        <Carousel accessibilityLabel="Cropped" aspectRatio="1 / 1">
          {Array.from({ length: 3 }, (_, i) => (
            <CarouselItem key={i}>
              <img src={placeholder(i, 600, 900)} alt={`Portrait ${i + 1}`} />
            </CarouselItem>
          ))}
        </Carousel>
      </div>
      <div style={{ maxWidth: 360 }}>
        <Text>contain, 1 / 1</Text>
        <Carousel accessibilityLabel="Uncropped" aspectRatio="1 / 1" imageFit="contain">
          {Array.from({ length: 3 }, (_, i) => (
            <CarouselItem key={i}>
              <img src={placeholder(i, 600, 900)} alt={`Portrait ${i + 1}`} />
            </CarouselItem>
          ))}
        </Carousel>
      </div>
    </Stack>
  ),
};

/** Touch-first: no arrow buttons, just swipe (and keyboard on the slides). */
export const WithoutArrows: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <Carousel accessibilityLabel="Swipe only" showArrows={false}>
        {Array.from({ length: 4 }, (_, i) => (
          <CarouselItem key={i}>
            <img src={placeholder(i)} alt={`Photo ${i + 1}`} />
          </CarouselItem>
        ))}
      </Carousel>
    </div>
  ),
};

/** Controlled: the parent owns `activeIndex`, and `onChange` reports swipes
 * and arrow clicks. Setting the index from outside scrolls to that slide. */
export const Controlled: Story = {
  render: () => {
    const [index, setIndex] = useState(2);
    return (
      <Stack gap="4">
        <div style={{ maxWidth: 640 }}>
          <Carousel
            accessibilityLabel="Controlled"
            activeIndex={index}
            onChange={({ activeIndex }) => setIndex(activeIndex)}
          >
            {Array.from({ length: 5 }, (_, i) => (
              <CarouselItem key={i}>
                <img src={placeholder(i)} alt={`Photo ${i + 1}`} />
              </CarouselItem>
            ))}
          </Carousel>
        </div>
        <Inline gap="2">
          <Text>Slide {index + 1} of 5</Text>
          <Button variant="secondary" size="small" onClick={() => setIndex(0)}>
            First
          </Button>
          <Button variant="secondary" size="small" onClick={() => setIndex(4)}>
            Last
          </Button>
        </Inline>
      </Stack>
    );
  },
};

/** A single slide: nothing to scroll, so the arrows aren't rendered. */
export const SingleSlide: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <Carousel accessibilityLabel="One photo">
        <CarouselItem>
          <img src={placeholder(0)} alt="Photo 1" />
        </CarouselItem>
      </Carousel>
    </div>
  ),
};
