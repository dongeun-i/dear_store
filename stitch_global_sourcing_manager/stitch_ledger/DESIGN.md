# Design System Specification: The Modern Tech Ledger

## 1. Overview & Creative North Star
**Creative North Star: "The Kinetic Curator"**

This design system moves beyond the rigid, utilitarian grids of traditional sourcing platforms. It reimagines the "Global Sourcing Manager" experience as a high-end editorial ledger—merging the precision of data with the energy of a vibrant tech brand. 

To achieve a "Signature" look, we reject the "template" aesthetic. We embrace **intentional asymmetry**, where large display typography anchors the page, and data containers float with a sense of layered depth. By utilizing the interaction between #FF4D8D (Vibrant Pink) and #00D1FF (Electric Cyan), we create a "neon-professional" atmosphere that feels both authoritative and cutting-edge.

---

## 2. Color Strategy & Surface Logic

The palette is designed to feel "lit from within." We move away from flat greys in favor of warm, pink-tinted neutrals and high-energy accents.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections. Layout boundaries must be achieved through background shifts. For example, a `surface-container-low` (#f8f2f4) sidebar should sit against a `background` (#fef8fa) main area. 

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the following tiers to create "nested" importance without structural clutter:
*   **Base:** `surface` (#fef8fa) - The canvas.
*   **Sectioning:** `surface-container-low` (#f8f2f4) - Used for grouping secondary content.
*   **Interactive Cards:** `surface-container-lowest` (#ffffff) - Used to make data "pop" against the tinted background.
*   **High-Contrast Overlays:** `inverse-surface` (#323031) - Use sparingly for temporary notifications or dark-mode callouts.

### The "Glass & Gradient" Rule
To elevate the "Modern Tech" feel, use **Glassmorphism** for floating elements (Modals, Dropdowns). Apply `surface-container-lowest` at 70% opacity with a `24px` backdrop-blur. 
*   **Signature Texture:** Main CTAs should utilize a subtle linear gradient: `primary` (#b90a5a) to `primary_container` (#ff4d8d) at a 135-degree angle.

---

## 3. Typography: The Editorial Scale

We use **Manrope** to bridge the gap between geometric tech and human-centric design.

*   **Display (lg/md):** Use for "Big Data" moments—total spend, global reach. Set with `-0.02em` letter spacing to feel "locked in."
*   **Headline (lg/md):** Your primary navigational anchors. These should feel like magazine headers, often placed with generous asymmetrical white space.
*   **Title (sm/md):** The workhorse for card headers and data categories. 
*   **Body (md/lg):** Optimized for readability. Use `on_surface_variant` (#594046) for secondary body text to reduce visual vibration against the pink tints.
*   **Label (sm/md):** All-caps for "Tech Ledger" data points (SKUs, timestamps) using `secondary` (#00677f) to provide a distinct visual "tag."

---

## 4. Elevation & Depth: Tonal Layering

Traditional shadows are too heavy for this "Light & Tech" aesthetic. We use **Tonal Layering** to convey importance.

*   **The Layering Principle:** Place a `surface-container-lowest` (#ffffff) card on top of a `surface-container` (#f2ecee) background. This creates a soft, natural lift that mimics fine paper without needing a shadow.
*   **Ambient Shadows:** For high-priority floating elements (e.g., active Sourcing Requests), use an extra-diffused shadow: `offset: 0, 8px; blur: 32px; color: rgba(185, 10, 90, 0.06)`. Note the pink tint in the shadow—never use pure black.
*   **The "Ghost Border" Fallback:** If a boundary is required for accessibility, use a "Ghost Border": `outline-variant` (#e1bec5) at 20% opacity. 100% opaque borders are forbidden.

---

## 5. Components

### Buttons
*   **Primary:** Gradient (#b90a5a to #ff4d8d). White text. `ROUND_EIGHT` (0.5rem) corners.
*   **Secondary:** `secondary_container` (#00ccf9) background with `on_secondary_container` (#005266) text. High energy for "Action" items.
*   **Tertiary:** Transparent background with `primary` text. No border.

### Chips (The Ledger Tags)
*   **Status Chips:** Use `secondary_fixed` (#b7eaff) for "In Progress" and `primary_fixed` (#ffd9e0) for "Review Required." These should be pill-shaped (`full` roundedness) and use `label-md` typography.

### Input Fields
*   **Style:** Minimalist. No bottom line. Use `surface_container_high` (#ece7e9) as the fill. 
*   **Focus State:** A 2px "Ghost Border" using `secondary` (#00677f) and a subtle inner glow of the same color.

### Cards & Lists
*   **Rule:** Absolutely no divider lines. 
*   **Separation:** Use `spacing-6` (1.5rem) of vertical white space or a subtle shift from `surface` to `surface_container_low`.
*   **Sourcing Card:** A `surface_container_lowest` (#ffffff) card with a `primary` (#b90a5a) 4px left-accent bar to denote "Active" status.

### Global Supply Tracker (Custom Component)
A horizontal scrolling "ticker" using `surface_dim` (#ded9db) background and `secondary` (#00677f) text to provide real-time updates on sourcing metrics—the heartbeat of the "Ledger."

---

## 6. Do’s and Don’ts

### Do
*   **Do** use the Spacing Scale religiously. Consistent white space is what makes this feel "Premium."
*   **Do** overlap elements. Let a chip sit slightly over the edge of a card to create a sense of dynamic movement.
*   **Do** use Electric Cyan (#00D1FF) for "Interactive Tech" elements—icons, toggles, and data viz nodes.

### Don't
*   **Don't** use 1px solid black or grey borders. They break the "frosted glass" sophistication.
*   **Don't** use standard "Success Green." Use Electric Cyan or a deep Primary Pink to signal "Complete" to maintain the brand's signature palette.
*   **Don't** crowd the interface. If the data is dense, increase the `surface-container` nesting to let the eye rest.