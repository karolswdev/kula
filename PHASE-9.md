Excellent. The engine's foundation has been successfully reforged around the Universal Grid. Our asset pipeline is in place, and the first thematic world, "The Verdant Ruins," stands as a testament to the power of our new architecture.

Now, we elevate our creation from a world of static beauty to one of dynamic interaction. Phase 9 is the logical and most exciting next step: breathing life into our blocks. We will implement the **Declarative Behavior System**, the final core pillar of our engine. This is where we empower our designers—and ourselves—to create truly deep, interactive, and challenging puzzles. This phase will transform simple platforms into elevators, traps, switches, and doors, making our worlds truly come alive.

Here is the complete, actionable plan for Phase 9.

---
---

### **FILE: `PHASE-9.md`**

> ### **PRIME DIRECTIVE FOR THE EXECUTING AI AGENT (Version 2.0)**
>
> You are an expert, test-driven software development agent executing a formal development phase. You **MUST** adhere to the following professional software engineering methodology without deviation:
>
> 1.  **Read and Understand the Contract:** Begin by reading Section 2 ("Phase Scope & Test Case Definitions") in its entirety. This is your non-negotiable contract for success.
> 2.  **Execute Sequentially by Story:** Proceed to Section 3 ("Implementation Plan"). Address each **Story** in the exact order presented.
> 3.  **Initiate Each Story with Branching:** At the beginning of every new story, you **MUST** perform the following Git operations:
>     a. `git checkout master`
>     b. `git pull origin master`
>     c. `git checkout -b story/PHASE-9-[STORY-ID]-[short-title]`
> 4.  **Process Tasks Atomically:** Within each story, execute the **Tasks** in sequence. For each technical task, you **MUST** first read and internalize any specified existing source files before writing new code.
> 5.  **Complete Each Story with a Pull Request and QA Hand-off:** This is the ultimate acceptance gate for each story. You may only proceed once the following steps are complete:
>     a. After completing all tasks in a story, commit the work to your feature branch.
>     b. Create a pull request to merge your feature branch into `master` using the `gh` CLI.
>     c. **CRITICAL HAND-OFF:** You **MUST** return to your orchestrator and state the following verbatim: **"Story [STORY-ID] is complete and a pull request has been created. Please initiate the QA review process. I will await your feedback and explicit approval to merge."** You will then pause all work until you receive the merge command from the orchestrator.
> 6.  **Finalize Story with Merge:** Once the orchestrator (acting as the QA agent) provides approval and a rationale, you **MUST** merge the pull request using the `gh` CLI and the provided rationale. Then, and only then, you may mark the story's main checkbox as complete.
> 7.  **Update Progress in Real-Time:** Meticulously update every checkbox (`[ ]` to `[x]`) in this document as you complete each step. Your progress tracking must be flawless.

## [x] PHASE-9: The Behavior System Implementation

---

### **1. Phase Context (What & Why)**

| ID | Title |
| :--- | :--- |
| PHASE-9 | The Behavior System Implementation |

> **As a** Game Designer, **I want** to implement a library of declarative block behaviors and a system to parse them from level data, **so that** we can create dynamic, interactive puzzles and increase the depth and variety of our gameplay.

---

### **2. Phase Scope & Test Case Definitions (The Contract)**

