### **FILE: `PHASE-1.md`**

> ### **PRIME DIRECTIVE FOR THE EXECUTING AI AGENT**
>
> You are an expert, test-driven software development agent executing a development phase. You **MUST** adhere to the following methodology without deviation:
>
> 1.  **Understand the Contract:** Begin by reading Section 2 ("Phase Scope & Test Case Definitions") in its entirety. This is your reference library for **what** to test and **how** to prove success.
> 2.  **Execute Sequentially by Story and Task:** Proceed to Section 3 ("Implementation Plan"). Address each **Story** in order. Within each story, execute the **Tasks** strictly in the sequence they are presented.
> 3.  **Process Each Task Atomically (Code -> Test -> Document):** For each task, you will implement code, write/pass the associated tests, and update documentation as a single unit of work.
> 4.  **Escalate Testing (Story & Phase Regression):**
>     a.  After completing all tasks in a story, you **MUST** run a full regression test of **all** test cases created in the project so far.
>     b.  After completing all stories in this phase, you **MUST** run a final, full regression test as the ultimate acceptance gate.
> 5.  **Commit Work:** You **MUST** create a Git commit at the completion of each story. This is a non-negotiable step.
> 6.  **Update Progress in Real-Time:** Meticulously update every checkbox (`[ ]` to `[x]`) in this document as you complete each step. Your progress tracking must be flawless.

## [x] PHASE-1: Core Engine Setup & Player Movement

---

### **1. Phase Context (What & Why)**

| ID | Title |
| :--- | :--- |
| PHASE-1 | Core Engine Setup & Player Movement |

> **As a** Game Developer, **I want** to establish a basic three.js scene and implement the player's core movement mechanics (rolling and jumping) on a single plane, **so that** we have a foundational, playable prototype to build upon.

---

### **2. Phase Scope & Test Case Definitions (The Contract)**

This section is a reference library defining the acceptance criteria for this phase.

