# UI/UX Design Specification

This document defines the exact layout, visual design, and user interactions for the Planet Builder application.

---

## Application Structure

### Main Screens/Views

List all primary screens in the application:

1. **Theme and UI Components**
2. **Landing/Home Screen**
3. **Planet Builder Interface** (main workspace)
4. **Simulation Viewer**
5. **Results/Timeline View**
6. **Planet Gallery** (optional)
7. **Settings/Help**

---

use context7 to 

## Screen-by-Screen Breakdown

### 1. Theme and UI Components

Use context7 MCP server to look up the documentation for Radix UI: https://www.radix-ui.com/themes/docs/overview/getting-started, and use this as the primary UI component library and theme for the app.


### 2. Landing/Home Screen

**Purpose:** First screen users see when opening the app
**Layout:**
- a floating welcome panel with an image on the left, and description on the right. This is a 60% image, 40% text conent on the right split. We will need to come up with some marketing welcome language for the right side, for now it will be a summary of the current project description and goal for the game.
- A single button that says, "Let's Create!" that will bring them into the main builder flow.

**Elements:**
- Title/Logo:
- Right side Description: summarize the project plan to build inviting language about the game
- Primary CTA button: "Let's Create" button jumps to the main builder flow.
- Secondary options: an About button, this pops up a small panel with some about the app info and publisher info.

---

### 3. Main Planet Builder Interface

**Purpose:** Main workspace where users configure their planet where it starts off as swirling gas until they throw elements at it.

**Layout:**

This is the main screen where users will interact with thier primordial planet. It's important to understand that the planet visualization on the left side will be a centered 3d view into the planet to be created. The user will only have controls to rotate the planet, not even zoom -- because it is unnecessary in this game.

**3D Considerations for the Main Visualization** 
- The scene will use ThreeJS, and be a 3d canvas.

- Initial Setup Visualization (primordial)
  - It always start off with a 3d rendering of swirling gas, as if the planet has not even been formed yet. The luminosity of the gas is at a medium level to match the default sun setting. The amount of gas starts off medium, to match the default slider on the It will remain this way until the user initiates the creation of the planet after they have configured it.
  - When the user changes the planet ingredient settings for the planet, if an increase, we will animation comets being thrown into the planet from random directions. Note the planet is always fixed in the same position in the scene. The comets will be the color of the element the user selects. When the elements are lowered from the configuration panel, we will visualize the gas being thrown out of the spinning cloud, and the color of the cloud slightly readjusts.
  - As elements are being added to the swirling gas, the colors of the gas will change to match the aggregate of the element colors we threw into it.
  - As the user changes the settings of the enviromental properties, like the sun properties, as the user moves the slider to increase the intensity of the sun, the luminosity of the scene, and thus the gas, increases as the user slides the sun proximity indicator. if the user lowers the sun intensity or proximity to the star, it will get less luminous.
  - As the user increases the settings of the mass of the planet, this will increase the number of swirl particles, making it look more dense, and the opposite, it will thin out if the user lowers the mass.
- Building the Planet
  - When the user clicks the "Build" action button, we will transitikon to a different animation of the scene.
  - The gas will start to swirl at a faster and faster speed around the center of the scene, and slowly start getting brighter and brighter and it condenses into a small sphere at the center of the scene.
  - After 6 seconds of this, we'll create an explosion with the 3D engine, that burns out the camera view, and as it fades, our rendered planet will be visible slowly rotating (rendered planets will be defined in a later section)
  - The planet will slowly spin on it's axis automatically
  - The user has the ability to rotate the planet around in any direction on the fixes axis. But when they stop rotating it manually, the planet will continue to slowly rotate


```
┌─────────────────────────────────────────────────────────────┐
│ Header/Navigation                                           │
├─────────────────────────────────────┬───────────────────────┤
│                                     │                       │
│  Main visualization                 │  Configuration        │
│  (Planet Preview)                   │                       │
│                                     │                       │
│                                     │                       │
├──────────────────┴──────────────────────────────────────────┤
│ Bottom Panel                                                │
└─────────────────────────────────────────────────────────────┘
```

**Main visualization - Planet Preview:**
- The left side should fill 75% of the full page.
- This is a 3D Rendering, using ThreeJS
- As we make changes on the configuration panel on the right, this visualization will update as per the directions above.
- The user has the ability to rotate the planet around in any direction on the fixes axis. But when they stop rotating it manually, the planet will continue to slowly rotate

**Right Sidebar - Environmental Parameters:**
- Header: "Planet Ingredients"
- Element list display:
  - We will show a fixed set of elements to use to seed the planet, as defined in the PROJECT.md file.
  - Display the elements as small cards that look like periodic element table card for that element. Inside the card will be a % indicator for how much of the element the user has added. it starts at 0%.
  - Each element has an associated color, one that is known to be related to the realk world element, and this color is outlines on the element card. this is the color that will change the swirling clouds on the visualization as you ad or remove the element from it.
  - There is a + and a - button on each side of the Element card to change the %.
  - When the user adds a percentage of an element, we simulate a comet crashing into the clouds indicating we are adding elements to the gas cloud.
  - When the user lowers a percentage of an element, we fly gas out of the primordial gas swirling.
- Distance from Star: A slider from .1 AU to 10 AU, the 1AU = Earth's distance form the sun, default 1AU
- Star Type: Radio selections of the different star types, the type defines how hot the star is, and changes the illumination of the gas cloud
- Initial Mass: Default is earth's mass, and then a slider control from 10% of Earth's mass to 100x Earth's mass
- Rotation Speed: Slider that default's Earth's rotational period of 24hrs, min is 1hr, max is 100 days
- A button that says "Build" that triggers the transition to the simulation Viewer

