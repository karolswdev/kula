# Manual Test Cases for Phase 11 - Story 11.1

## Test Case TC-11.1: Save and Load Functionality

**Test Method:** `LevelEditor_SaveAndLoad_PerfectlyRecreatesLevelState()`

### Test Steps:

1. Open the level editor at `/editor.html`
2. Create a simple level with the following:
   - Place 3-4 platform blocks at different positions
   - Set the player spawn point
   - Add at least one key
   - Set the exit point
3. Click the "Save to File" button
   - Verify: A `.json` file is downloaded with the level name
4. Click the "Clear Level" button and confirm
   - Verify: The editor is now empty
5. Click the "Load from File" button
6. Select the previously saved `.json` file
   - Verify: The level is perfectly restored with all blocks, spawn, keys, and exit in the same positions

### Expected Results:
- Level saves to a valid JSON file
- File can be loaded back into the editor
- All level elements are restored to their exact positions
- Console shows: "TEST CASE TC-11.1: Save functionality" and "TEST CASE TC-11.1: Load functionality"

### Evidence:
- Screenshot of original level before saving
- Screenshot of cleared editor
- Screenshot of restored level after loading
- Console logs showing test case execution

---

## Test Case TC-11.2: Editor Camera Controls

**Test Method:** `EditorControls_Camera_AllowsOrbitalAndPanMovement()`

### Test Steps:

1. Open the level editor at `/editor.html`
2. Test Orbit Control:
   - Right-click and drag the mouse
   - Verify: The camera orbits around the center of the grid
   - Console shows: "TEST CASE TC-11.2: Orbit control activated"
3. Test Pan Control:
   - Middle-click and drag the mouse
   - Verify: The camera and view pan across the grid
   - Console shows: "TEST CASE TC-11.2: Pan control activated"
4. Test Zoom Control:
   - Use the mouse scroll wheel
   - Verify: The view zooms in and out smoothly
   - Console shows: "TEST CASE TC-11.2: Zoom control used"

### Expected Results:
- Right-click + drag orbits the camera around the target
- Middle-click + drag pans the view
- Scroll wheel zooms in/out with limits (min: 10, max: 100 units)
- All controls are independent of the game camera
- Controls feel smooth and responsive with damping

### Evidence:
- Screen recording (GIF) showing orbit motion
- Screen recording (GIF) showing pan motion
- Screen recording (GIF) showing zoom motion
- Console logs confirming control activation

---

## Additional Verification: Visual Asset Palette

### Test Steps:

1. Open the level editor at `/editor.html`
2. Observe the Block Palette section
   - Verify: Each block type shows a 3D preview thumbnail
   - Verify: Thumbnails are rendered with appropriate colors/shapes
   - Verify: Block names are displayed below thumbnails

### Expected Results:
- Visual previews for all block types
- Platforms show as colored cubes
- Trees show trunk and leaves
- Flowers show stem and petals
- Mushrooms show stem and cap
- All thumbnails are clearly visible and distinguishable

### Evidence:
- Screenshot of the visual block palette
- Comparison with text-only palette (before)

---

## Test Execution Log

**Date:** [To be filled during testing]
**Tester:** [To be filled during testing]
**Browser:** [To be filled during testing]
**Results:** [To be filled during testing]

### TC-11.1 Results:
- [ ] Save functionality works
- [ ] Load functionality works
- [ ] Level state perfectly recreated
- [ ] Console logs present

### TC-11.2 Results:
- [ ] Orbit control works
- [ ] Pan control works
- [ ] Zoom control works
- [ ] Controls are smooth and responsive
- [ ] Console logs present

### Visual Palette Results:
- [ ] Thumbnails rendering correctly
- [ ] All block types have visual previews
- [ ] UI is clean and usable