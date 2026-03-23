# Design System Strategy: The Synthetic Intelligence Interface

## 1. Overview & Creative North Star
**Creative North Star: The Neural Weaver**
This design system moves away from the "clunky dashboard" trope of AI tools. Instead, it treats multi-agent collaboration as a living, breathing fabric of data. The aesthetic is inspired by high-end command-line interfaces and satellite telemetry—refined, hyper-precise, and atmospheric.

We break the "template" look through **Intentional Asymmetry**. Dashboards should not be perfectly balanced; instead, use the Spacing Scale to push content into an editorial layout where the most critical agent activity has the most "visual gravity." Overlapping glass modules and glowing gradient accents create a sense of depth, as if the UI is projected onto a multi-layered glass HUD.

---

### 2. Colors & Atmospheric Depth
The palette is rooted in the deep void of `#0b1326`, using high-frequency cyan accents to represent "active" intelligence.

*   **The "No-Line" Rule:** Physical 1px borders are strictly prohibited for layout sectioning. Separation must be achieved via **Background Shifts**. A `surface-container-low` panel sitting on a `surface` background provides enough contrast to be felt without the visual noise of a line.
*   **Surface Hierarchy & Nesting:** Use the `surface-container` tiers to create a "nested" logic. 
    *   **Level 0 (Background):** `surface` (#0b1326)
    *   **Level 1 (Main UI Shell):** `surface-container-low` (#131b2e)
    *   **Level 2 (Active Agent Cards):** `surface-container` (#171f33)
    *   **Level 3 (Focused Tooltips/Modals):** `surface-container-highest` (#2d3449)
*   **The "Glass & Gradient" Rule:** To elevate the sci-fi aesthetic, use **Glassmorphism** for floating sidebars and inspector panels. Utilize `surface-container` colors at 60% opacity with a `20px` backdrop-blur. 
*   **Signature Textures:** Apply a 20% opacity linear gradient from `primary` (#8aebff) to `primary-container` (#22d3ee) on active state backgrounds. This "glow" represents the flow of data through the system.

---

### 3. Typography: The Information Hierarchy
We pair the technical precision of **Inter** with the futuristic, wide-set proportions of **Space Grotesk** for display elements.

*   **Display & Headlines (Space Grotesk):** Use `display-lg` and `headline-md` for high-level system status and agent names. This font feels "engineered," giving the platform an authoritative, scientific tone.
*   **Body & Labels (Inter):** All functional data, logs, and agent chat outputs use `body-md` or `label-md`. Inter’s high x-height ensures readability against dark, glowing backgrounds.
*   **Tonal Scale:** Use `on-surface-variant` (#bbc9cd) for timestamps and metadata to de-emphasize them, reserving `on-surface` (#dae2fd) for active AI dialogue and user inputs.

---

### 4. Elevation & Depth
In a multi-agent environment, depth conveys the "priority of thought."

*   **The Layering Principle:** Avoid shadows for static UI. Instead, use "Tonal Stacking." An inner agent console should use `surface-container-lowest` while the outer workspace uses `surface-container-low`.
*   **Ambient Shadows:** For floating command palettes, use a diffused shadow: `0 20px 50px -12px rgba(34, 211, 238, 0.08)`. The shadow is tinted with the `primary` color to simulate the glow of a screen.
*   **The "Ghost Border" Fallback:** If a containment line is required (e.g., in high-density data tables), use a "Ghost Border": `outline-variant` (#3c494c) at 15% opacity.
*   **Grid Patterns:** Apply a subtle 24px square grid pattern using `outline-variant` at 5% opacity to the `background` layer to reinforce the "simulation" aesthetic.

---

### 5. Components & Interface Elements

*   **Buttons:** 
    *   *Primary:* Solid `primary-container` (#22d3ee) with `on-primary` text. Use `xl` (0.75rem) roundedness. Add a `1px` inner glow using a lighter cyan.
    *   *Ghost:* No background. `1px` border using `primary` at 20% opacity. On hover, increase background to 10% opacity.
*   **Input Fields:** Use `surface-container-highest`. Do not use a bottom line; use a full-surround `sm` (0.125rem) radius. Focus state should trigger a `primary` glow effect (2px outer blur).
*   **Agent Cards:** Forbid dividers. Use `Spacing 6` (1.3rem) to separate the agent header from the activity log. Use a `surface-variant` background for code snippets within the card.
*   **Status Indicators:** Use `tertiary` (#ffd6a3) for "Processing" and `primary` (#8aebff) for "Idle/Ready." These should be small, 6px dots with a `4px` blur-glow.
*   **Neural Link (Custom Component):** A specialized connector component for showing agent relationships. Use SVG paths with a `primary` gradient and a `2px` stroke, utilizing a dash-array animation to show data flow.

---

### 6. Do’s and Don’ts

**Do:**
*   **DO** use intentional white space (Spacing 10 or 12) between distinct agent groups to allow the "Grid" to breathe.
*   **DO** use `xl` rounding (0.75rem) for main containers but `sm` (0.125rem) for technical data bits to create a "Soft-Tech" contrast.
*   **DO** ensure that any "glow" effect has a high-contrast text color (`on-primary`) to maintain AAA accessibility.

**Don’t:**
*   **DON'T** use pure black (#000000). It kills the "glass" effect and makes the UI feel "dead" rather than "synthetic."
*   **DON'T** use 100% opaque borders. They create a "boxed-in" feeling that contradicts the fluid nature of AI collaboration.
*   **DON'T** use standard scrollbars. Style them to be ultra-thin (4px) using `surface-bright` on a `surface` track to keep the focus on the content.