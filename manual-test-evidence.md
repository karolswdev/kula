# TC-8.1 Model Normalization Test Evidence

## Test Execution Steps

1. Start local server:
   ```bash
   python3 -m http.server 8080
   ```

2. Open browser to: http://localhost:8080/test-model-normalization.html

3. Wait for all tests to complete (5 models will be tested)

4. Verify results show model dimensions

5. Take screenshot using the "Save Screenshot Evidence" button

6. Move screenshot to: `evidence/phase-8/story-8.1/model-normalization-proof.png`

## Expected Results

All models should show dimensions close to 4x4x4 Three.js units (±0.01 tolerance).

## Test Implementation

The test loads actual GLB models and measures their bounding boxes using Three.js Box3.setFromObject(). This provides accurate real-world dimensions of the loaded models, verifying they are properly normalized for the grid system.

The test visualizes:
- The loaded model
- A wireframe box showing the expected 4x4x4 grid unit
- A grid helper showing scale reference
- Detailed dimension measurements for each model

## Models Tested

1. Rock Medium.glb (standard_platform)
2. Cube Bricks.glb (brick_wall)  
3. Coin.glb (collectible)
4. Rock Small.glb
5. Tree Dead.glb