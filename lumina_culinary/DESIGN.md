# Design System Strategy: The Digital Epicurean

## 1. Overview & Creative North Star
This design system is built upon the North Star of **"The Digital Curator."** In the context of "Co vaříme?", we are moving away from the "utility tool" feel of traditional recipe apps and toward a high-end, editorial experience that feels like flipping through a premium, heavy-stock culinary magazine.

To break the "template" look, this system utilizes **Organic Asymmetry**. Elements should never feel trapped in a rigid grid; instead, use overlapping glass containers, oversized typography that "bleeds" into negative space, and tonal depth to guide the eye. We prioritize air, motion, and light over borders and boxes.

---

## 2. Colors & Surface Architecture
The color palette is rooted in a fresh, airy atmosphere, using Material Design naming conventions to ensure a systematic implementation.

### The Palette
- **Background:** `#f7f9fb` (Base)
- **Primary (Action):** `#0058bc` / `#007AFF`
- **Secondary (Success/Growth):** `#006e26`
- **Tertiary (Mood/Accent):** `#6d4e8f`
- **Brand Gradient:** `linear-gradient(135deg, #32ADE6, #30D158)`

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section content. Boundaries must be defined solely through:
1. **Background Shifting:** A `surface-container-low` section sitting on a `surface` background.
2. **The "Glass & Gradient" Rule:** Use Glassmorphism (rgba 255, 255, 255, 0.55) for all floating recipe cards. This ensures the background blurred orbs (Sky Blue and Purple) bleed through the UI, creating a "soulful" depth.
3. **Vertical Whitespace:** Use generous spacing to separate the "Discovery" section from "Trending" without a horizontal rule.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of frosted glass:
*   **Level 0 (Base):** `surface` (#f7f9fb) with your Sky Blue and Purple blurred orbs.
*   **Level 1 (Sections):** `surface-container-low` for large content blocks.
*   **Level 2 (Interactive):** `surface-container-lowest` (Pure White) or Glass cards for high-priority items.

---

## 3. Typography: Editorial Authority
We use a high-contrast scale to create an editorial hierarchy. **Plus Jakarta Sans** provides a modern, culinary-chic feel for headers, while **Inter/SF Pro** handles the legibility of instructions.

*   **Display-LG (3.5rem):** Reserved for "Hero" moments (e.g., "What's cooking today?").
*   **Headline-MD (1.75rem):** Recipe Titles. Use tight tracking (-2%) for a premium look.
*   **Body-LG (1rem):** High-readability recipe descriptions.
*   **Label-MD (0.75rem):** Metadata like "15 mins" or "Easy." Always uppercase with 5-10% letter spacing.

---

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering** and physics-based light simulation rather than structural lines.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section to create a soft, natural lift. 
*   **Ambient Shadows:** For floating primary CTAs, use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(0, 88, 188, 0.08)`. The shadow must be tinted with the `on-surface` color, never pure black.
*   **The "Ghost Border":** If a card requires more definition on a light background, use the `outline-variant` token at **15% opacity**.
*   **Glassmorphism:** All floating recipe cards must use:
    *   `background: rgba(255, 255, 255, 0.55)`
    *   `backdrop-filter: blur(32px) saturate(180%)`
    *   `border: 1px solid rgba(255, 255, 255, 0.45)`

---

## 5. Components

### Buttons
*   **Primary Action:** Rounded (18px). Use the **Brand Gradient** or `#007AFF`. Padding: `16px 32px`.
*   **Secondary:** Ghost style. No background, `outline-variant` (20% opacity) border.

### Recipe Cards (Signature Component)
*   **Radius:** 24px (XL).
*   **Style:** Glassmorphic. No internal dividers. Use a 16px bottom-margin on the image to separate it from the text.
*   **Interaction:** On tap, the card should "settle" (scale 0.98).

### Navigation (Frosted Bottom Nav)
*   **Design:** A floating bar or anchored bar with `backdrop-filter: blur(20px)`. 
*   **Shape:** Rounded top corners (24px).
*   **Active State:** Use a `surface-tint` dot or the Primary Action color for icons.

### Chips (Dietary/Filter)
*   **Radius:** 100px (Full).
*   **Behavior:** Use `surface-container-highest` for unselected and the Brand Gradient for selected states.

### Input Fields (The "Minimalist" Search)
*   **Style:** `surface-container-lowest` background, no border.
*   **Focus:** Transition to a subtle `primary` glow (4px blur).

---

## 6. Do’s and Don’ts

### Do:
*   **Do** allow images to break the container. A sprig of rosemary or a splash of sauce should overlap the edge of a glass card to create 3D depth.
*   **Do** use the Brand Gradient sparingly for "Aha!" moments like "Recipe Saved" or "Chef's Choice."
*   **Do** use the `xl` (3rem) spacing for top-level section margins to maintain "The Digital Curator" breathing room.

### Don’t:
*   **Don't** use 1px solid black or dark grey lines. Use tone-on-tone.
*   **Don't** use standard drop shadows (e.g., `offset-y: 2px`). They feel cheap. Use large, soft blurs.
*   **Don't** cram content. If the screen feels full, increase the `surface` whitespace.
*   **Don't** use pure `#000000` for text. Use `on-surface` (#191c1e) to keep the "Blendly" soft aesthetic.