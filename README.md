# 🎮 Kula Browser - Gravity-Defying 3D Puzzle Platformer

<div align="center">

[![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CANNON.js](https://img.shields.io/badge/CANNON.js-Physics-orange?style=for-the-badge)](https://github.com/schteppe/cannon.js/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**🌍 Defy gravity. Master momentum. Conquer impossible worlds. 🌍**

*A browser-based recreation of the classic Kula World, where physics bends to your will*

[Play Demo](#getting-started) • [Watch Gameplay](#screenshots--gameplay) • [Report Bug](https://github.com/yourusername/kula-browser/issues) • [Request Feature](https://github.com/yourusername/kula-browser/issues)

</div>

---

## 🎯 Game Overview

**Kula Browser** reimagines the beloved puzzle-platformer experience for the modern web. Navigate a mysterious sphere through mind-bending levels where gravity is just a suggestion, momentum is your ally, and every surface could become your floor.

### What Makes This Special?

This isn't just another 3D platformer. **Kula Browser** challenges your spatial reasoning and reflexes in ways that traditional games can't:

- **360° Freedom**: Every surface is potentially walkable - walls become floors at your command
- **Physics-Based Puzzles**: Master momentum conservation through gravity shifts to reach impossible places
- **Strategic Gameplay**: Plan your route carefully - one wrong gravity shift could leave you stranded
- **Progressive Difficulty**: From gentle introductions to mind-melting challenges that will test your mastery

### Why You'll Love It

- 🎮 **Pick Up and Play**: Simple controls, deep mechanics
- 🧠 **Brain-Teasing Puzzles**: Each level is a spatial reasoning challenge
- ⚡ **Smooth Performance**: 60 FPS gameplay optimized for all modern browsers
- 🎯 **Clear Objectives**: Collect keys, reach the exit, master the physics
- 🔄 **Endless Replayability**: Perfect your routes, beat your times, master every level

---

## ✨ Features

### Core Gameplay
- 🔄 **Gravity Manipulation**: Shift gravity in 6 directions with Q/E keys
- 🎮 **Smooth Physics**: Realistic ball physics with momentum conservation
- 🗝️ **Key Collection**: Strategic objectives that unlock level completion
- 🚪 **Dynamic Exits**: Exits that activate only when all keys are collected
- 💀 **Environmental Hazards**: Deadly spikes and moving platforms to avoid
- 🏃 **Moving Platforms**: Dynamic level elements that add timing challenges

### Technical Excellence
- 🎨 **Three.js Rendering**: Beautiful 3D graphics powered by WebGL
- ⚙️ **CANNON.js Physics**: Realistic physics simulation for authentic gameplay
- 📱 **Responsive Design**: Adapts to any screen size and resolution
- 🎵 **Immersive Audio**: Sound effects for every action and event
- 📊 **HUD System**: Real-time display of lives, score, and objectives
- 🎯 **Smart Camera**: Intelligent camera that follows action smoothly

### Architecture
- 🏗️ **Modular Design**: Clean, maintainable code architecture
- 📝 **JSON Levels**: Data-driven level system for easy content creation
- 🔌 **Event System**: Decoupled components communicate via events
- 🧪 **Test Coverage**: Comprehensive E2E tests with Playwright
- 📦 **Zero Framework Dependencies**: Pure vanilla JavaScript for maximum performance

---

## 🛠️ Technical Stack

| Technology | Purpose | Why We Chose It |
|------------|---------|-----------------|
| **Three.js** | 3D Rendering | Industry-standard WebGL library with excellent documentation |
| **CANNON.js** | Physics Engine | Lightweight, fast, perfect for web-based physics |
| **Vanilla JavaScript** | Core Logic | No framework overhead, maximum performance |
| **Playwright** | E2E Testing | Modern testing framework with great debugging tools |
| **Webpack** | Module Bundling | Efficient bundling and optimization |
| **ES6 Modules** | Code Organization | Clean, modern module system |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v14.0.0 or higher)
- **npm** (v6.0.0 or higher)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/kula-browser.git

# Navigate to project directory
cd kula-browser

# Install dependencies
npm install

# Start the development server
npm start
```

### Running the Game

1. **Development Mode**:
   ```bash
   npm start
   ```
   Opens the game at `http://localhost:8080`

2. **Production Build**:
   ```bash
   npm run build
   ```
   Creates optimized build in `dist/` directory

3. **Run Tests**:
   ```bash
   npm test        # Run all tests
   npm run test:e2e # Run E2E tests only
   ```

---

## 🎮 How to Play

### Controls

| Action | Key/Input | Description |
|--------|-----------|-------------|
| **Move Forward** | `W` | Roll the ball forward |
| **Move Backward** | `S` | Roll the ball backward |
| **Move Left** | `A` | Roll the ball left |
| **Move Right** | `D` | Roll the ball right |
| **Jump** | `Space` | Make the ball jump |
| **Gravity Left** | `Q` | Shift gravity 90° left |
| **Gravity Right** | `E` | Shift gravity 90° right |
| **Camera** | `Mouse` | Look around (click and drag) |

### Objectives

1. **🗝️ Collect All Keys**: Find and collect all yellow keys scattered throughout the level
2. **🚪 Unlock the Exit**: The exit portal activates only after all keys are collected
3. **⚠️ Avoid Hazards**: Don't touch red spikes or fall into the void
4. **⏱️ Master Your Time**: Complete levels as quickly as possible for the best score

### Pro Tips

- **Momentum Matters**: Your velocity carries through gravity shifts - use it wisely!
- **Plan Your Route**: Survey the level before making risky gravity changes
- **Jump + Gravity**: Combine jumps with gravity shifts for advanced maneuvers
- **Edge Safety**: Be careful near edges when shifting gravity
- **Platform Timing**: Study moving platform patterns before attempting crosses

---

## 🏗️ Architecture

### System Design

```
┌─────────────────────────────────────────────────────────┐
│                     Game Controller                      │
│                  (Main Game Loop & State)                │
└────────┬────────────────────────────────────┬───────────┘
         │                                    │
    ┌────▼─────┐                        ┌────▼─────┐
    │  Physics │                        │ Renderer │
    │  Manager │                        │  (Three) │
    └────┬─────┘                        └────┬─────┘
         │                                    │
┌────────▼────────────────────────────────────▼───────────┐
│                    Core Systems                          │
├──────────────┬──────────────┬──────────────┬───────────┤
│   Player     │   Camera     │    Level     │    UI     │
│ Controller   │ Controller   │   Manager    │  Manager  │
└──────────────┴──────────────┴──────────────┴───────────┘
         │                                    │
┌────────▼────────────────────────────────────▼───────────┐
│                  Entity Components                       │
├──────────────┬──────────────┬──────────────┬───────────┤
│   Platform   │     Key      │    Hazard    │   Exit    │
│   Entity     │   Entity     │   Entity     │  Entity   │
└──────────────┴──────────────┴──────────────┴───────────┘
```

### Key Modules

- **🎮 Game.js**: Main game controller and state management
- **⚽ PlayerController.js**: Ball movement, jumping, and gravity control
- **⚙️ PhysicsManager.js**: CANNON.js integration and physics simulation
- **📷 CameraController.js**: Smooth camera following and user input
- **🗺️ LevelManager.js**: Level loading, entity creation, and management
- **📊 UIManager.js**: HUD rendering and user interface updates
- **🎵 AudioManager.js**: Sound effect management and playback
- **🎯 EventBus.js**: Central event system for component communication

### Event Flow

```javascript
// Example: Key Collection Flow
PlayerController → Collision → EventBus.emit('keyCollected')
                                    ↓
    ┌───────────────────────────────┼───────────────────┐
    ↓                               ↓                   ↓
UIManager.updateScore()    LevelManager.checkWin()  AudioManager.playSound()
```

---

## 🧪 Testing

### Test Coverage

Our comprehensive test suite ensures reliability and stability:

- **✅ E2E Tests**: Full gameplay scenarios with Playwright
- **✅ Integration Tests**: Component interaction verification
- **✅ Regression Tests**: Ensuring new features don't break existing ones
- **✅ Performance Tests**: FPS and rendering optimization checks

### Running Tests

```bash
# Run all tests
npm test

# Run E2E tests with UI
npm run test:e2e:ui

# Run specific test suite
npm run test -- --grep "gravity"

# Generate coverage report
npm run test:coverage
```

### Test Categories

1. **Core Mechanics**: Movement, jumping, gravity shifts
2. **Level Systems**: Loading, entity creation, objectives
3. **Collision Detection**: Player-entity interactions
4. **Game States**: Win/lose conditions, score tracking
5. **Performance**: Frame rate, memory usage, load times

---

## 🎨 Level Design

### Level Format

Levels are defined in JSON for easy creation and modification:

```json
{
  "name": "Gravity Garden",
  "difficulty": "medium",
  "par_time": 120,
  "spawn": { "x": 0, "y": 5, "z": 0 },
  "platforms": [
    {
      "position": { "x": 0, "y": 0, "z": 0 },
      "size": { "x": 10, "y": 1, "z": 10 },
      "color": "#4CAF50",
      "type": "static"
    }
  ],
  "keys": [
    {
      "id": "key1",
      "position": { "x": 5, "y": 2, "z": 5 },
      "color": "#FFD700"
    }
  ],
  "hazards": [
    {
      "type": "spike",
      "position": { "x": -3, "y": 1, "z": 0 },
      "damage": 1
    }
  ],
  "exit": {
    "position": { "x": 0, "y": 2, "z": -8 },
    "requiredKeys": ["key1", "key2", "key3"]
  }
}
```

### Creating Custom Levels

1. Create a new JSON file in `assets/levels/`
2. Define platforms, keys, hazards, and exit
3. Add to level registry in `LevelManager.js`
4. Test thoroughly with different gravity orientations

### Entity Types

| Entity | Purpose | Properties |
|--------|---------|------------|
| **Platform** | Walkable surfaces | position, size, color, movement |
| **Key** | Collectible objectives | position, id, color, value |
| **Hazard** | Damage sources | position, type, damage, pattern |
| **Exit** | Level completion | position, requiredKeys, nextLevel |
| **Moving Platform** | Dynamic obstacles | position, size, path, speed |

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### How to Contribute

1. **Fork the Repository**: Click the Fork button at the top of this page
2. **Clone Your Fork**: `git clone https://github.com/yourusername/kula-browser.git`
3. **Create a Branch**: `git checkout -b feature/amazing-feature`
4. **Make Changes**: Implement your feature or fix
5. **Test Thoroughly**: Run all tests and add new ones if needed
6. **Commit**: `git commit -m 'feat: add amazing feature'`
7. **Push**: `git push origin feature/amazing-feature`
8. **Open PR**: Submit a Pull Request with a clear description

### Code Style Guidelines

- Use ES6+ features where appropriate
- Follow existing code patterns and architecture
- Comment complex logic and algorithms
- Write self-documenting code with clear variable names
- Add JSDoc comments for public methods
- Ensure all tests pass before submitting

### Testing Requirements

- Add E2E tests for new features
- Maintain or improve code coverage
- Test across different browsers
- Verify performance impact

---

## 🗺️ Roadmap

### Version 1.0 (Current)
- ✅ Core gameplay mechanics
- ✅ 5 introductory levels
- ✅ Basic hazards and moving platforms
- ✅ Sound effects and HUD
- ✅ Full test coverage

### Version 1.1 (Next)
- 🔄 10 additional levels with increasing difficulty
- 🔄 New hazard types (lasers, crushers, teleporters)
- 🔄 Time trial mode with leaderboards
- 🔄 Level restart and checkpoint system

### Version 2.0 (Future)
- 📝 In-browser level editor
- 🌍 Community level sharing
- 🏆 Achievement system
- 🎮 Gamepad support
- 📱 Mobile touch controls
- 👥 Local multiplayer races

### Long-term Vision
- 🌐 Online multiplayer
- 🎨 Custom ball skins and trails
- 🎵 Dynamic music system
- 🏗️ Workshop/modding support
- 🎯 Daily challenges
- 📊 Global leaderboards

---

## 🚀 Development Journey

### The Five Phases

This game was built following a rigorous test-driven development approach across five phases:

1. **Phase 1 - Core Engine**: Three.js setup, basic physics, player controller
2. **Phase 2 - Gravity System**: 6-directional gravity, momentum conservation
3. **Phase 3 - Level Objectives**: Keys, exits, level loading system
4. **Phase 4 - Game Systems**: Score, lives, HUD, audio integration
5. **Phase 5 - Polish**: Hazards, moving platforms, visual effects

### Key Challenges Overcome

- **🔄 Gravity Transitions**: Smooth camera reorientation during gravity shifts
- **⚡ Performance**: Maintaining 60 FPS with complex physics calculations
- **🎯 Precision**: Pixel-perfect collision detection for tight platforming
- **📐 Spatial Logic**: Intuitive controls regardless of gravity orientation
- **🎨 Visual Clarity**: Clear visual communication of game state

### Performance Optimizations

- Object pooling for entities
- Efficient collision detection with spatial partitioning
- Texture atlasing for reduced draw calls
- LOD system for distant objects
- Optimized shader usage

---

## 👏 Credits

### Development Team
- **Human Developer**: Project vision, requirements, and guidance
- **Claude AI Assistant**: Implementation, architecture, and testing
- **Collaboration**: A testament to human-AI pair programming

### Inspiration
- **Kula World** (1998): The original PlayStation classic that inspired this project
- **Portal Series**: Spatial puzzle design philosophy
- **Super Mario Galaxy**: Gravity mechanic inspiration

### Technologies & Libraries
- [Three.js](https://threejs.org/) - 3D graphics library
- [CANNON.js](https://github.com/schteppe/cannon.js/) - Physics engine
- [Playwright](https://playwright.dev/) - Testing framework
- [Webpack](https://webpack.js.org/) - Module bundler

### Special Thanks
- The Three.js community for excellent documentation
- Open source contributors who make projects like this possible
- Classic game developers who inspire new generations

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Kula Browser Development Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 📞 Contact

- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/kula-browser/issues)
- **Discussions**: [Join the conversation](https://github.com/yourusername/kula-browser/discussions)
- **Email**: your.email@example.com

---

<div align="center">

### 🎮 Ready to defy gravity?

**[Play Now](#getting-started) | [Watch Gameplay](#) | [Join Discord](#)**

Made with ❤️ and physics

*"In a world where up is down and walls are floors, only the skilled survive."*

</div>