### **FILE: `GLOBAL-DESIGN-PLAN.md`**

# Global Design Plan: Kula World - The Grid Evolution

**Version:** 2.0
**Status:** Strategic Baseline

## 1. Vision for the Next Generation

The initial prototype of Project Kula Web was an unqualified success. It proved our ability to faithfully recreate a classic, beloved mechanic within a modern, performant, browser-based architecture. We have built an engine. Now, we will build a universe.

This document outlines the strategic evolution of our platform from a single game into a robust, scalable, and extensible **game creation engine**. Our goal is to exponentially accelerate content development, deepen gameplay possibilities, and lay the foundation for future community-driven creation. We will achieve this by re-architecting our core around a **Universal Grid System**.

## 2. The Four Pillars of the Grid Engine

Our next-generation engine will be built upon four foundational pillars.

#### 🏛️ **Pillar 1: The Universal Grid**

The world is no longer a collection of floating-point coordinates; it is a deterministic 3D grid.
*   **Definition:** All static level geometry will be defined by integer coordinates (e.g., `[x, y, z]`). A global `gridUnitSize` (e.g., 4) will translate these grid coordinates into world space positions.
*   **Rationale:** This shift provides immense benefits:
    *   **Speed:** Level design becomes as simple as painting blocks onto a grid.
    *   **Predictability:** Jump distances, timings, and puzzle solutions become standardized and easier to design with precision.
    *   **Performance:** Adjacent static geometry can be algorithmically merged into single, larger physics bodies, drastically reducing collision-detection overhead.

#### 🏛️ **Pillar 2: The Block & Asset Registry**

We will decouple visual representation from logical function.
*   **Definition:** A centralized registry will map logical block types (e.g., `'standard_platform'`, `'spike_trap'`) to their constituent parts:
    1.  **Visual Model:** A path to a `.glb` asset (e.g., `Stone Platform.glb`).
    2.  **Physics Primitive:** A simple, invisible physics shape (e.g., `CANNON.Box`).
    3.  **Grid Footprint:** The size of the block in grid units (e.g., `[1, 1, 1]`).
*   **Rationale:**
    *   **Theming:** We can create different "skins" for our levels. A `'standard_platform'` could be a `Rock.glb` in a nature theme or a `Cargo.glb` in a sci-fi theme, without changing any level logic.
    *   **Normalization:** All our diverse assets can be used as building blocks by assigning them a standardized physics primitive and grid footprint.
    *   **Optimization:** We always use simple physics shapes, even for visually complex models, ensuring performance remains high.

#### 🏛️ **Pillar 3: The Declarative Behavior System**

Blocks are no longer just static geometry; they are smart objects with programmable behaviors.
*   **Definition:** Level JSON files will support a `behaviors` array. This allows designers to attach behaviors to blocks in a declarative, data-driven way.
*   **Example:**
    ```json
    "behaviors": [
      {
        "targetBlock": [3, 1, 5],
        "type": "elevator",
        "endPosition": [3, 8, 5],
        "speed": 2,
        "trigger": "onPlayerContact"
      },
      {
        "targetBlock": [5, 1, 5],
        "type": "timed_trap",
        "action": "retract",
        "interval": 3,
        "delay": 1.5
      }
    ]
    ```
*   **Rationale:**
    *   **Empowerment:** This gives designers incredible power to create dynamic, interactive puzzles without writing a single line of code.
    *   **Extensibility:** The engine will contain a library of behavior handlers (`elevator`, `timed_trap`, etc.) that can be easily expanded over time.
    *   **Clarity:** The level file becomes a complete, human-readable blueprint of the entire puzzle's logic.

#### 🏛️ **Pillar 4: Thematic World Packs**

We will organize our content into distinct, immersive worlds.
*   **Definition:** Levels and assets will be grouped into thematic packs (e.g., `nature`, `sci-fi`, `kitchen`). Each level will specify its theme, which instructs the Asset Registry on which models to load.
*   **Rationale:**
    *   **Cohesion:** Provides players with a strong sense of progression and visual variety.
    *   **Scalability:** Allows the development team to focus on one theme at a time, from asset creation to level design.
    *   **Monetization/DLC:** Provides a natural structure for future content expansions.

## 3. High-Level Implementation Roadmap

This vision will be realized through a disciplined, phased approach.

*   **PHASE 6: Architecture & Requirements (Current)**
    *   **Goal:** Formalize this plan and update all core documentation.
    *   **Outcome:** A shared, unambiguous blueprint for the engine's evolution.

*   **PHASE 7: The Grid Engine Refactor**
    *   **Goal:** Implement the core architectural changes.
    *   **Outcome:** A refactored `LevelManager` that understands grid coordinates, a functional `Block & Asset Registry`, and the ability to load a simple, static grid-based level.

*   **PHASE 8: The First World - "The Verdant Ruins"**
    *   **Goal:** Build out the first thematic world using the new engine.
    *   **Outcome:** A complete set of normalized nature-themed assets (`Rock.glb`, `Grass Platform.glb`, etc.) and 5-10 fully playable levels that showcase the beauty and potential of the new system.

*   **PHASE 9: The Behavior System Implementation**
    *   **Goal:** Bring the world to life by implementing the Declarative Behavior System.
    *   **Outcome:** A library of core behaviors (elevators, moving platforms, traps, switches) and levels that utilize them to create dynamic, engaging puzzles.

*   **Future Phases: The Creator's Toolkit**
    *   **Goal:** Leverage the grid-based, declarative nature of our engine to build an in-browser level editor.
    *   **Outcome:** A game that never ends, powered by the creativity of its community.