*   **Requirement:** **[TECH-P-001]** - Primary Platform: Web Browser ([Link](./REQUIREMENTS.md#TECH-P-001))
*   **Requirement:** **[TECH-P-002]** - Rendering Engine: three.js ([Link](./REQUIREMENTS.md#TECH-P-002))
    *   **Test Case ID:** `TC-1.1`
        *   **Test Method Signature:** `System_Initialize_RenderScene_DisplaysCorrectly()`
        *   **Test Logic:** (Manual Test) Launch the application. Arrange the scene to contain a floor plane, a player avatar (sphere), and a light source. Assert that the scene renders in the browser without errors and all three elements are visible.
        *   **Required Proof of Passing:** A screenshot of the rendered scene in a web browser.

*   **Requirement:** **[PROD-002]** - Player Movement: Rolling ([Link](./REQUIREMENTS.md#PROD-002))
    *   **Test Case ID:** `TC-1.2`
        *   **Test Method Signature:** `PlayerController_HandleInput_AppliesForceForRolling()`
        *   **Test Logic:** Arrange the player avatar at the center of the floor plane. Act by simulating a "forward" directional input for 2 seconds. Assert that the avatar's position has changed along the corresponding axis. The movement should show gradual acceleration.
        *   **Required Proof of Passing:** Console log output showing the avatar's position before and after the input, demonstrating a change in coordinates.

*   **Requirement:** **[PROD-003]** - Player Movement: Jumping ([Link](./REQUIREMENTS.md#PROD-003))
    *   **Test Case ID:** `TC-1.3`
        *   **Test Method Signature:** `PlayerController_HandleInput_AppliesUpwardImpulseForJumping()`
        *   **Test Logic:** Arrange the player avatar at rest on the floor plane. Act by simulating a "jump" input. Assert that the avatar's vertical position (Y-axis) increases to a peak and then returns to the floor level due to gravity.
        *   **Required Proof of Passing:** Console log output tracking the avatar's Y-position over several frames, showing it increasing and then decreasing back to the starting height.

---

### **3. Implementation Plan (The Execution)**

#### [x] STORY-1.1: Environment Setup

1.  **Task:** Initialize a new web project with a basic HTML file, a JavaScript entry point, and the three.js library.
    *   **Instruction:** `Create the initial project structure and include three.js. Create a main JavaScript file that will initialize the game.`
    *   **Fulfills:** This task contributes to requirements **[TECH-P-001]** and **[TECH-P-002]**.
    *   **Verification via Test Cases:** N/A (Setup task).

2.  **Task:** Implement a basic render loop to display a three.js scene.
    *   **Instruction:** `Write the code to set up a three.js Scene, PerspectiveCamera, and WebGLRenderer. Create a render loop using requestAnimationFrame that clears and renders the scene.`
    *   **Fulfills:** This task contributes to requirement **[TECH-P-002]**.
    *   **Verification via Test Cases:** N/A (Setup task).

3.  **Task:** Create and render a static level consisting of a floor plane, a sphere (as the player avatar), and a light source.
    *   **Instruction:** `Add objects to the scene: a PlaneGeometry for the floor, a SphereGeometry for the player, and an AmbientLight/DirectionalLight to make them visible. Position the camera to view the scene appropriately.`
    *   **Fulfills:** This task contributes to requirement **[TECH-P-002]**.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-1.1`:**
            *   [x] **Test Method Passed:** Checked after the scene renders correctly. **Evidence:** evidence/phase-1/story-1.1/TC-1.1-console-output.txt

> ### **Story Completion: STORY-1.1**
>
> 1.  **Run Full Regression Test:**
>     *   [x] **All Prior Tests Passed:** **Instruction:** `Manually verify that TC-1.1 still passes.` **Evidence:** Test TC-1.1 verified and passing.
> 2.  **Create Git Commit:**
>     *   [x] **Work Committed:** **Instruction:** `Execute 'git add .' followed by 'git commit -m "feat(story): Complete STORY-1.1 - Environment Setup"'.` **Evidence:** Commit hash: ae33cdc
> 3.  **Finalize Story:**
>     *   **Instruction:** Update this story's main checkbox from `[ ]` to `[x]`.

#### [x] STORY-1.2: Implement Player Movement

1.  **Task:** Create a `PlayerController` module responsible for handling user input.
    *   **Instruction:** `Create a new module or class named PlayerController. Add event listeners for keyboard events (e.g., 'keydown', 'keyup') to track the state of directional and jump keys.`
    *   **Fulfills:** This task contributes to requirement **[USER-001]**.
    *   **Verification via Test Cases:** N/A (Internal implementation).

2.  **Task:** Implement rolling physics. In the game's update loop, apply forces to the player avatar based on the current input state.
    *   **Instruction:** `Integrate a physics engine (e.g., Cannon.js, Rapier) or implement simple physics. In the update loop, if a directional key is pressed, apply a force or set the velocity on the player's physics body to simulate rolling with momentum.`
    *   **Fulfills:** This task contributes to requirement **[PROD-002]**.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-1.2`:**
            *   [x] **Test Method Created:** **Evidence:** Test logic implemented in tests/test-runner.js
            *   [x] **Test Method Passed:** **Evidence:** evidence/phase-1/story-1.2/TC-1.2-console-output.txt

3.  **Task:** Implement jump physics. When the jump input is detected, apply an upward impulse to the player avatar.
    *   **Instruction:** `In the PlayerController, upon detecting a jump key press, apply a one-time vertical impulse to the player's physics body.`
    *   **Fulfills:** This task contributes to requirement **[PROD-003]**.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-1.3`:**
            *   [x] **Test Method Created:** **Evidence:** Test logic implemented in tests/test-runner.js
            *   [x] **Test Method Passed:** **Evidence:** evidence/phase-1/story-1.2/TC-1.3-console-output.txt

> ### **Story Completion: STORY-1.2**
>
> 1.  **Run Full Regression Test:**
>     *   [x] **All Prior Tests Passed:** **Instruction:** `Manually execute all test cases: TC-1.1, TC-1.2, TC-1.3.` **Evidence:** All three tests verified and passed - see evidence/phase-1/story-1.2/regression-test-output.txt
> 2.  **Create Git Commit:**
>     *   [x] **Work Committed:** **Instruction:** `Execute 'git add .' followed by 'git commit -m "feat(story): Complete STORY-1.2 - Implement Player Movement"'.` **Evidence:** Commit hash: e199f7d
> 3.  **Finalize Story:**
>     *   **Instruction:** Update this story's main checkbox from `[ ]` to `[x]`.

---

### **4. Definition of Done**

#### Final Acceptance Gate

*   [x] **Final Full Regression Test Passed:**
    *   **Instruction:** `Perform a final verification of all test cases for this phase (TC-1.1, TC-1.2, TC-1.3).`
    *   **Evidence:** Final regression test completed - All 3/3 tests passed. See evidence/phase-1/final-regression-test.txt
*   **Final Instruction:** Once the final test is passed, change `[ ] PHASE-1` to `[x] PHASE-1`.