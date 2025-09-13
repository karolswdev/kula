# Level Design Documentation

## Overview
This directory contains JSON level definitions for the Kula Browser game. Each level is designed to progressively teach and challenge players with the game's unique gravity-shifting mechanics.

## Level Structure

### Level 1: Gravity Discovery (`level-1.json`)
**Theme:** Tile-based platforming with gravity introduction

**Design Philosophy:**
- Separated tile platforms require precise jumping
- Progressive difficulty from simple jumps to gravity shifts
- Visual clarity through color-coded sections

**Layout:**
1. **Starting Area (Gray tiles):** Central hub with clear paths
2. **Horizontal Path (East):** Series of tiles leading to wall transition
3. **Branch Paths (North/South):** Optional exploration for keys
4. **Wall Section (Blue tiles):** Vertical climbing area
5. **Exit Zone (Purple tiles):** Final challenge on the wall

**Key Locations:**
- Key 1: First tile jump (easy introduction)
- Key 2: Branch path (navigation challenge)
- Key 3: Wall platform (gravity shift required)

**Unique Features:**
- Tile gaps of 1-2 units require momentum management
- Corner ramps provide smooth wall transitions
- Color gradient indicates progression path

### Tutorial Level: Jump and Shift (`test-level-enhanced.json`)
**Theme:** Compact tutorial environment

**Design Philosophy:**
- Teaches mechanics in controlled environment
- Clear visual separation of floor/wall/ceiling
- Shorter distances for quick learning

**Layout:**
- Central hub with four-directional branches
- Wall section with climbing platform
- Ceiling area with exit portal

### Classic Box Room (`test-level.json`)
**Theme:** Original test environment

**Purpose:**
- Simple enclosed space for testing mechanics
- No platforming challenges
- Gravity shifts between large surfaces

## Design Guidelines

### Tile Sizing
- Standard floor tile: 3x1x3 or 4x1x4 units
- Wall tiles: 0.5-1 unit depth for visual clarity
- Minimum gap: 1 unit (easy jump)
- Maximum gap: 2.5 units (challenging jump)

### Color Coding
- Gray (#808080): Standard platforms
- Blue (#606090): Wall surfaces
- Purple (#7070B0): Special/exit areas
- Green (#90A090): Starting area

### Difficulty Progression
1. **Introduction:** Simple tile jumping on flat surfaces
2. **Exploration:** Branching paths with choices
3. **Challenge:** Gaps requiring precise timing
4. **Mastery:** Gravity shifts to reach objectives

### Visual Hints
- Ramps indicate transition points
- Color changes suggest new mechanics
- Arrow decorations guide player attention

## Testing Checklist

When testing a level, verify:
- [ ] All tiles are reachable with standard jump
- [ ] Keys are visible and collectible
- [ ] Wall transitions are smooth
- [ ] Camera follows properly during gravity shifts
- [ ] Exit portal unlocks with all keys
- [ ] Fall threshold prevents infinite falling
- [ ] Visual clarity from all angles

## Level Metrics

### Optimal Completion Times
- Level 1: 60-90 seconds (experienced player)
- Tutorial: 45-60 seconds
- Classic Room: 30-45 seconds

### Difficulty Ratings
- Level 1: ★★★☆☆ (Moderate)
- Tutorial: ★★☆☆☆ (Easy)
- Classic: ★☆☆☆☆ (Trivial)

## Future Level Concepts

### Planned Mechanics
- Moving platforms
- Timed challenges
- Multiple gravity zones
- Collectible paths
- Hidden areas

### Theme Ideas
- Floating Islands
- Cubic Maze
- Spiral Tower
- Inverted Pyramid
- Orbital Station