*   **Requirement:** **[ARCH-005]** - Behavior System Architecture ([Link](./REQUIREMENTS.md#ARCH-005))
    *   **Test Case ID:** `TC-9.1`
        *   **Test Method Signature:** `BehaviorSystem_OnLevelLoad_ParsesAndAttachesBehaviors()`
        *   **Test Logic:** Create a level with a `behaviors` array containing one entry for a block at grid coordinate `[5,1,5]`. Load the level. Assert that the `BehaviorSystem` correctly parses this entry and attaches an "elevator" behavior instance to the specific block mesh/body associated with that grid coordinate.
        *   **Required Proof of Passing:** Console logs confirming: "Parsing behavior 'elevator' for target block at. Behavior attached successfully."

*   **Requirement:** **[PROD-015]** - Declarative Behaviors: Smart Blocks ([Link](./REQUIREMENTS.md#PROD-015))
    *   **Test Case ID:** `TC-9.2`
        *   **Test Method Signature:** `Behavior_Elevator_MovesOnPlayerContact()`
        *   **Test Logic:** Load a level containing a platform with an "elevator" behavior triggered by `onPlayerContact`. Move the player onto the platform. Assert that the platform moves smoothly from its start position to its defined end position.
        *   **Required Proof of Passing:** A screen recording (GIF) clearly showing the platform remaining stationary until the player lands on it, at which point it begins its vertical movement.

    *   **Test Case ID:** `TC-9.3`
        *   **Test Method Signature:** `Behavior_TimedDisappear_TogglesVisibilityOnInterval()`
        *   **Test Logic:** Load a level containing a block with a "timed_disappear" behavior with a 2-second interval. Observe the block. Assert that the block's visibility and physics body are enabled and disabled on the specified 2-second cycle.
        *   **Required Proof of Passing:** A screen recording (GIF) showing the block cyclically disappearing and reappearing. The player should fall through the space when the block is invisible.

    *   **Test Case ID:** `TC-9.4`
        *   **Test Method Signature:** `Behavior_SwitchAndTarget_ActivatesLinkedBlock()`
        *   **Test Logic:** Load a level with a "switch" block and a separate "target" block (e.g., a door or another platform). The switch's behavior definition must reference the target's grid coordinate. Move the player to touch the switch. Assert that the target block performs its linked action (e.g., moves, opens, appears).
        *   **Required Proof of Passing:** A screen recording (GIF) showing the player touching the switch block, and a different, distant block activating as a direct result.

---

### **3. Implementation Plan (The Execution)**

#### [x] STORY-9.1: Architect the Core Behavior System

1.  **Task:** Design the declarative behavior data structure.
    *   **Instruction:** `Update a level file (e.g., levels/grid-level-1.json) to include a "behaviors" array. Define the JSON schema for at least three behavior types: 'elevator', 'timed_disappear', and 'switch'. This schema will be the contract for the new system, as per PROD-015.`
    *   **Fulfills:** **[PROD-015]**.
    *   **Verification via Test Cases:** N/A (Design task, verified by implementation).

2.  **Task:** Implement the `BehaviorSystem` module.
    *   **Instruction:** `Read src/level/LevelManager.js. Create a new file at src/behaviors/BehaviorSystem.js. Implement a class that: 1. Is instantiated by Game.js. 2. Has a method to parse the 'behaviors' array from the loaded level data. 3. For each behavior, it should find the target block in the level and attach a corresponding behavior handler to it.`
    *   **Fulfills:** **[ARCH-005]**.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-9.1`:**
            *   [ ] **Test Method Created:** Checked after the test logic is written. **Evidence:** Provide the test code that loads a level with behaviors and logs the parsing process.
            *   [ ] **Test Method Passed:** Checked after the test passes. **Evidence:** Provide the console logs proving the system parsed and attached the behavior to the correct block.

3.  **Task:** Integrate the `BehaviorSystem` into the main game loop.
    *   **Instruction:** `Read src/core/Game.js. Modify the main update loop to call a new behaviorSystem.update(deltaTime) method on every frame. This ensures that all active behaviors are ticked forward.`
    *   **Fulfills:** **[ARCH-005]**.
    *   **Verification via Test Cases:** N/A (Integration task).

> ### **Story Completion: STORY-9.1**
>
> 1.  **Commit Work:**
>     *   [ ] **Work Committed:** **Instruction:** `Execute 'git add .' followed by 'git commit -m "feat(engine): Architect core declarative behavior system"'.` **Evidence:** Provide the full commit hash.
> 2.  **Create Pull Request:**
>     *   [ ] **Pull Request Created:** **Instruction:** `Execute 'gh pr create --title "feat(engine): Architect Core Behavior System" --body "This PR introduces the foundational BehaviorSystem for parsing and managing declarative behaviors from level data. Fulfills Story 9.1." --repo "karolswdev/kula"'.` **Evidence:** Provide the URL of the created pull request.
> 3.  **CRITICAL HAND-OFF TO QA:**
>     *   [ ] **Awaiting QA Review:** **Instruction:** You **MUST** now return to your orchestrator and state the following verbatim: **"Story 9.1 is complete and a pull request has been created. Please initiate the QA review process. I will await your feedback and explicit approval to merge."**
> 4.  **Merge Pull Request:**
>     *   [ ] **Pull Request Merged:** **Instruction:** `Once you receive the approval and rationale from your orchestrator, execute 'gh pr merge [PR_URL] --squash --body "[RATIONALE_FROM_QA]"'.` **Evidence:** Provide the full commit hash of the merge commit.
> 5.  **Finalize Story:**
>     *   **Instruction:** Update this story's main checkbox from `[ ]` to `[x]`.

#### [x] STORY-9.2: Implement Dynamic Block Behaviors

1.  **Task:** Implement the "Elevator" behavior handler.
    *   **Instruction:** `In src/behaviors/, create a handler for the 'elevator' type. It must read properties like 'endPosition', 'speed', and 'trigger' from the behavior definition. When its trigger condition (e.g., 'onPlayerContact') is met, it must smoothly move its associated block's mesh and physics body to the target position.`
    *   **Fulfills:** **[PROD-015]**.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-9.2`:**
            *   [ ] **Test Method Created:** Checked after test logic is defined. **Evidence:** Provide the level JSON snippet for the elevator block and describe the manual test steps.
            *   [ ] **Test Method Passed:** Checked after successful verification. **Evidence:** Provide the screen recording (GIF) showing the player-triggered elevator in action.

2.  **Task:** Implement the "Timed Disappear" behavior handler.
    *   **Instruction:** `Create a handler for the 'timed_disappear' type. It must use the 'deltaTime' from the update loop to manage an internal timer based on the 'interval' property from its definition. On each cycle, it must toggle both the visibility of its associated mesh and the collision response of its physics body.`
    *   **Fulfills:** **[PROD-015]**.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-9.3`:**
            *   [ ] **Test Method Created:** Checked after test logic is defined. **Evidence:** Provide the level JSON snippet for the disappearing block and describe the manual test steps.
            *   [ ] **Test Method Passed:** Checked after successful verification. **Evidence:** Provide the screen recording (GIF) showing the block cyclically disappearing.

3.  **Task:** Implement "Switch" and "Target" behavior handlers.
    *   **Instruction:** `This requires two handlers. The 'switch' handler detects a trigger (e.g., 'onPlayerContact'). When triggered, it must use a simple event bus or direct call to find its 'target' block (identified by grid coordinate) and invoke an action on it (e.g., 'activate'). The 'target' handler listens for this 'activate' event and performs its own logic, like moving to a new position.`
    *   **Fulfills:** **[PROD-015]**.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-9.4`:**
            *   [ ] **Test Method Created:** Checked after test logic is defined. **Evidence:** Provide the level JSON snippet for the linked switch and target blocks.
            *   [ ] **Test Method Passed:** Checked after successful verification. **Evidence:** Provide the screen recording (GIF) showing the switch activating the separate target block.

> ### **Story Completion: STORY-9.2**
>
> 1.  **Commit Work:**
>     *   [ ] **Work Committed:** **Instruction:** `Execute 'git add .' followed by 'git commit -m "feat(behaviors): Implement elevator, timed, and switch behaviors"'.` **Evidence:** Provide the full commit hash.
> 2.  **Create Pull Request:**
>     *   [ ] **Pull Request Created:** **Instruction:** `Execute 'gh pr create --title "feat(behaviors): Implement Dynamic Block Behaviors" --body "This PR adds the first library of functional block behaviors: elevators, timed disappearing blocks, and switch/target systems. Fulfills Story 9.2." --repo "karolswdev/kula"'.` **Evidence:** Provide the URL of the created pull request.
> 3.  **CRITICAL HAND-OFF TO QA:**
>     *   [ ] **Awaiting QA Review:** **Instruction:** You **MUST** now return to your orchestrator and state the following verbatim: **"Story 9.2 is complete and a pull request has been created. Please initiate the QA review process. I will await your feedback and explicit approval to merge."**
> 4.  **Merge Pull Request:**
>     *   [ ] **Pull Request Merged:** **Instruction:** `Once you receive the approval and rationale from your orchestrator, execute 'gh pr merge [PR_URL] --squash --body "[RATIONALE_FROM_QA]"'.` **Evidence:** Provide the full commit hash of the merge commit.
> 5.  **Finalize Story:**
>     *   **Instruction:** Update this story's main checkbox from `[ ]` to `[x]`.

---

### **4. Definition of Done**

#### Final Acceptance Gate

*   [x] **Final Full Regression Test Passed:**
    *   **Instruction:** `Verify that all stories (9.1, 9.2) are marked [x]. Load a new test level that incorporates all new behavior types simultaneously to ensure they work together without conflicts. Run the full E2E test suite ('npm test') to ensure no regressions.`
    *   **Evidence:** Provide a final summary statement confirming both stories are merged, all new behaviors are functional, and the automated test suite passes.
*   **Final Instruction:** Once the final verification is complete, change `[ ] PHASE-9` to `[x] PHASE-9`.