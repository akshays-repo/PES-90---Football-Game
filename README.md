# PES 90 - Football Game

PES 90 — A 90‑second, browser‑based football game with smooth physics, simple AI, and responsive controls. Built with HTML5 Canvas and vanilla JavaScript.

## 🎮 Features

- **90-second matches** - Quick, intense football action
- **1 vs 1 gameplay** - Player vs AI matches
- **Responsive design** - Works on desktop and mobile devices
- **Smooth physics** - Realistic ball movement and player interactions
- **AI opponents** - Smart computer-controlled players
- **Modern UI** - Beautiful, intuitive interface

## 🚀 How to Run

### Option 1: Direct File Opening
1. Download all files to a folder
2. Open `index.html` in a modern web browser (Chrome, Firefox, Safari, Edge)

### Option 2: Local Server (Recommended)
1. Install a local server (e.g., Python, Node.js, or Live Server extension)
2. Navigate to the project folder
3. Start the server and open the URL in your browser

**Using Python:**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Using Node.js:**
```bash
npx http-server
```

**Using VS Code:**
- Install the "Live Server" extension
- Right-click on `index.html` and select "Open with Live Server"

## 🎯 How to Play

### Desktop Controls
- **Arrow Keys** or **WASD** - Move player
- **Spacebar** - Shoot
- **P** - Pass
- **Shift** - Sprint
- **Enter** - Pause/Resume

### Mobile Controls
- **Joystick** - Move player
- **Shoot button** - Shoot
- **Sprint button** - Sprint

### Game Rules
- Score more goals than your opponent in 90 seconds
- Get close to the ball to gain possession
- Pass to teammates or shoot directly at the goal
- Use sprint sparingly as it consumes stamina

## 📚 Documentation

- Product Requirements: `doc/prd.md`
- Entities & Core Systems (student-friendly): `doc/entities-and-core-systems.md`

## 🏗️ Project Structure

```
pes90engine/
├── index.html              # Main HTML file
├── css/
│   └── style.css           # Game styling
├── js/
│   ├── main.js             # Main game initialization
│   ├── engine/
│   │   └── GameEngine.js   # Core game engine
│   ├── entities/
│   │   ├── Entity.js       # Base entity class
│   │   ├── Player.js       # Player class
│   │   ├── Ball.js         # Ball physics
│   │   ├── Team.js         # Team management
│   │   ├── Goal.js         # Goal detection
│   │   └── Field.js        # Field rendering
│   ├── input/
│   │   └── InputManager.js # Input handling
│   ├── ai/
│   │   └── AIManager.js    # AI behavior
│   ├── physics/
│   │   └── PhysicsEngine.js # Physics simulation
│   ├── render/
│   │   └── Renderer.js     # Rendering system
│   └── scenes/
│       ├── MenuScene.js    # Main menu
│       └── GameScene.js    # Game scene
└── doc/
    ├── prd.md                      # Product Requirements Document
    └── entities-and-core-systems.md # Entities & Core Systems guide
```

## 🛠️ Technical Details

### Architecture
- **Modular design** with separate systems for physics, AI, input, and rendering
- **Entity-Component system** for game objects
- **Scene management** for different game states
- **Fixed timestep physics** for consistent gameplay

### Performance
- **60 FPS target** with smooth animations
- **Optimized rendering** with object pooling
- **Mobile-friendly** with touch controls
- **Responsive design** that adapts to screen size

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🐛 Debug Features

When running locally, you can use these debug keys:
- **F1** - Toggle debug mode
- **F2** - Log game state
- **F3** - Reset game

## 📱 Mobile Support

The game automatically detects mobile devices and:
- Shows touch controls instead of keyboard instructions
- Adjusts UI layout for smaller screens
- Optimizes performance for mobile hardware

## 🎨 Customization

You can easily customize the game by modifying:
- **Team colors** in `Team.js`
- **Player stats** in `Player.js`
- **Field appearance** in `Field.js`
- **UI styling** in `style.css`

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to contribute by:
- Reporting bugs
- Suggesting new features
- Improving the AI
- Enhancing the graphics
- Optimizing performance

## 🎯 Future Enhancements

Planned features for future versions:
- Online multiplayer
- Additional teams and tournaments
- Power-ups and special moves
- Sound effects and music
- Tournament mode
- Custom team creation

---

**Enjoy playing PES 90!** ⚽ 