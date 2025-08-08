Here’s the **updated PRD** with the **Milestones** section removed, keeping everything else intact and the **Core Logic Implementation Plan** in place.

---

# **Product Requirements Document (PRD)**

**Project Name:** PES 90 – HTML/JS Football Game
**Version:** 1.1
**Date:** 08-Aug-2025
**Owner:** Akshay S

---

## 1. **Overview**

PES 90 is a browser-based football (soccer) game inspired by the classic Pro Evolution Soccer gameplay style. The game will run entirely in HTML, CSS, and JavaScript (vanilla or with a lightweight game engine like Phaser.js), optimized for modern browsers without plugins.
The match duration will be **90 seconds** (compressed from 90 minutes), offering quick, fun, and accessible gameplay.

---

## 2. **Objectives**

* Create a **fast, arcade-style football game** playable directly in the browser.
* Make it lightweight and responsive for desktop and mobile devices.
* Deliver smooth player animations and intuitive controls.
* Ensure easy integration for embedding on websites.

---

## 3. **Target Audience**

* Football fans who want a quick gaming session.
* Casual gamers looking for browser-based sports entertainment.
* Websites embedding mini-games for engagement.

---

## 4. **Game Scope & Features**

### 4.1 **Core Gameplay**

* **Match Time:** 90 seconds per match.
* **Mode:** 1 vs 1 (Player vs AI) in first release.
* **Scoring:** Standard football rules — most goals win.
* **Game Flow:** Kick-off → Play → Halftime (optional skip) → End results.

---

### 4.2 **Teams & Players**

* 2 fictional teams (Team A & Team B) with customizable names/colors.
* Each team: 5 players (4 field + 1 goalkeeper).
* Basic player stats (speed, accuracy) predefined.

---

### 4.3 **Controls**

#### Desktop:

* Arrow keys / WASD → Move player.
* Spacebar → Shoot / Pass.
* Shift → Sprint.
* Enter → Pause/Resume.

#### Mobile:

* On-screen joystick for movement.
* On-screen buttons for shoot/pass and sprint.

---

### 4.4 **AI Logic**

* Simple pathfinding for opponent players.
* Basic decision-making: pass, shoot, defend.

---

### 4.5 **Graphics & Sound**

* **Graphics:** 2D top-down view.
* **Animations:** Player running, shooting, tackling.
* **Sound:** Crowd noise, whistle, kick sound.

---

### 4.6 **Match Rules**

* No fouls/offside for simplicity.
* Goal detected when ball fully crosses goal line.
* Kick-off after each goal.

---

## 5. **Technical Requirements**

* **Frontend:** HTML5 Canvas, JavaScript (Vanilla or Phaser.js).
* **Physics:** Basic ball movement with friction & collision detection.
* **Responsive:** Scales to desktop & mobile screens.
* **Performance:** Runs smoothly at 60 FPS on modern browsers.

---

## 6. **Core Logic Implementation Plan**

### 6.1 **Architecture**

* **Modules:**

  * `engine/` — Game loop & scene management
  * `entities/` — Player, Ball, Team, Goal, Field
  * `input/` — Keyboard & touch joystick controls
  * `ai/` — AI decision-making (Finite State Machine)
  * `physics/` — Collision detection, friction, ball movement
  * `render/` — Canvas rendering layer
* **Data Model:**

  * Game state (`idle`, `playing`, `paused`, `finished`)
  * Timer & score tracking
  * Entities with position, velocity, and state

---

### 6.2 **Game Loop**

* **Pattern:** Fixed timestep physics updates (16.67ms) with `requestAnimationFrame` for rendering.
* **Steps per frame:**

  1. Process player & AI inputs.
  2. Update all entity positions.
  3. Apply ball physics & friction.
  4. Detect and resolve collisions (players, ball, boundaries).
  5. Check goal conditions & update scores.
  6. Render updated game state.

---

### 6.3 **Physics & Collision**

* **Collision Types:**

  * Player ↔ Ball (possession control)
  * Player ↔ Player (avoid overlap)
  * Ball ↔ Field boundaries (bounce or goal detection)
* **Ball Movement:** Uses velocity vectors with gradual speed decay for realism.
* **Possession Logic:** Nearest player on collision gains ball control.

---

### 6.4 **Input Handling**

* **Desktop:** Keyboard events map to directional vectors, sprint toggle, and action buttons.
* **Mobile:** On-screen joystick & buttons with touch event listeners.

---

### 6.5 **AI Behavior**

* **Finite State Machine** with states: `idle`, `chaseBall`, `support`, `defend`, `goalkeeper`.
* **Decision Cycle:** Every 200ms, AI evaluates:

  * Ball position
  * Possession status
  * Teammate positions
  * Match time remaining
* **Movement:** Steering behaviors for chasing, arriving, and avoiding.

---

### 6.6 **Core Algorithms**

* **Shooting:** Calculate ball impulse from facing angle & power, add slight random error for realism.
* **Passing:** Direct ball towards teammate with speed scaling.
* **Goal Detection:** Check if ball crosses goal line inside goal bounds.

---

### 6.7 **Performance Considerations**

* Object pooling for frequently created objects (vectors, temp arrays).
* Avoid per-frame memory allocations in hot loops.
* Minimal physics complexity — circle-based collisions for speed.

---

## 7. **Non-Functional Requirements**

* Load time under 3 seconds.
* Offline support via Service Worker.
* Cross-browser compatibility (Chrome, Firefox, Safari, Edge).

---

## 8. **Success Metrics**

* <3s initial load time.
* 80%+ players complete a full match.
* Average session length >3 minutes.

---

## 9. **Future Enhancements**

* Online multiplayer (WebSocket).
* Additional teams & tournaments.
* Power-ups for arcade-style play.

---

If you want, I can now **add a visual diagram** for the core logic flow (input → update → collision → scoring → render) directly inside this PRD so it’s more developer-friendly. That would make it easier for the team to implement without ambiguity.
