# Manual Test Documentation for TC-10.3 and TC-10.4

## Test Environment Setup

1. Start a local HTTP server in the project directory:
   ```bash
   python3 -m http.server 8080
   ```

2. Open your browser and navigate to:
   - Level Editor: `http://localhost:8080/editor.html`
   - Test Suite: `http://localhost:8080/test-level-editor.html`

## TC-10.3: LevelEditor_OnGridClick_AddsBlockToLevelData

### Test Objective
Verify that clicking on a grid cell adds a block to the level's internal JSON data structure.

### Test Steps

1. **Open the Level Editor**
   - Navigate to `http://localhost:8080/editor.html`
   - Wait for the editor to fully load (loading screen disappears)

2. **Open Browser Console**
   - Press F12 to open Developer Tools
   - Switch to the Console tab

3. **Select a Block Type**
   - In the right panel, under "Block Palette"
   - Click on "Standard" (or any other block type)
   - The button should highlight in purple

4. **Place a Block**
   - Move your mouse over the grid
   - Note the coordinates shown in the top-left (e.g., "Grid: [3, 0, 3]")
   - Click on the grid at position [3, 0, 3]

5. **Verify Console Output**
   - Check the console for these messages:
     ```
     Block placed: standard_platform at {x: 3, y: 0, z: 3}
     Level data updated: {...}
     ```
   - The level data should show the new block in the blocks array

### Expected Result
- **BEFORE**: Level data shows empty or fewer blocks
- **AFTER**: Level data contains new entry:
  ```json
  {
    "type": "standard_platform",
    "at": [3, 0, 3]
  }
  ```

### Evidence
- Console logs showing before/after state
- Visual confirmation of block appearing in 3D view
- Block data present in JSON structure

## TC-10.4: LevelEditor_OnSave_GeneratesValidLevelJSON

### Test Objective
Verify that the editor generates valid, well-formed JSON that can be used in the game.

### Test Steps

1. **Create a Complete Level**
   - Place at least 4-5 platform blocks to form a path
   - Add decorations (optional): trees, bushes, flowers

2. **Add Required Objects**
   - Click "Player Start" button and place on the grid
   - Click "Key" button and place at least one key
   - Click "Exit" button and place the exit portal

3. **Configure Level Settings**
   - In the control panel, set:
     - Level Name: "Test Level TC-10.4"
     - Theme: "Verdant Ruins"
     - Grid Size: 10 (default)

4. **Generate JSON**
   - Click the "Generate JSON" button
   - A modal window should appear with the JSON

5. **Verify JSON Structure**
   The generated JSON should contain:
   ```json
   {
     "name": "Test Level TC-10.4",
     "theme": "verdant-ruins",
     "gridUnitSize": 4,
     "blocks": [
       // Array of placed blocks
     ],
     "player": {
       "spawn": [x, y, z],
       "lives": 3
     },
     "objectives": {
       "keys": [
         {
           "id": "key1",
           "at": [x, y, z]
         }
       ],
       "exit": {
         "at": [x, y, z]
       }
     },
     "collectibles": [],
     "decorations": [
       // Array of decorative elements
     ]
   }
   ```

6. **Test JSON Validity**
   - Click "Copy to Clipboard"
   - Paste into a JSON validator (e.g., jsonlint.com)
   - Verify no syntax errors

### Expected Result
- Valid JSON is generated
- All required fields are present
- Coordinates are integer values
- Structure matches game's level format

### Evidence
- Screenshot of generated JSON modal
- Console output showing:
  ```
  === TEST CASE TC-10.4: LevelEditor_OnSave_GeneratesValidLevelJSON ===
  Generated valid JSON for level:
  {complete JSON output}
  === END TC-10.4 ===
  ```

## Automated Test Execution

### Using the Test Suite Page

1. Navigate to `http://localhost:8080/test-level-editor.html`

2. **For TC-10.3:**
   - Click "Run Test TC-10.3"
   - Observe the test output
   - Status should change to "PASSED" (green)

3. **For TC-10.4:**
   - Click "Run Test TC-10.4"
   - Observe the test output
   - Generated JSON appears below
   - Status should change to "PASSED" (green)

## Validation Checklist

### TC-10.3 Pass Criteria
- [ ] Block placement triggers console log
- [ ] Level data shows before state
- [ ] Level data shows after state with new block
- [ ] Block appears at correct coordinates
- [ ] Block type matches selection

### TC-10.4 Pass Criteria
- [ ] JSON generation completes without errors
- [ ] JSON contains all required properties
- [ ] Player spawn is defined
- [ ] At least one key is present
- [ ] Exit location is defined
- [ ] Blocks array contains placed platforms
- [ ] JSON is syntactically valid
- [ ] JSON can be loaded back into editor

## Common Issues and Solutions

### Issue: Editor doesn't load
**Solution**: Ensure HTTP server is running and you're accessing via localhost, not file://

### Issue: Blocks don't appear when clicked
**Solution**: 
- Check that a block type is selected (highlighted in purple)
- Ensure "Place" tool is active
- Try clicking directly on grid lines

### Issue: JSON validation fails
**Solution**:
- Ensure level has required elements (spawn, key, exit)
- Check for duplicate keys or invalid coordinates
- Verify all coordinates are integers

## Test Result Summary

| Test Case | Status | Evidence |
|-----------|--------|----------|
| TC-10.3 | ✅ PASS | Console logs show block added to data structure |
| TC-10.4 | ✅ PASS | Valid JSON generated with all required fields |

## Notes

- The editor uses simplified box meshes for performance in the editor view
- Actual game will load proper GLB models based on block types
- Grid coordinates are integer-based for predictable placement
- The editor validates levels before JSON generation to ensure playability