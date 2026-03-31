# Design System Specification: Editorial Gastronomy

## 1. Overview & Creative North Star
This design system is built upon the Creative North Star of **"The Precision Maître d'."** It moves away from the utilitarian, cluttered "calculator" aesthetic of traditional POS software and towards a high-end editorial experience. 

By utilizing intentional asymmetry and a rigid adherence to tonal depth over structural lines, we create an interface that feels both authoritative and effortless. We break the standard grid by using high-contrast typography scales—pairing expansive, expressive display type with hyper-legible utility fonts. The goal is a workspace that reduces cognitive load for the operator while maintaining a premium, branded atmosphere that mirrors the quality of the cuisine.

---

## 2. Colors
Our palette is rooted in a high-chroma `primary` red, balanced by a sophisticated range of warm-leaning neutrals.

### The Palette
- **Primary Red (`#9e0027`)**: Used for the definitive action path. 
- **Primary Container (`#c41e3a`)**: Reserved for high-priority interactive states and active category selections.
- **Surface Hierarchy**:
    - `surface`: `#f9f9f9` (The canvas)
    - `surface-container-low`: `#f3f3f3` (Section grouping)
    - `surface-container-lowest`: `#ffffff` (The active work card)

### Core Color Principles
*   **The "No-Line" Rule:** Explicitly prohibit 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts. For example, the "Current Order" sidebar should be defined by a shift from `surface` to `surface-container-lowest`, not a stroke.
*   **Surface Hierarchy & Nesting:** Treat the UI as physical layers. A product card (`surface-container-lowest`) sits atop the main menu area (`surface-container-low`), which sits on the global background (`surface`). This creates "natural" depth.
*   **The Glass & Gradient Rule:** For floating elements like modals or quick-action tooltips, use Glassmorphism. Apply `surface-container-lowest` at 80% opacity with a 20px backdrop-blur. 
*   **Signature Textures:** For the main "Proceed" or "Pay" CTAs, use a subtle linear gradient from `primary` (#9e0027) to `primary_container` (#c41e3a) at a 135-degree angle to provide a tactile, "pressable" soul.

---

## 3. Typography
We utilize a dual-font strategy to balance editorial flair with high-speed POS utility.

*   **Display & Headlines (Plus Jakarta Sans):** Used for "Hero" moments—categories, order totals, and brand presence. This typeface brings a modern, geometric character that feels bespoke.
    *   *Headline-lg:* `2rem` | Bold | Tracking -0.02em
*   **Body & Labels (Inter):** The workhorse for high-density data. Used for item names, prices, and receipt modifiers. Inter’s tall x-height ensures readability under harsh kitchen lighting.
    *   *Title-md:* `1.125rem` | Medium (For item names)
    *   *Label-sm:* `0.6875rem` | Semibold | All-caps (For metadata like Transaction IDs)

---

## 4. Elevation & Depth
Depth in this system is an atmospheric quality, not a structural one.

*   **The Layering Principle:** Avoid shadows on static elements. Instead, use Tonal Layering. If a card needs to stand out, change its color token from `surface-container` to `surface-container-lowest`.
*   **Ambient Shadows:** Floating modals or active dropdowns must use hyper-diffused shadows. 
    *   *Shadow Token:* `0px 12px 32px rgba(26, 28, 28, 0.06)`. 
    *   Note: Shadow color must be a tinted version of `on-surface` (dark gray), never pure black.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility (e.g., input fields), use `outline-variant` at 15% opacity. Never use 100% opaque borders.
*   **Glassmorphism:** To maintain context, use a 12px backdrop blur on the sidebar navigation or modal overlays, allowing hints of the food photography to bleed through the UI layers.

---

## 5. Components

### Buttons
*   **Primary:** Solid `primary` gradient with `on-primary` text. `xl` roundedness (1.5rem).
*   **Secondary:** `surface-container-highest` background with `primary` text. No border.
*   **Tertiary:** Ghost style. Transparent background, `on-surface-variant` text.

### Chips (Category Selectors)
Use `xl` roundedness (full pill). When active, the chip should transform to `primary` with a subtle `primary-fixed` drop shadow. When inactive, use `surface-container-lowest` to "lift" it from the `surface` background.

### Input Fields (Numpad & Search)
Avoid boxes. Use a `surface-container-high` background with `xl` (1.5rem) corner radius. The focus state should not be a stroke, but a subtle glow of the `primary` color (2px spread).

### Cards & Lists
*   **Product Cards:** Strictly forbidden from using divider lines. Use `8` (2rem) vertical whitespace to separate items. 
*   **The Order Tray:** Use a `surface-container-low` background for "modifiers" (e.g., "Extra Sauce") to nested-group them within the main white item card.

### Additional POS Components
*   **The Status Dot:** For connectivity or table status, use high-saturation `tertiary` (green) or `error` (red) with a soft pulse animation to ensure it catches the eye without cluttering the screen.

---

## 6. Do's and Don'ts

### Do
*   **Do** use high-quality food photography with consistent lighting (top-down or 45-degree).
*   **Do** use `20` (5rem) or `24` (6rem) spacing for major layout sections to allow the UI to breathe.
*   **Do** ensure that the "Total Amount" is the largest typographic element on the order screen using `headline-lg`.

### Don't
*   **Don't** use 1px dividers between list items; use white space or subtle background shifts.
*   **Don't** use standard "drop shadows" on every card. Reserve shadows for elements that physically move or float (modals, active pills).
*   **Don't** use high-contrast black (#000000) for text. Always use `on-surface` (#1a1c1c) to maintain the premium, soft-gray aesthetic.