**Bottom Panel - Timeframe:**
- Lists the date of the glowing cloud, defaults to 5 Billion Years Ago.

---

### 3. Simulation Viewer

**Purpose:** Watch the planet evolve through billions of years (within 6 seconds)

**Layout:**
- The same layout as the main visualizer

**Visual Elements:**
- Planet Visualization:
  - 3d animation kicks off
  - Over the period of 6 seconds, the gas will start to swirl at a faster and faster speed around the center of the scene, and slowly start getting brighter and brighter and it condenses into a small sphere at the center of the scene.
  - After 6 seconds of this, we'll create an explosion with the 3D engine, that burns out the camera view, and as it fades, our rendered planet will be visible slowly rotating (rendered planets will be defined in a later section based on the ingredients)
  - The planet will slowly spin on it's axis automatically
  - Rules to how the planet evolves and the results are found in the PLANET_CREATIONS.md file.

- Right-Side Configuration panel:
  - the previous configurations are locked, they can't be changed at this point
  - There is a data display that lists the final data of the current planet:
    - Temperature: based on the chemistry and criteria, what would be the avg temperature of the planet?
    - Atmospheric Composition: based on the chemistry and criteria, what would be the type of atmosphere that evolved?
    - Size: The final mass and disameter of the created planet
    - Geological Activity: based on the chemistry and criteria, what would be the geology, the type of planet? rocky, gas giant, water, volcanic?
    - Life Status: Could life be sustainable and evolve on a plante of such chemical composition.

- Timeline Display:
  - Over the course of 6 seconds, the Bottom Panel will count down to 0 years ago

---

### 4. Results/Timeline View

**Purpose:** Review the final planet and its complete history

**Layout:**
- On the Right-Side Configuration panel: have a button that says "Results"
- Clicking Results gives a summary of the type of planet that was built. Can we leverage AI to build this summary based on the results and planet that we built?


### Planet Visualization Component

**Visual Style:**
- 3D Rendering
- Rendering style: realistic
- Lighting: constant point of light thaty represents the sun (as defined by the configuration's settings)
- Size range: Planet should fill the left size of the screen up to 75% of the scene.

**Surface Features:**
- Oceans: [how rendered]
- Ice caps: [appearance]
- Continents: [if applicable]
- Clouds/atmosphere: [transparency, movement?]
- Lava: [if applicable]
- Impact craters: [when shown]

**Dynamic Changes:**
- [How do visual changes occur during simulation?]
- [Fade transitions, instant updates, animated?]

---

### Timeline Component

**Visual Design:**
- [Horizontal bar, circular, vertical?]
- [Color coding?]
- [Scale: linear, logarithmic?]

**Markers:**
- Formation: [0 years]
- Key milestones: [1M, 100M, 1B, 4B years?]
- Events: [how are they marked?]

**Interactivity:**
- Click to jump to time:
- Scrubbing: [drag to move through time?]
- Tooltips on hover:

---

## Color Scheme

**Primary Colors:**
- Background:
- Primary UI:
- Accent:
- Text:

**Element Colors:**
- [How are different elements color-coded?]

**Planet State Colors:**
- Lava/Molten:
- Rocky/Barren:
- Water:
- Ice:
- Life-bearing:
- Atmospheric glow:

---

## Typography

**Fonts:**
- Headings:
- Body text:
- UI labels:
- Data/numbers:

**Sizes:**
- H1:
- H2:
- Body:
- Small text:

---

## Responsive Design

**Desktop (1920x1080+):**
- [Layout description]

**Laptop (1366x768):**
- [Adjustments needed]

**Tablet (768x1024):**
- [Layout changes]

**Mobile:**
- [Is mobile supported? If so, describe layout]

---

## Animations & Transitions

### Page Transitions:
- [How do screens transition between each other?]

### Element Interactions:
- Button hover:
- Click feedback:
- Element selection:

### Simulation Animations:
- Planet rotation: [speed, smoothness]
- Surface changes: [fade duration, style]
- Event effects: [impacts, volcanic activity]
- Time acceleration visual cue:

---

## User Flow Diagrams

### Primary User Journey:

```
Landing Screen
    ↓ [Click "Create Planet"]
Planet Builder
    ↓ [Select elements & parameters]
Configure Planet
    ↓ [Click "Start Simulation"]
Simulation Viewer
    ↓ [Simulation completes]
Results View
    ↓ [Click "Save" or "Try Again"]
[Back to Builder or Gallery]
```

### Additional Flows:
- [Describe other important user paths]

---

## Interaction Details

### What Happens When...

**User selects an element:**
- Visual feedback:
- UI updates:
- Planet preview changes:

**User adjusts distance from star:**
- Visual feedback on slider:
- Planet preview updates:
- Information displayed:

**User starts simulation:**
- Transition animation:
- Loading state (if any):
- Initial state of simulation:

**Simulation reaches a milestone:**
- Visual notification:
- Pause option:
- Information display:

**User hovers over planet during simulation:**
- Tooltip shown:
- Additional data displayed:
- Interaction options:

---

## Accessibility Considerations

- Keyboard navigation:
- Screen reader support:
- Color contrast:
- Text size options:
- Alternative text for visuals:

---

## Performance Considerations

- Simulation speed options:
- Frame rate targets:
- Loading states:
- Optimization for complex simulations:

---

## Notes & Special Requirements

[Any additional specifications, technical constraints, or important notes]

---

## Reference Examples

[Links to or descriptions of visual inspirations, similar apps, design styles to emulate]

