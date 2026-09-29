# Mini Royale - Free Fire Style Battle Royale

**A browser-based 3D battle royale game inspired by Free Fire.** Drop into a massive map with 35 AI opponents, loot weapons and supplies, fight to survive as the zone shrinks, and be the last one standing — all running in your browser with no downloads, no installs, no server required. Works on desktop (keyboard + mouse) and mobile (touch controls). Built entirely with Three.js and vanilla JavaScript.

> **This project is entirely vibe coded** — built from scratch using AI-assisted development (GitHub Copilot) through natural language conversations. No boilerplate, no starter templates, no tutorials followed. Every line of code was generated through a collaborative human-AI vibe coding workflow where the developer described what they wanted in plain English, and the AI wrote the code. This is what vibe coding looks like — turning ideas into a fully playable game through conversation.

![Battle Royale](https://img.shields.io/badge/Genre-Battle%20Royale-red)
![Three.js](https://img.shields.io/badge/Engine-Three.js%20r128-blue)
![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Mobile-green)
![Vibe Coded](https://img.shields.io/badge/Built%20With-Vibe%20Coding-purple)

--- 

## What is This?

A **fully playable 3D battle royale game** inspired by Free Fire, running entirely in the browser. Drop into a massive 1000×1000 map with 35 AI opponents, enter buildings for cover, scavenge for loot, and fight to be the last one standing as the zone closes in. Installable as a PWA for a native app experience. Works on both desktop and mobile with full touch controls.

---

## Features

### Combat System
- **3 Weapons** with distinct playstyles:
  - **Pistol** (SEMI) — 18 damage, precise single shots
  - **AR - Assault Rifle** (AUTO) — 24 damage, full-auto spray
  - **Shotgun** (PUMP) — 14 damage × 7 pellets, devastating close range
- **Aim Down Sights (ADS)** — reduced spread and zoom per weapon
- **Grenade system** — physics-based throwables with area damage and explosion effects
- **Hit markers** — visual and audio feedback on every hit
- **Muzzle flash** on the first-person weapon model
- **Camera recoil** — realistic kick and recovery synced with fire direction (stronger on shotgun)
- **Red aim lock indicator** — pulsing red ring around crosshair when aiming at an enemy (Free Fire style)

### Survival Mechanics
- **150 HP** + **100 max shield** (start with 50 shield)
- **Shield absorbs damage first** before HP is touched
- **5-phase shrinking zone** with countdown timer — stay inside or take increasing damage
- **100 loot pickups** scattered across the map: health packs, ammo boxes, shield potions, grenades

### World
- **1000×1000 unit map** with varied terrain and multiple named locations
- **38 enterable buildings** — walk through doorways, take cover inside, with interior floors and window views
- **200 trees** (pine and deciduous varieties)
- **80 rocks** as natural cover
- **5 water areas** with animated surfaces
- **Dynamic clouds** drifting across the sky
- **6 road networks** with lane markings and intersections
- **Fog system** for atmospheric depth

### AI Enemies
- **35 bot opponents** with unique names displayed above their heads (36 unique name pool)
- **Two AI states**: Wander (exploring) and Combat (engaging players)
- **Strafing behavior** in close-range fights
- **Enemy-vs-enemy combat** — bots fight each other too
- **Zone awareness** — bots move toward safe zone when outside
- **Line-of-sight detection** with configurable sight range

### HUD & UI
- **Heading-up rotating minimap** — rotates with camera direction (like Free Fire), shows 200-unit radius around player, with FOV cone, pulsing enemy dots (closer = faster pulse), loot markers, zone ring, and building outlines
- **Green triangle** player marker on minimap (always centered, always pointing up = forward)
- **Compass** showing heading in degrees + cardinal direction
- **Zone countdown timer** — shows time until next shrink, flashes red during shrinking
- **Kill feed** with elimination notifications
- **Damage direction indicators** (top/bottom/left/right arrows)
- **Red zone wall** — tall semi-transparent red cylinder showing the zone boundary
- **Bot name sprites** — enemy names visible above their heads within 50 units
- **Low ammo warning** — HUD flashes red when magazine is below 25%
- **Health/Shield bars** with color-coded health states (green → yellow → red)
- **Stance indicator** (Standing/Crouching)

### Mobile Support (Free Fire Style)
- **Virtual joystick** for movement (left thumb)
- **Touch look zone** for camera control (right side of screen)
- **Sprint/Run button** (🏃) — toggle sprint while using joystick, like Free Fire
- **Action buttons**: Fire, ADS, Jump, Crouch, Reload, Grenade, Pickup
- **Weapon switch strip** at bottom of screen
- **Landscape mode enforced** — portrait orientation shows a rotate prompt
- **Responsive HUD** — all UI elements resize for mobile screens
- **Draggable layout editor** (⚙) — reposition all buttons with drag & drop, save/reset to localStorage

### Technical
- **Cached geometries** for bullets and particles (reduces GC pressure)
- **Race-condition-safe UI** — all timed UI effects use `clearTimeout` to prevent visual glitches
- **XSS-safe kill feed** — player/enemy names are sanitized before rendering
- **Capped delta time** (max 50ms) to prevent physics explosions on tab-switch
- **Pixel ratio capping** at 2x to balance quality and performance
- **PCF soft shadow maps** with 2048×2048 resolution
- **ACES Filmic tone mapping** for cinematic color grading
- **PWA support** — installable to home screen with offline caching, app icons, and standalone display
- **Service Worker** — caches game assets for offline play after first load

---

## File Structure

```
mini-royale/
├── index.html                  # Game HTML — all UI elements, screens, HUD, PWA meta tags
├── js/
│   └── game.js                 # Game engine — all logic, rendering, AI, physics
├── css/
│   ├── style.css               # Main stylesheet — HUD, screens, overlays, effects
│   └── mobile.css              # Mobile touch controls, responsive, landscape lock
├── assets/
│   └── icons/
│       ├── favicon.ico
│       ├── favicon-16x16.png
│       ├── favicon-32x32.png
│       ├── apple-touch-icon.png
│       ├── android-chrome-192x192.png
│       ├── android-chrome-512x512.png
│       └── logo.png
├── manifest.json               # PWA manifest — app name, icons, display mode, orientation
├── sw.js                       # Service worker — offline caching of game assets
└── README.md                   # This file
```

| File | Purpose | Lines |
|------|---------|-------|
| `index.html` | Game structure: start screen, game-over screen, HUD, mobile touch controls, PWA meta tags, service worker registration | ~170 |
| `js/game.js` | Complete game engine: Three.js scene setup, world generation (enterable buildings, trees, rocks, water, roads, clouds), player controller with recoil & sprint, first-person weapon, enemy AI (wander/combat FSM) with name sprites, shooting/bullet system, grenade physics, particle effects, loot/pickup system, zone shrinking with red wall, wall-segment collision detection, HUD updates, player-centered minimap, aim lock detection, audio (Web Audio API), mobile input handling, layout editor | ~1900+ |
| `manifest.json` | PWA manifest: app name, icons, standalone display, landscape orientation | ~25 |
| `sw.js` | Service worker: install/activate/fetch handlers, asset caching for offline play | ~35 |
| `css/style.css` | Desktop UI styles: HUD layout, health bars, crosshair, aim lock indicator, hit markers, ADS scope overlay, minimap frame, zone warning, kill feed animations, start/game-over screens, damage flash vignette, weapon info panel, compass, reload bar | ~280 |
| `css/mobile.css` | Mobile-specific styles: virtual joystick, look zone, action buttons (fire/ADS/jump/crouch/reload/grenade/pickup/sprint), weapon switch strip, layout editor with save/reset, responsive HUD scaling, landscape enforcement, rotate prompt | ~200 |

---

## How to Play

### Desktop Controls

| Key | Action |
|-----|--------|
| `W` `A` `S` `D` | Move |
| `Mouse` | Look around |
| `Left Click` | Shoot |
| `Right Click` | Aim Down Sights |
| `R` | Reload |
| `Space` | Jump |
| `Shift` | Sprint |
| `C` | Crouch |
| `1` `2` `3` | Switch weapons |
| `G` | Throw grenade |
| `E` | Pick up loot |

### Mobile Controls
- **Left thumb**: Virtual joystick for movement
- **Right side**: Touch and drag to look around
- **Fire button** (🔥): Shoot
- **ADS button**: Toggle aim down sights
- **Jump** (⬆): Jump
- **Crouch** (🦆): Toggle crouch
- **R**: Reload
- **💣**: Throw grenade
- **Sprint** (🏃): Toggle sprint for faster movement
- **Pick**: Pick up nearby loot (appears when near loot)
- **1/2/3 strip**: Switch weapons
- **⚙ Settings**: Drag buttons to reposition, save or reset layout

---

## How to Run

1. Clone this repository:
   ```bash
   git clone <your-repo-url>
   cd battle-zone
   ```

2. Serve the files with any static server:
   ```bash
   # Python
   python -m http.server 8000

   # Node.js
   npx serve .

   # Or just open index.html directly in a browser
   ```

3. Open `http://localhost:8000` in your browser

4. Click **DROP IN** to start playing

> **Note**: The game loads Three.js r128 from CDN. An internet connection is required on first load.

---

## Game Balance

The game is balanced for longer, more strategic matches:

| Stat | Value |
|------|-------|
| Player HP | 150 |
| Max Shield | 100 (start with 50) |
| Enemy Count | 35 bots |
| Enemy Damage | 35% of weapon base damage |
| Enemy Fire Rate | 2.5× slower than player |
| Enemy Accuracy | 0.14–0.24 spread (lower = worse for bots) |
| Enemy Sight Range | 35–60 units |
| Enemy Bullet Speed | 55% of player bullet speed |
| Zone Phase 1 Delay | 80 seconds |
| Zone Damage | 2 + phase number per second |
| Loot Spawns | 100 items across the map |

---

## Tech Stack

- **[Three.js](https://threejs.org/) r128** — 3D rendering engine
- **Web Audio API** — procedural sound effects (no audio files needed)
- **Vanilla JavaScript** — no frameworks, no build tools
- **CSS3** — all UI with backdrop-filter, gradients, keyframe animations
- **HTML5** — semantic structure with Canvas for minimap
- **Screen Orientation API** — mobile landscape lock
- **PWA** — manifest.json + service worker for installable native-like experience

---

## Vibe Coding

This entire project was **vibe coded** using [GitHub Copilot](https://github.com/features/copilot) in VS Code. Vibe coding is a development approach where you describe what you want in natural language, and AI writes the code. The entire game — from the Three.js scene setup to the mobile touch controls to the enemy AI state machine — was built through iterative conversations:

1. *"Make a Free Fire like web game"* → Initial battle royale prototype
2. *"Make it more advanced, HP max 100"* → Enhanced systems, proper health/shield
3. *"Make this also operate in mobile very easily same like Free Fire"* → Full touch control system
4. *"In mobile I want horizontal like Free Fire"* → Landscape mode enforcement
5. *"Anything we can do better?"* → Performance optimizations, zone timer, low ammo warnings
6. *"I die too fast, want good file structure and README"* → Game rebalancing, project restructuring
7. *"Extend map, enter houses, camera sync, PWA, rename"* → 1000×1000 map, enterable buildings, recoil system, PWA with icons, renamed to Mini Royale
8. *"Fix mobile layout, fullscreen, safe area"* → Mobile UI polish, viewport-fit, safe-area insets
9. *"Fix PWA for GitHub Pages and Vercel"* → Relative paths, display fullscreen, SW cache
10. *"Organize folder structure"* → Moved icons to assets/icons/, JS to js/game.js
11. *"Draggable buttons, bot names, red zone wall, minimap dots"* → Layout editor, name sprites, zone visualization, pulsing minimap
12. *"Player-centered minimap, brighter settings icon"* → North-up minimap, green triangle marker
13. *"Red pointer when aiming at enemy"* → Aim lock indicator ring on crosshair
14. *"Run button like Free Fire, reset layout, update README"* → Sprint toggle button, layout reset, comprehensive README update
15. *"Desktop is broken, white background on aim lock"* → Fixed mobile detection (any-pointer/any-hover), removed aim-lock artifacts, always register keyboard+mouse
16. *"Minimap should rotate with camera like Free Fire"* → Heading-up rotating minimap, map spins around player
17. *"Recoil is too much, I miss targets"* → Reduced recoil 60%, increased recovery to 85%, less horizontal sway
18. *"Better landing page with logo"* → Professional start screen with SVG crosshair logo, animated background, stats row, polished UI

No code was manually written. Every feature, every bug fix, every optimization was done through human-AI collaboration. That's vibe coding.

---

## License

This project is open source. Feel free to fork, modify, and build upon it.
