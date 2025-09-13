### **FILE: `PHASE-3.md`**

> ### **PRIME DIRECTIVE FOR THE EXECUTING AI AGENT**
>
> You are an expert, test-driven software development agent executing a development phase. You **MUST** adhere to the following methodology without deviation... *(omitted for brevity, same as Phase 1)*

## [ ] PHASE-3: Level Objectives & Core Gameplay Loop

---

### **1. Phase Context (What & Why)**

| ID | Title |
| :--- | :--- |
| PHASE-3 | Level Objectives & Core Gameplay Loop |

> **As a** Game Developer, **I want** to implement a data-driven level loader, the primary objectives of keys and an exit, and the main failure state of falling, **so that** we have a complete, self-contained gameplay loop.

---

### **2. Phase Scope & Test Case Definitions (The Contract)**

*   **Requirement:** **[ARCH-002]** - Data-Driven Levels ([Link](./REQUIREMENTS.md#ARCH-002))
    *   **Test Case ID:** `TC-3.1`
        *   **Test Method Signature:** `LevelManager_LoadLevel_CreatesEntitiesFromData()`
        *   **Test Logic:** Arrange a simple level definition file (e.g., JSON) that specifies the position of one platform and one key. Act by calling a `LevelManager.load(levelData)` function. Assert that a platform and a key object are created and rendered in the scene at the specified coordinates.
        *   **Required Proof of Passing:** A screenshot of the rendered level that matches the layout in the JSON file, and console logs confirming the creation of the specified entities.

*   **Requirement:** **[PROD-004]** - Level Objective: Key Collection ([Link](./REQUIREMENTS.md#PROD-004))
    *   **Test Case ID:** `TC-3.2`
        *   **Test Method Signature:** `PlayerController_OnCollisionWithKey_CollectsKeyAndRemovesIt()`
        *   **Test Logic:** Arrange a level with one key. Act by rolling the player avatar into the key. Assert that the key object is removed from the scene and a game state variable (e.g., `gameState.keysCollected`) is incremented.
        *   **Required Proof of Passing:** A screen recording (GIF) showing the player rolling into the key, the key disappearing, and a console log confirming `keysCollected` changed from 0 to 1.

*   **Requirement:** **[PROD-005]** - Level Objective: Exit Portal ([Link](./REQUIREMENTS.md#PROD-005))
    *   **Test Case ID:** `TC-3.3`
        *   **Test Method Signature:** `ExitPortal_OnKeyCollection_UnlocksAndCompletesLevel()`
        *   **Test Logic:** Arrange a level with one key and one locked exit portal. Act by first collecting the key, then rolling the player into the exit portal. Assert that the portal visually changes to an "unlocked" state after the key is collected, and that colliding with the unlocked portal triggers a "Level Complete" message.
        *   **Required Proof of Passing:** Screen recording (GIF) showing the key being collected, the portal changing appearance, and a "Level Complete" message appearing in the console after the player enters it.

*   **Requirement:** **[PROD-006]** - Failure Condition: Falling ([Link](./REQUIREMENTS.md#PROD-006))
    *   **Test Case ID:** `TC-3.4`
        *   **Test Method Signature:** `PlayerController_OnFall_TriggersLifeLostAndResets()`
        *   **Test Logic:** Arrange the player at the edge of a platform. Act by rolling the player off the edge into the void. Assert that a "Life Lost" event is triggered and the player avatar is reset to its starting position.
        *   **Required Proof of Passing:** Console log showing a "Life Lost" message and the player's position being reset after falling.

---

### **3. Implementation Plan (The Execution)**

#### [ ] STORY-3.1: Data-Driven Levels

1.  **Task:** Design a simple data format (JSON) for defining levels.
    *   **Instruction:** `Define a JSON structure that can represent a level. It should include arrays for platforms, keys, the exit, and the player start position, with each object containing position and type information.`
    *   **Fulfills:** This task contributes to requirement **[ARCH-002]**.
    *   **Verification via Test Cases:** N/A (Design task).

2.  **Task:** Implement a `LevelManager` that parses the level file and dynamically builds the scene.
    *   **Instruction:** `Create a LevelManager module with a load function. This function should fetch and parse the JSON file, then iterate through the data to create and place three.js meshes and physics bodies for all level elements.`
    *   **Fulfills:** This task contributes to requirement **[ARCH-002]**.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-3.1`:**
            *   [ ] **Test Method Created:** **Evidence:** Provide the test JSON file and the code for the test logic.
            *   [ ] **Test Method Passed:** **Evidence:** Provide the screenshot and console logs proving the level was loaded correctly.

> ### **Story Completion: STORY-3.1**
>
> 1.  **Run Full Regression Test:**
>     *   [ ] **All Prior Tests Passed:** **Instruction:** `Run all tests from previous phases and TC-3.1.` **Evidence:** Summary statement confirming all tests passed.
> 2.  **Create Git Commit:**
>     *   [ ] **Work Committed:** **Instruction:** `Execute 'git add .' followed by 'git commit -m "feat(story): Complete STORY-3.1 - Data-Driven Levels"'.` **Evidence:** Provide the full commit hash.
> 3.  **Finalize Story:**
>     *   **Instruction:** Update this story's main checkbox from `[ ]` to `[x]`.

#### [ ] STORY-3.2: Implement Objectives and Failure

1.  **Task:** Implement key collection logic.
    *   **Instruction:** `Add collision logic that detects when the player's physics body makes contact with a key's physics body. On collision, remove the key from the scene and update the game state.`
    *   **Fulfills:** This task contributes to requirement **[PROD-004]**.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-3.2`:**
            *   [ ] **Test Method Created:** **Evidence:** Provide the code for the test logic.
            *   [ ] **Test Method Passed:** **Evidence:** Provide the GIF and console log proving key collection.

2.  **Task:** Implement the exit portal logic.
    *   **Instruction:** `Create an ExitPortal entity. It should check the game state each frame. If all keys are collected, it should change its visual appearance (e.g., change color). Add collision logic that triggers a level complete state if the player touches it while it's unlocked.`
    *   **Fulfills:** This task contributes to requirement **[PROD-005]**.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-3.3`:**
            *   [ ] **Test Method Created:** **Evidence:** Provide the code for the test logic.
            *   [ ] **Test Method Passed:** **Evidence:** Provide the GIF and console log proving the exit portal works.

3.  **Task:** Implement the fall detection and player reset logic.
    *   **Instruction:** `In the update loop, check the player's position. If its Y-coordinate falls below a certain threshold, trigger a "life lost" event. This event should reset the player's physics body to the level's defined start position.`
    *   **Fulfills:** This task contributes to requirement **[PROD-006]**.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-3.4`:**
            *   [ ] **Test Method Created:** **Evidence:** Provide the code for the test logic.
            *   [ ] **Test Method Passed:** **Evidence:** Provide the console log proving the player reset after falling.

> ### **Story Completion: STORY-3.2**
>
> 1.  **Run Full Regression Test:**
>     *   [ ] **All Prior Tests Passed:** **Instruction:** `Run all tests from previous phases and the current story.` **Evidence:** Summary statement confirming all tests passed.
> 2.  **Create Git Commit:**
>     *   [ ] **Work Committed:** **Instruction:** `Execute 'git add .' followed by 'git commit -m "feat(story): Complete STORY-3.2 - Implement Objectives and Failure"'.` **Evidence:** Provide the full commit hash.
> 3.  **Finalize Story:**
>     *   **Instruction:** Update this story's main checkbox from `[ ]` to `[x]`.

---

### **4. Definition of Done**

#### Final Acceptance Gate

*   [ ] **Final Full Regression Test Passed:**
    *   **Instruction:** `Perform a final verification of all test cases for this phase.`
    *   **Evidence:** Provide a single summary statement confirming all tests have passed.
*   **Final Instruction:** Once the final test is passed, change `[ ] PHASE-3` to `[x] PHASE-3`.
