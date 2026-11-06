# Phaser Game Canvas Visibility — Manual Test Instructions

## What Was Fixed

**Problem:** User navigated to `/game/level-1` after configuring base but saw NO game canvas — no astronaut, no buildings, nothing.

**Root Cause:** The MainGameScene was being initialized twice (once by Phaser config auto-start, once manually via `scene.start()`), causing initialization conflicts.

**Fix Applied:**
1. Fixed scene initialization to check if scene is already active before restarting
2. Corrected `scene.start()` API call (scene key as first param, data as second)
3. Added comprehensive debug logging throughout initialization chain
4. Made canvas container background visible for debugging
5. Added render options to Phaser config

## How to Test

### Step 1: Start the dev server
```bash
npm run dev
```

### Step 2: Navigate through the game setup flow

1. Open `http://localhost:5173/` in your browser
2. Open DevTools Console (F12 or Ctrl+Shift+J / Cmd+Option+J)
3. Click through the setup screens:
   - **Onboarding** → Click "Begin Journey"
   - **Planet Selection** → Select Moon or Mars
   - **Crew Selection** → Select crew size (e.g., 4 members)
   - **Base Configuration** → Configure systems and click "Launch Mission"

4. You should now be on either:
   - `/mission` (the Space+ Mission Control dashboard)
   - OR `/game/level-1` (the Phaser gameplay screen)

### Step 3: Check for game canvas visibility

**On `/game/level-1` or any `/game/:levelId` route:**

✅ **You SHOULD see:**
- A dark space background (navy `#0A0E1A` for Moon, dark red `#1a0808` for Mars)
- A gray lunar ground OR rust-colored Martian ground (tiled)
- Your **astronaut character** (white helmet, blue suit) in the center
- Several **habitat buildings** (gray domes, solar panels, satellite dish, generators)
- **Resource HUD** in top-left corner (Oxygen, Water, Food, Power bars)
- **Mission alert** in top-right corner
- **Virtual joystick** hint in bottom-left
- **Action bar** at bottom (Next Day button, mission title, controls)

✅ **Console logs you SHOULD see:**
```
[GameplayScreen] Mount — canvasRef.current: <div>...</div>
[GameplayScreen] Dimensions: 1920 x 1080
[GameplayScreen] Planet type: moon
[GameplayScreen] Creating Phaser game...
[createPhaserConfig] Creating config for parent: <div>...</div>
[createPhaserConfig] Window dimensions: 1920 x 1080
[createPhaserConfig] Planet ID: moon
[GameplayScreen] Config: {...}
[GameplayScreen] Game instance created: Game {...}
[GameplayScreen] Phaser version: 3.90.0
[GameplayScreen] Phaser "ready" event fired
[GameplayScreen] MainGameScene instance: MainGameScene {...}
[GameplayScreen] Scene found — checking if active
[GameplayScreen] Scene active? true
[GameplayScreen] Restarting scene with planetId: moon
[MainGameScene] preload() started
[MainGameScene] preload() complete — all textures generated
[MainGameScene] create() called with data: { planetId: 'moon' }
[MainGameScene] Planet ID set to: moon
[MainGameScene] Ground texture: moon-ground
[MainGameScene] World bounds: Rectangle {...}
[MainGameScene] Buildings created: 9
[MainGameScene] Player sprite created: Sprite {...}
[MainGameScene] Player position: 800 800
[MainGameScene] Camera: { width: ..., height: ..., zoom: 1.2, ... }
[MainGameScene] Scene setup complete — signaling ready in 100ms
[MainGameScene] Emitting scene-ready event
```

### Step 4: Test player movement

1. Press **WASD** or **Arrow keys**
   - ✅ Astronaut should move in all 4 directions
   - ✅ Camera should follow the astronaut smoothly
   - ✅ Astronaut should bob/tilt slightly while walking

2. Walk near a building (within ~90 pixels)
   - ✅ An **"Interact with..."** prompt should appear at the bottom center
   - ✅ Press **E** key
   - ✅ A **building panel modal** should open showing resource info

3. Click **Next Day** button
   - ✅ Resource bars should decrease slightly
   - ✅ Mission day counter should increment

### Step 5: Test alternate routes

Try navigating directly to game routes via URL bar:
- `http://localhost:5173/game/level-1`
- `http://localhost:5173/game/level-2`
- `http://localhost:5173/intro/level-1`

All should render the game canvas (or cinematic intro).

## What to Report

### ✅ If the fix WORKED:
Report: "Game canvas is now visible. I can see the astronaut, buildings, and move with WASD keys."

### ❌ If you still see NO game canvas:

**Check 1:** Open DevTools Console — do you see the debug logs listed above?
- If YES → Report which logs appear and which are missing
- If NO → Report "No console logs appear at all"

**Check 2:** Right-click the page → Inspect → Elements tab
- Find the `<div ref={canvasRef}>` element
- Does it have a `<canvas>` child element inside it?
- What is the canvas width/height?
- Screenshot the Elements tab and send it

**Check 3:** Check for errors in Console
- Red error messages?
- Yellow warnings?
- Copy/paste the full error text

**Check 4:** Browser/Device info
- Browser name and version (e.g., Chrome 131, Firefox 115, Safari 17)
- Operating system (Windows 11, macOS Sonoma, Ubuntu 24.04)
- Screen resolution (e.g., 1920x1080)

## Emergency Fallback Plan

If Phaser still fails to render after all debugging, we have a **CSS-only fallback** ready to implement:
- Replace the Phaser canvas with a CSS Grid top-down map
- Show buildings as interactive cards in a spatial layout
- Player "moves" by clicking buildings (no WASD, just click-to-interact)
- All simulation logic stays the same

This gives a playable V1 even without Phaser/WebGL.

---

**Last updated:** 2026-11-05  
**Commits:** 493fd45 (debug logging) + 335f7c6 (scene init fix)
