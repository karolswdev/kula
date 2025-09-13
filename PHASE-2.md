### **FILE: `PHASE-2.md`**

> ### **PRIME DIRECTIVE FOR THE EXECUTING AI AGENT**
>
> You are an expert, test-driven software development agent executing a development phase. You **MUST** adhere to the following methodology without deviation... *(omitted for brevity, same as Phase 1)*

## [x] PHASE-2: The Gravity Flip

---

### **1. Phase Context (What & Why)**

| ID | Title |
| :--- | :--- |
| PHASE-2 | The Gravity Flip |

> **As a** Game Developer, **I want** to implement the core gravity reorientation mechanic and an automated camera system that follows it, **so that** the game's unique selling point is realized and playable.

---

### **2. Phase Scope & Test Case Definitions (The Contract)**

*   **Requirement:** **[PROD-001]** - Core Mechanic: Gravity Reorientation ([Link](./REQUIREMENTS.md#PROD-001))
    *   **Test Case ID:** `TC-2.1`
        *   **Test Method Signature:** `PhysicsManager_OnEdgeCross_ReorientsGravity()`
        *   **Test Logic:** Arrange a level with two perpendicular platforms (a floor and a wall). Act by rolling the player avatar from the floor plane over the edge onto the wall plane. Assert that the effective gravity direction changes from "down" (-Y) to "sideways" (-X or +X). The player should stick to the wall instead of falling.
        *   **Required Proof of Passing:** Console log output of the physics engine's gravity vector before and after crossing the edge, showing the change from (e.g.) `(0, -9.8, 0)` to `(-9.8, 0, 0)`.

*   **Requirement:** **[PROD-009]** - Camera System: Automated Tracking ([Link](./REQUIREMENTS.md#PROD-009))
    *   **Test Case ID:** `TC-2.2`
        *   **Test Method Signature:** `CameraController_OnGravityChange_SmoothlyRotatesToNewUp()`
        *   **Test Logic:** Using the same two-platform setup as `TC-2.1`, roll the player from the floor onto the wall. Assert that the camera smoothly rotates 90 degrees to align its "up" direction with the player's new "up," keeping the player centered and the new surface as the new "floor."
        *   **Required Proof of Passing:** A screen recording (GIF) demonstrating the smooth camera transition as the player moves from the floor to the wall.

---

### **3. Implementation Plan (The Execution)**

#### [x] STORY-2.1: Implement Gravity Reorientation

1.  **Task:** Design and create a test level with at least two perpendicular platforms.
    *   **Instruction:** `Modify the level creation logic to add a second, wall-like platform directly adjacent to the existing floor. Ensure their physics bodies are correctly positioned.`
    *   **Fulfills:** This task supports requirement **[PROD-001]**.
    *   **Verification via Test Cases:** N/A (Setup task).

2.  **Task:** Implement a mechanism to detect when the player crosses an edge onto a new surface.
    *   **Instruction:** `Implement a raycasting or collision detection solution. When the player avatar is near an edge, cast rays from it to detect adjacent surfaces. Identify the normal of the new surface upon successful contact.`
    *   **Fulfills:** This task contributes to requirement **[PROD-001]**.
    *   **Verification via Test Cases:** N/A (Internal implementation).

3.  **Task:** Create a `PhysicsManager` that can dynamically change the world's gravity vector.
    *   **Instruction:** `Abstract the physics world's gravity setting into a dedicated PhysicsManager. When the edge crossing logic detects a new surface, it must call a method in this manager to update the global gravity vector to align with the new surface's normal (e.g., from (0, -9.8, 0) to (-9.8, 0, 0)).`
    *   **Fulfills:** This task contributes to requirement **[PROD-001]**.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-2.1`:**
            *   [x] **Test Method Created:** **Evidence:** Test code implemented in `tests/e2e/phase2.spec.js`
            *   [x] **Test Method Passed:** **Evidence:** Gravity successfully changes from (0.00, -9.82, 0.00) to (9.82, 0.00, 0.00) - see `evidence/phase-2/story-2.1/tc-2.1-gravity-logs.txt`

> ### **Story Completion: STORY-2.1**
>
> 1.  **Run Full Regression Test:**
>     *   [x] **All Prior Tests Passed:** **Instruction:** `Run all tests from Phase 1 and TC-2.1.` **Evidence:** Phase 1 tests: 4 passed. TC-2.1 passed.
> 2.  **Create Git Commit:**
>     *   [x] **Work Committed:** **Instruction:** `Execute 'git add .' followed by 'git commit -m "feat(story): Complete STORY-2.1 - Implement Gravity Reorientation"'.` **Evidence:** Commit hash: 1f3fee2
> 3.  **Finalize Story:**
>     *   **Instruction:** Update this story's main checkbox from `[ ]` to `[x]`.

#### [x] STORY-2.2: Implement Smart Camera

1.  **Task:** Create a `CameraController` module that follows the player.
    *   **Instruction:** `Implement a CameraController that, in its update loop, sets the camera's position to be a fixed offset from the player avatar's position.`
    *   **Fulfills:** This task contributes to requirement **[PROD-009]**.
    *   **Verification via Test Cases:** N/A (Setup task).

2.  **Task:** When gravity reorients, smoothly interpolate the camera's rotation to the new orientation.
    *   **Instruction:** `When the PhysicsManager updates the gravity, it should notify the CameraController. The CameraController must then smoothly rotate (e.g., using LERP or SLERP on quaternions) from its current "up" vector to the new "up" vector over a short duration, avoiding an instantaneous snap.`
    *   **Fulfills:** This task contributes to requirement **[PROD-009]**.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-2.2`:**
            *   [x] **Test Method Created:** **Evidence:** Test code implemented in `tests/e2e/phase2.spec.js`
            *   [x] **Test Method Passed:** **Evidence:** Camera smoothly rotates from Up(0, 1, 0) to Up(-1, 0, 0) - see `evidence/phase-2/story-2.2/tc-2.2-camera-logs.txt` and frame captures

> ### **Story Completion: STORY-2.2**
>
> 1.  **Run Full Regression Test:**
>     *   [x] **All Prior Tests Passed:** **Instruction:** `Run all tests from Phase 1 and Phase 2.` **Evidence:** Phase 1: 4 passed, Phase 2: 2 passed
> 2.  **Create Git Commit:**
>     *   [x] **Work Committed:** **Instruction:** `Execute 'git add .' followed by 'git commit -m "feat(story): Complete STORY-2.2 - Implement Smart Camera"'.` **Evidence:** Commit hash: 7befb5a
> 3.  **Finalize Story:**
>     *   **Instruction:** Update this story's main checkbox from `[ ]` to `[x]`.

---

### **4. Definition of Done**

#### Final Acceptance Gate

*   [x] **Final Full Regression Test Passed:**
    *   **Instruction:** `Perform a final verification of all test cases for this phase.`
    *   **Evidence:** All tests passed - Phase 1: 4 tests passed, Phase 2: 2 tests passed (TC-2.1 and TC-2.2)
*   **Final Instruction:** Once the final test is passed, change `[ ] PHASE-2` to `[x] PHASE-2`.