---
"@farmsapp/design-system": minor
---
Add Carousel and CarouselItem components for image/slide carousels.

The carousel uses native CSS scroll-snap for swipe, trackpad, and keyboard navigation, with React only reading the current slide position and controlling navigation for arrow buttons and controlled activeIndex.

Supports:
Controlled and uncontrolled usage via activeIndex, defaultActiveIndex, and onChange
Configurable aspectRatio
imageFit with cover or contain
Optional previous/next arrows via showArrows, disabled at the ends and RTL-aware
Accessible role="region" and aria-roledescription="carousel" semantics