> ### **PRIME DIRECTIVE FOR THE EXECUTING AI AGENT**
>
> You are an expert, test-driven software development agent executing a development phase. You **MUST** adhere to the following methodology without deviation... *(omitted for brevity, same as Phase 1)*

## [ ] PHASE-5: Hazards, Polish, and Advanced Platforms

---

### **1. Phase Context (What & Why)**

| ID | Title |
| :--- | :--- |
| PHASE-5 | Hazards, Polish, and Advanced Platforms |

> **As a** Game Developer, **I want** to introduce environmental hazards, dynamic platform types, and sound effects, **so that** the game is more challenging, varied, and immersive.

---

### **2. Phase Scope & Test Case Definitions (The Contract)**

*   **Requirement:** **[PROD-007]** - Failure Condition: Hazards ([Link](./REQUIREMENTS.md#PROD-007))
    *   **Test Case ID:** `TC-5.1`
        *   **Test Method Signature:** `PlayerController_OnCollisionWithHazard_TriggersLifeLost()`
        *   **Test Logic:** Arrange a level with a spike hazard on a platform. Act by rolling the player avatar over the spikes. Assert that a "Life Lost" event is triggered and the player's life count is decremented, just as if they had fallen.
        *   **Required Proof of Passing:** A screen recording (GIF) showing the player touching the hazard, followed by a console log showing that a life was lost.

*   **Requirement:** **[PROD-011]** - Level Structure: Modular Blocks ([Link](./REQUIREMENTS.md#PROD-011))
    *   **Test Case ID:** `TC-5.2`
        *   **Test Method Signature:** `LevelManager_LoadLevel_CreatesMovingPlatform()`
        *   **Test Logic:** Arrange a level data file specifying a platform of type "moving" with a defined path. Act by loading the level. Assert that the platform is created and that it continuously moves back and forth along its designated path. The player must be able to roll onto it and be carried by it.
        *   **Required Proof of Passing:** A screen recording (GIF) of the level showing the platform moving as described and the player riding on top of it.

*   **Requirement:** **[PROD-012]** - Audio: Sound Effects ([Link](./REQUIREMENTS.md#PROD-012))
    *   **Test Case ID:** `TC-5.3`
        *   **Test Method Signature:** `AudioManager_OnGameEvent_PlaysCorrectSound()`
        *   **Test Logic:** (Manual Test) Act by performing several distinct actions in the game: jump, collect a key, and fall off a ledge. Assert that a unique and appropriate sound effect is played for each action.
        *   **Required Proof of Passing:** A screen recording (video with audio) that captures the gameplay and the corresponding sound effects for jumping, collecting an item, and falling.

---

### **3. Implementation Plan (The Execution)**

#### [ ] STORY-5.1: Environmental Hazards & Platforms

1.  **Task:** Add hazards (e.g., spikes) to the level loader and game logic.
    *   **Instruction:** `Update the level JSON format to support hazard objects. In the LevelManager, create meshes for these hazards. Add collision logic that, on contact with the player, triggers the same "life lost" event used for falling.`
    *   **Fulfills:** This task contributes to requirement **[PROD-007]**.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-5.1`:**
            *   [ ] **Test Method Created:** **Evidence:** Provide the code for the test logic.
            *   [ ] **Test Method Passed:** **Evidence:** Provide the GIF and console log showing the hazard works.

2.  **Task:** Implement moving platforms.
    *   **Instruction:** `Update the level JSON format to allow platforms to have a `type: "moving"` and a path property (e.g., an array of waypoints). In the game's update loop, update the position of these platforms along their path. Ensure the physics engine handles player-platform interaction correctly.`
    *   **Fulfills:** This task contributes to requirement **[PROD-011]**.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-5.2`:**
            *   [ ] **Test Method Created:** **Evidence:** Provide the test JSON and describe the test steps.
            *   [ ] **Test Method Passed:** **Evidence:** Provide the GIF showing the moving platform in action.

> ### **Story Completion: STORY-5.1**
>
> 1.  **Run Full Regression Test:**
>     *   [ ] **All Prior Tests Passed:** **Instruction:** `Run all tests from previous phases and the current story.` **Evidence:** Summary statement confirming all tests passed.
> 2.  **Create Git Commit:**
>     *   [ ] **Work Committed:** **Instruction:** `Execute 'git add .' followed by 'git commit -m "feat(story): Complete STORY-5.1 - Environmental Hazards & Platforms"'.` **Evidence:** Provide the full commit hash.
> 3.  **Finalize Story:**
>     *   **Instruction:** Update this story's main checkbox from `[ ]` to `[x]`.

#### [ ] STORY-5.2: Audio Polish

1.  **Task:** Create an `AudioManager` to load and play sounds.
    *   **Instruction:** `Create a simple AudioManager module. It should have methods like `loadSounds()` to preload audio files (e.g., .mp3, .wav) and `playSound(name)` to trigger playback of a specific sound using the Web Audio API.`
    *   **Fulfills:** This task contributes to requirement **[PROD-012]**.
    *   **Verification via Test Cases:** N/A (Setup task).

2.  **Task:** Hook game events to the AudioManager.
    *   **Instruction:** `In the existing game logic, call the `AudioManager.playSound()` method at appropriate times. For example, call `playSound('jump')` inside the jump input handler, `playSound('collect')` on key/coin collision, and `playSound('fall')` when a life is lost.`
    *   **Fulfills:** This task contributes to requirement **[PROD-012]**.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-5.3`:**
            *   [ ] **Test Method Created:** **Evidence:** Describe the manual test steps.
            *   [ ] **Test Method Passed:** **Evidence:** Provide the video with audio demonstrating the sound effects.

> ### **Story Completion: STORY-5.2**
>
> 1.  **Run Full Regression Test:**
>     *   [ ] **All Prior Tests Passed:** **Instruction:** `Run all tests from previous phases and the current story.` **Evidence:** Summary statement confirming all tests passed.
> 2.  **Create Git Commit:**
>     *   [ ] **Work Committed:** **Instruction:** `Execute 'git add .' followed by 'git commit -m "feat(story): Complete STORY-5.2 - Audio Polish"'.` **Evidence:** Provide the full commit hash.
> 3.  **Finalize Story:**
>     *   **Instruction:** Update this story's main checkbox from `[ ]` to `[x]`.

---

### **4. Definition of Done**

#### Final Acceptance Gate

*   [ ] **Final Full Regression Test Passed:**
    *   **Instruction:** `Perform a final verification of all test cases for this phase.`
    *   **Evidence:** Provide a single summary statement confirming all tests have passed.
*   **Final Instruction:** Once the final test is passed, change `[ ] PHASE-5` to `[x] PHASE-5`.