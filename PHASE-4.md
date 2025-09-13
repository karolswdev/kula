### **FILE: `PHASE-4.md`**

> ### **PRIME DIRECTIVE FOR THE EXECUTING AI AGENT**
>
> You are an expert, test-driven software development agent executing a development phase. You **MUST** adhere to the following methodology without deviation... *(omitted for brevity, same as Phase 1)*

## [ ] PHASE-4: Game Systems, UI & Progression

---

### **1. Phase Context (What & Why)**

| ID | Title |
| :--- | :--- |
| PHASE-4 | Game Systems, UI & Progression |

> **As a** Game Developer, **I want** to implement a lives system, scoring, and a HUD, **so that** the core mechanics are wrapped in a complete and compelling game structure.

---

### **2. Phase Scope & Test Case Definitions (The Contract)**

*   **Requirement:** **[PROD-008]** - Progression: Lives System ([Link](./REQUIREMENTS.md#PROD-008))
    *   **Test Case ID:** `TC-4.1`
        *   **Test Method Signature:** `GameState_OnLifeLost_DecrementsLivesAndTriggersGameOver()`
        *   **Test Logic:** Arrange the game state with 1 life remaining. Act by making the player fall into the void. Assert that the life count becomes 0 and a "Game Over" state is triggered.
        *   **Required Proof of Passing:** Console logs showing `lives: 1` before the fall, `lives: 0` after the fall, and a final "Game Over" message.

*   **Requirement:** **[PROD-010]** - Collectibles: Scoring ([Link](./REQUIREMENTS.md#PROD-010))
    *   **Test Case ID:** `TC-4.2`
        *   **Test Method Signature:** `PlayerController_OnCollisionWithCoin_IncreasesScore()`
        *   **Test Logic:** Arrange a level with a coin collectible. The initial score is 0. Act by rolling the player into the coin. Assert that the coin is removed from the scene and the game's score is increased.
        *   **Required Proof of Passing:** Console logs showing `score: 0` before collection and `score: 100` (or some value) after collection.

*   **Requirement:** **[USER-002]** - UI: Heads-Up Display (HUD) ([Link](./REQUIREMENTS.md#USER-002))
    *   **Test Case ID:** `TC-4.3`
        *   **Test Method Signature:** `UIManager_OnGameStateChange_UpdatesHUD()`
        *   **Test Logic:** (Manual Test) Arrange a level with 1 key, 1 coin, and 3 lives. Act by playing the game: collect the coin, then collect the key, then fall off once. Assert that the HUD correctly displays the score updating, the key counter updating, and the lives counter decrementing in real-time.
        *   **Required Proof of Passing:** A screen recording (GIF) demonstrating the HUD elements (Score, Keys, Lives) updating correctly in response to the gameplay events.

---

### **3. Implementation Plan (The Execution)**

#### [ ] STORY-4.1: Implement Lives and Scoring

1.  **Task:** Integrate a global game state manager to track lives and score.
    *   **Instruction:** `Create a central GameState object or module that holds the current `lives`, `score`, and `keysCollected`. Initialize it at the start of a level.`
    *   **Fulfills:** This task contributes to requirements **[PROD-008]** and **[PROD-010]**.
    *   **Verification via Test Cases:** N/A (Setup task).

2.  **Task:** Connect the "life lost" event from Phase 3 to the GameState.
    *   **Instruction:** `Modify the fall detection logic. When a life is lost, it must now call a function on the GameState manager to decrement the `lives` count. Add logic to the manager to check if `lives` has reached 0, and if so, trigger a game over.`
    *   **Fulfills:** This task contributes to requirement **[PROD-008]**.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-4.1`:**
            *   [ ] **Test Method Created:** **Evidence:** Provide the code for the test logic.
            *   [ ] **Test Method Passed:** **Evidence:** Provide the console logs proving the game over sequence.

3.  **Task:** Add score collectibles (e.g., coins) to the level data and implement collection logic.
    *   **Instruction:** `Update the level JSON format to include an array of coin positions. In the LevelManager, spawn these coins. Add collision logic similar to the keys, but on collection, call a function on the GameState manager to increase the `score`.`
    *   **Fulfills:** This task contributes to requirement **[PROD-010]**.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-4.2`:**
            *   [ ] **Test Method Created:** **Evidence:** Provide the code for the test logic.
            *   [ ] **Test Method Passed:** **Evidence:** Provide the console logs proving the score increased.

> ### **Story Completion: STORY-4.1**
>
> 1.  **Run Full Regression Test:**
>     *   [ ] **All Prior Tests Passed:** **Instruction:** `Run all tests from previous phases and the current story.` **Evidence:** Summary statement confirming all tests passed.
> 2.  **Create Git Commit:**
>     *   [ ] **Work Committed:** **Instruction:** `Execute 'git add .' followed by 'git commit -m "feat(story): Complete STORY-4.1 - Implement Lives and Scoring"'.` **Evidence:** Provide the full commit hash.
> 3.  **Finalize Story:**
>     *   **Instruction:** Update this story's main checkbox from `[ ]` to `[x]`.

#### [ ] STORY-4.2: Develop the User Interface

1.  **Task:** Create an HTML overlay for the HUD.
    *   **Instruction:** `In your main HTML file, create a div element to act as the HUD container. Inside it, add elements with unique IDs for displaying the score, lives, and key count (e.g., `<div id="score"></div>`). Style it with CSS to position it correctly over the game canvas.`
    *   **Fulfills:** This task contributes to requirement **[USER-002]**.
    *   **Verification via Test Cases:** N/A (Setup task).

2.  **Task:** Implement a `UIManager` to synchronize the HUD with the game state.
    *   **Instruction:** `Create a UIManager module. In the game's update loop, the UIManager should read the values from the GameState object (`score`, `lives`, etc.) and update the `innerText` of the corresponding HTML elements. Ensure this is done efficiently.`
    *   **Fulfills:** This task contributes to requirement **[USER-002]**.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-4.3`:**
            *   [ ] **Test Method Created:** **Evidence:** Describe the manual test steps.
            *   [ ] **Test Method Passed:** **Evidence:** Provide the GIF demonstrating the HUD updating in real-time.

> ### **Story Completion: STORY-4.2**
>
> 1.  **Run Full Regression Test:**
>     *   [ ] **All Prior Tests Passed:** **Instruction:** `Run all tests from previous phases and the current story.` **Evidence:** Summary statement confirming all tests passed.
> 2.  **Create Git Commit:**
>     *   [ ] **Work Committed:** **Instruction:** `Execute 'git add .' followed by 'git commit -m "feat(story): Complete STORY-4.2 - Develop the User Interface"'.` **Evidence:** Provide the full commit hash.
> 3.  **Finalize Story:**
>     *   **Instruction:** Update this story's main checkbox from `[ ]` to `[x]`.

---

### **4. Definition of Done**

#### Final Acceptance Gate

*   [ ] **Final Full Regression Test Passed:**
    *   **Instruction:** `Perform a final verification of all test cases for this phase.`
    *   **Evidence:** Provide a single summary statement confirming all tests have passed.
*   **Final Instruction:** Once the final test is passed, change `[ ] PHASE-4` to `[x] PHASE-4`.
