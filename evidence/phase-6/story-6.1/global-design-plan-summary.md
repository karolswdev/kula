# GLOBAL-DESIGN-PLAN.md Summary

## Four Core Pillars

### 1. The Universal Grid
- World defined by deterministic 3D grid with integer coordinates `[x, y, z]`
- Global `gridUnitSize` translates grid coords to world space
- Benefits: Speed in level design, predictable mechanics, performance optimization through geometry merging

### 2. The Block & Asset Registry  
- Centralized registry mapping logical block types to:
  - Visual Model (`.glb` asset path)
  - Physics Primitive (CANNON shapes)
  - Grid Footprint (size in grid units)
- Enables theming, normalization, and optimization

### 3. The Declarative Behavior System
- Blocks support programmable behaviors via JSON `behaviors` array
- Designers attach behaviors declaratively without code
- Examples: elevators, timed traps, moving platforms
- Extensible library of behavior handlers

### 4. Thematic World Packs
- Content organized into immersive themed worlds
- Each level specifies theme for Asset Registry
- Natural structure for progression and future DLC

## High-Level Implementation Roadmap

- **PHASE 6**: Architecture & Requirements (Current)
  - Formalize plan and update documentation
  
- **PHASE 7**: The Grid Engine Refactor
  - Implement core grid system
  - Build Block & Asset Registry
  - Load simple grid-based levels
  
- **PHASE 8**: The First World - "The Verdant Ruins"
  - Create nature-themed assets
  - Build 5-10 playable levels
  
- **PHASE 9**: The Behavior System Implementation
  - Implement declarative behaviors
  - Create dynamic puzzles
  
- **Future**: The Creator's Toolkit
  - In-browser level editor
  - Community-driven content