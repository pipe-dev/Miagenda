---
name: Candy Glass & Plush
colors:
  surface: '#fef7ff'
  surface-dim: '#ded8e0'
  surface-bright: '#fef7ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f1f9'
  surface-container: '#f2ecf4'
  surface-container-high: '#ede6ee'
  surface-container-highest: '#e7e0e8'
  on-surface: '#1d1b20'
  on-surface-variant: '#57414a'
  inverse-surface: '#322f35'
  inverse-on-surface: '#f5eff6'
  outline: '#8a707b'
  outline-variant: '#ddbfca'
  surface-tint: '#b2107b'
  primary: '#af0a78'
  on-primary: '#ffffff'
  primary-container: '#cf3192'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffafd5'
  secondary: '#744aa2'
  on-secondary: '#ffffff'
  secondary-container: '#cda0fe'
  on-secondary-container: '#5a3086'
  tertiary: '#006388'
  on-tertiary: '#ffffff'
  tertiary-container: '#007dab'
  on-tertiary-container: '#fcfcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd8e8'
  primary-fixed-dim: '#ffafd5'
  on-primary-fixed: '#3d0027'
  on-primary-fixed-variant: '#8a005e'
  secondary-fixed: '#efdbff'
  secondary-fixed-dim: '#dbb8ff'
  on-secondary-fixed: '#2b0052'
  on-secondary-fixed-variant: '#5b3188'
  tertiary-fixed: '#c5e7ff'
  tertiary-fixed-dim: '#7ed0ff'
  on-tertiary-fixed: '#001e2d'
  on-tertiary-fixed-variant: '#004c6a'
  background: '#fef7ff'
  on-background: '#1d1b20'
  surface-variant: '#e7e0e8'
  cream-surface: '#fffcf2'
  lavender-mist: '#e6e0f8'
  candy-glaze: rgba(255, 255, 255, 0.4)
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 36px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 8px
  container-padding-sm: 1.5rem
  container-padding-lg: 3rem
  gutter: 1.5rem
  stack-gap: 1rem
---

## Brand & Style
The design system is centered on a hyper-tactile, "Candy Glass & Plush" aesthetic. It targets a playful, feminine, and high-energy audience, evoking an emotional response of delight and sensory satisfaction. The style is a maximalist interpretation of **Skeuomorphism**, rejecting flat design in favor of intense physical metaphors. 

Key visual pillars include:
- **Tactility:** Every element is designed to look "touchable"—either soft and cushioned or hard and glossy.
- **Volume:** Depth is achieved through multi-layered inner shadows, specular highlights, and ambient occlusion.
- **Vibrancy:** High-saturation tones are used to mimic the look of sugar-coated confections and synthetic plush fabrics.

## Colors
The palette is dominated by **Hot Pink (#e040a0)**, used for high-intent actions and "jelly" elements. **Cream (#fef7ff)** serves as the primary base, acting as the "plush" fabric of the UI. 

Color application follows these skeuomorphic rules:
- **Glossy Surfaces:** Use gradients that transition from the primary hex to a lighter, more saturated version at the top to simulate overhead lighting.
- **Shadows:** Never use pure black. Use a deep, high-saturation version of the element’s color (e.g., a dark magenta shadow for pink buttons) to maintain the "candy" glow.
- **Specular Highlights:** Use pure white at 60-80% opacity on the top-left edges of glass elements.

## Typography
This design system utilizes **Plus Jakarta Sans** for its soft, rounded terminals and modern geometry, which complements the pill-shaped UI. 

- **Weighting:** Headlines must always be Bold or Extra Bold to hold their own against the heavy visual weight of the shadows and textures.
- **Effects:** For large display titles, a very subtle "letter-press" effect (a 1px white drop shadow at 100% opacity positioned at 0, 1px) can be used to make text feel embossed into the plush surfaces.
- **Readability:** Body text should maintain a Medium weight (500) to ensure it remains legible against high-saturation background elements.

## Layout & Spacing
The layout follows a **fluid grid** model with generous margins to allow the 3D elements "room to breathe." Because shadows and glows extend beyond the bounding boxes of components, internal padding is intentionally oversized.

- **Desktop:** 12-column grid with 24px gutters.
- **Mobile:** Single column with 24px side margins.
- **Depth Spacing:** Vertical rhythm is reinforced by the "stacking" of plush layers. Elements should never feel cramped; if a component looks "flat," increase the surrounding whitespace to emphasize its 3D volume.

## Elevation & Depth
Elevation in this system is not just about height, but **material density**. 

- **The "Plush" Layer (Base):** Containers use a subtle inner-glow and a large, soft outer shadow to look like upholstered cushions. Use a "quilted" pattern overlay at 5% opacity for large cards.
- **The "Candy" Layer (Interactive):** Buttons and toggles sit atop the plush layer. They use a combination of:
    1.  **Outer Glow:** A tinted shadow that makes the element look like it’s emitting light.
    2.  **Inner Shadow:** A dark arc at the bottom and a light arc at the top to create a spherical, jelly-like volume.
    3.  **Refraction:** A semi-transparent gradient fill that is lighter in the center and darker at the edges.
- **Pressed State:** When an element is interacted with, it should physically "sink" into the plush layer, achieved by reversing the inner shadow and removing the outer drop shadow.

## Shapes
The shape language is strictly **Pill-Shaped and Organic**. There are no hard corners in this design system.

- **Buttons & Tags:** Use the full pill shape (1000px radius).
- **Cards & Plush Containers:** Use the `rounded-xl` (3rem) setting to ensure they feel soft and approachable.
- **Icons:** Should be encased in circular "bubbles" or glass beads to maintain the tactile metaphor.

## Components
### Buttons
"Candy" buttons are the centerpiece. They must feature a high-contrast specular highlight (a white pill shape at 30% opacity) near the top edge. The fill is a radial gradient. On hover, the button should "swell" (scale 1.05) and the inner glow should intensify.

### Plush Cards
Large containers designed to look like cushions. They use a soft cream fill and a thick, blurred pink-tinted shadow. Use a 2px "piping" border (a slightly darker cream) to simulate a fabric seam.

### Input Fields
Inputs are recessed "wells" in the plush surface. Use a heavy inner shadow on the top and left to make the field look sunken. The focus state turns the inner shadow into a glowing pink "aura."

### Chips & Badges
Small glass-like beads. They should be highly translucent with a backdrop-blur (10px) to allow the plush texture underneath to show through.

### Switches/Toggles
The track is a recessed "well," and the knob is a high-gloss candy sphere. The knob should have a distinct "click" animation that looks like it is popping into place.

### Progress Bars
The container is a recessed tube, and the fill is a glowing "liquid" jelly that appears to fill the chamber, complete with tiny bubble highlights.