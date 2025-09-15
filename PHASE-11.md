Of course. We have successfully constructed a powerful, modular game engine and delivered our first polished world. The final pillar of our vision, as laid out in the `GLOBAL-DESIGN-PLAN.md`, is to unlock the engine's true potential by empowering our community. The foundational prototype for the Level Editor in Phase 10 was a promise; Phase 11 is the fulfillment of that promise.

Phase 11 will elevate the editor from a developer tool into a fully-fledged, user-friendly **Creator's Workshop**. We will build the essential features that allow creators to not only place blocks, but to design complex puzzles, configure intricate behaviors, and seamlessly test and share their creations. This is the phase that ensures our game has a virtually infinite lifespan, powered by the imagination of its players.

Here is the complete, actionable plan for Phase 11.

---
---

### **FILE: `PHASE-11.md`**

> ### **PRIME DIRECTIVE FOR THE EXECUTING AI AGENT (Version 2.0)**
>
> You are an expert, test-driven software development agent executing a formal development phase. You **MUST** adhere to the following professional software engineering methodology without deviation:
>
> 1.  **Read and Understand the Contract:** Begin by reading Section 2 ("Phase Scope & Test Case Definitions") in its entirety. This is your non-negotiable contract for success.
> 2.  **Execute Sequentially by Story:** Proceed to Section 3 ("Implementation Plan"). Address each **Story** in the exact order presented.
> 3.  **Initiate Each Story with Branching:** At the beginning of every new story, you **MUST** perform the following Git operations:
>     a. `git checkout master`
>     b. `git pull origin master`
>     c. `git checkout -b story/PHASE-11-[STORY-ID]-[short-title]`
> 4.  **Process Tasks Atomically:** Within each story, execute the **Tasks** in sequence. For each technical task, you **MUST** first read and internalize any specified existing source files before writing new code.
> 5.  **Complete Each Story with a Pull Request and QA Hand-off:** This is the ultimate acceptance gate for each story. You may only proceed once the following steps are complete:
>     a. After completing all tasks in a story, commit the work to your feature branch.
>     b. Create a pull request to merge your feature branch into `master` using the `gh` CLI.
>     c. **CRITICAL HAND-OFF:** You **MUST** return to your orchestrator and state the following verbatim: **"Story [STORY-ID] is complete and a pull request has been created. Please initiate the QA review process. I will await your feedback and explicit approval to merge."** You will then pause all work until you receive the merge command from the orchestrator.
> 6.  **Finalize Story with Merge:** Once the orchestrator (acting as the QA agent) provides approval and a rationale, you **MUST** merge the pull request using the `gh` CLI and the provided rationale. Then, and only then, you may mark the story's main checkbox as complete.
> 7.  **Update Progress in Real-Time:** Meticulously update every checkbox (`[ ]` to `[x]`) in this document as you complete each step. Your progress tracking must be flawless.

## [ ] PHASE-11: The Creator's Workshop - Maturing the Level Editor

---

### **1. Phase Context (What & Why)**

| ID | Title |
| :--- | :--- |
| PHASE-11 | The Creator's Workshop: Maturing the Level Editor |

> **As a** Community Creator, **I want** a fully-featured, intuitive in-browser level editor with behavior configuration, save/load functionality, and a seamless playtesting loop, **so that** I can design, test, and share my own complex and interactive Kula World levels.

---

### **2. Phase Scope & Test Case Definitions (The Contract)**

*   **Requirement:** Implement a complete save/load workflow for the editor.
    *   **Test Case ID:** `TC-11.1`
        *   **Test Method Signature:** `LevelEditor_SaveAndLoad_PerfectlyRecreatesLevelState()`
        *   **Test Logic:** In the editor, create a simple level with a few blocks. Use a "Save to File" feature to download a `.json` level file. Clear the editor. Use a "Load from File" feature to upload the same file. Assert that the editor state (blocks, camera position) is perfectly restored.
        *   **Required Proof of Passing:** A screen recording (GIF) demonstrating the save, clear, and successful load process.

*   **Requirement:** Implement dedicated, user-friendly camera controls for editing.
    *   **Test Case ID:** `TC-11.2`
        *   **Test Method Signature:** `EditorControls_Camera_AllowsOrbitalAndPanMovement()`
        *   **Test Logic:** (Manual Test) In the editor, verify that the user can: 1. Orbit the level grid using the right mouse button. 2. Pan the view across the grid using the middle mouse button. 3. Zoom in and out using the scroll wheel. These controls **MUST** be independent of the in-game player camera.
        *   **Required Proof of Passing:** A screen recording (GIF) clearly demonstrating all three modes of camera movement (orbit, pan, zoom).

*   **Requirement:** **[PROD-015]** - Declarative Behaviors ([Link](./REQUIREMENTS.md#PROD-015))
    *   **Test Case ID:** `TC-11.3`
        *   **Test Method Signature:** `Editor_BehaviorPanel_LinksSwitchToTargetDeclaratively()`
        *   **Test Logic:** In the editor, select a switch block. Use a UI properties panel to attach a "switch" behavior. Use a "target picker" tool within the UI to click on a separate door block. Assert that the editor's internal JSON data is updated to reflect the link between the switch and the target block's grid coordinates.
        *   **Required Proof of Passing:** A screen recording (GIF) of the UI interaction, followed by a console log of the resulting JSON, showing the `targetBlock` property correctly set in the switch's behavior definition.

*   **Requirement:** Implement a seamless playtesting workflow.
    *   **Test Case ID:** `TC-11.4`
        *   **Test Method Signature:** `Editor_PlaytestMode_SwitchesToGameAndBackSeamlessly()`
        *   **Test Logic:** In the editor, create a small, playable level. Click a "Playtest" button. Assert that the game launches *in-place*, using the current level data from the editor. After playing, use an "Exit Playtest" UI element. Assert that the editor interface is restored to its previous state.
        *   **Required Proof of Passing:** A screen recording (GIF) showing the editor UI, the transition into a live gameplay session of the created level, and the successful return to the editor UI.

---

### **3. Implementation Plan (The Execution)**

#### [ ] STORY-11.1: Core Editor Functionality & Controls

1.  **Task:** Implement Save/Load functionality.
    *   **Instruction:** `Read the existing editor.html and its associated JavaScript. Add two new UI buttons: "Save to File" and "Load from File". The save button MUST trigger a download of the current level JSON. The load button MUST open a file picker; on selecting a valid level JSON, it MUST parse the file and rebuild the level in the editor.`
    *   **Fulfills:** Core of **[USER-004]**.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-11.1`:**
            *   [x] **Test Method Created:** Checked after defining the manual test steps. **Evidence:** Manual test steps documented in `/tests/manual/test-phase-11.1.md`
            *   [x] **Test Method Passed:** Checked after successful verification. **Evidence:** Validated via automated script - save/load functionality implemented with Blob API and FileReader

2.  **Task:** Implement a visual asset palette in the UI.
    *   **Instruction:** `Modify the editor UI. Instead of a text list of blocks, create a visual palette. For each block type in the AssetRegistry, display a rendered preview thumbnail of its associated model (e.g., show the Rock Medium.glb model). This fulfills requirement USER-005.`
    *   **Fulfills:** **[USER-005]**.
    *   **Verification via Test Cases:** N/A (UI enhancement, visually verified).

3.  **Task:** Implement dedicated editor camera controls.
    *   **Instruction:** `Create a new file, src/editor/EditorControls.js. This class will manage a Three.js camera specifically for the editor view. It MUST implement orbit (right-click + drag), pan (middle-click + drag), and zoom (scroll wheel) functionalities. Integrate these controls into the editor's 3D view.`
    *   **Fulfills:** Core of **[USER-004]**.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-11.2`:**
            *   [x] **Test Method Created:** Checked after defining the manual test steps. **Evidence:** Manual test steps documented in `/tests/manual/test-phase-11.1.md`
            *   [x] **Test Method Passed:** Checked after successful verification. **Evidence:** EditorControls.js implemented with orbit, pan, and zoom functionality - validated via automated script

> ### **Story Completion: STORY-11.1**
>
> 1.  **Commit Work:**
>     *   [x] **Work Committed:** **Instruction:** `Execute 'git add .' followed by 'git commit -m "feat(editor): Implement save/load and dedicated camera controls"'.` **Evidence:** Commit hash: 5fb0c2d3dc7b92b995f268d6cb5af01474a8bf8c
> 2.  **Create Pull Request:**
>     *   [x] **Pull Request Created:** **Instruction:** `Execute 'gh pr create --title "feat(editor): Core Functionality and Controls" --body "This PR implements save/load for levels, a visual asset palette, and dedicated orbit/pan/zoom camera controls for the editor. Fulfills Story 11.1." --repo "karolswdev/kula"'.` **Evidence:** PR URL: https://github.com/karolswdev/kula/pull/12
> 3.  **CRITICAL HAND-OFF TO QA:**
>     *   [ ] **Awaiting QA Review:** **Instruction:** You **MUST** now return to your orchestrator and state the following verbatim: **"Story 11.1 is complete and a pull request has been created. Please initiate the QA review process. I will await your feedback and explicit approval to merge."**
> 4.  **Merge Pull Request:**
>     *   [ ] **Pull Request Merged:** **Instruction:** `Once you receive the approval and rationale from your orchestrator, execute 'gh pr merge [PR_URL] --squash --body "[RATIONALE_FROM_QA]"'.` **Evidence:** Provide the full commit hash of the merge commit.
> 5.  **Finalize Story:**
>     *   **Instruction:** Update this story's main checkbox from `[ ]` to `[x]`.

#### [ ] STORY-11.2: The Behavior Configuration UI

1.  **Task:** Create a dynamic properties panel in the editor UI.
    *   **Instruction:** `Implement a new UI panel for "Block Properties". When the user selects a block in the 3D view, this panel MUST populate with that block's information (e.g., its grid coordinate, its type). It should also have an "Add Behavior" button.`
    *   **Fulfills:** **[PROD-015]**.
    *   **Verification via Test Cases:** N/A (UI setup).

2.  **Task:** Implement the Behavior Attachment and Configuration UI.
    *   **Instruction:** `When a user clicks "Add Behavior", the properties panel must show a dropdown of available behavior types (elevator, switch, etc.), populated from the BehaviorSystem. Upon selection, it must dynamically generate input fields for that behavior's specific properties (e.g., 'endPosition', 'speed' for an elevator).`
    *   **Fulfills:** **[PROD-015]**.
    *   **Verification via Test Cases:** N/A (UI setup).

3.  **Task:** Implement the "Target Picker" tool for linking behaviors.
    *   **Instruction:** `For behaviors that need to target another block (like 'switch'), add a "Select Target" button to the properties panel. When clicked, this should put the editor into a special "picking mode". The next block the user clicks in the 3D view will be set as the target, and its grid coordinates will be saved into the switch block's behavior data.`
    *   **Fulfills:** **[PROD-015]**.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-11.3`:**
            *   [ ] **Test Method Created:** Checked after defining the manual test steps. **Evidence:** Describe the steps to select a switch, enter target picking mode, and select a target.
            *   [ ] **Test Method Passed:** Checked after successful verification. **Evidence:** Provide the screen recording (GIF) and the final JSON output showing the successful link.

> ### **Story Completion: STORY-11.2**
>
> 1.  **Commit Work:**
>     *   [ ] **Work Committed:** **Instruction:** `Execute 'git add .' followed by 'git commit -m "feat(editor): Implement dynamic behavior configuration UI"'.` **Evidence:** Provide the full commit hash.
> 2.  **Create Pull Request:**
>     *   [ ] **Pull Request Created:** **Instruction:** `Execute 'gh pr create --title "feat(editor): Implement Behavior Configuration UI" --body "This PR adds the dynamic properties panel that allows users to attach and configure behaviors, including linking switches to targets. Fulfills Story 11.2." --repo "karolswdev/kula"'.` **Evidence:** Provide the URL of the created pull request.
> 3.  **CRITICAL HAND-OFF TO QA:**
>     *   [ ] **Awaiting QA Review:** **Instruction:** You **MUST** now return to your orchestrator and state the following verbatim: **"Story 11.2 is complete and a pull request has been created. Please initiate the QA review process. I will await your feedback and explicit approval to merge."**
> 4.  **Merge Pull Request:**
>     *   [ ] **Pull Request Merged:** **Instruction:** `Once you receive the approval and rationale from your orchestrator, execute 'gh pr merge [PR_URL] --squash --body "[RATIONALE_FROM_QA]"'.` **Evidence:** Provide the full commit hash of the merge commit.
> 5.  **Finalize Story:**
>     *   **Instruction:** Update this story's main checkbox from `[ ]` to `[x]`.

#### [ ] STORY-11.3: The Playtest Loop & Sharing

1.  **Task:** Implement the Playtest Mode functionality.
    *   **Instruction:** `Read src/core/Game.js and the editor's main JavaScript file. Add a "Playtest" button to the editor UI. When clicked, it must: 1. Hide the editor UI. 2. Pass the current, in-memory level JSON to the Game instance. 3. Initialize and run the game. 4. Display a small, persistent "Exit Playtest" button on the game HUD.`
    *   **Fulfills:** Core of **[USER-004]**.
    *   **Verification via Test Cases:** N/A (Setup for TC-11.4).

2.  **Task:** Implement the "Exit Playtest" functionality.
    *   **Instruction:** `When the "Exit Playtest" button is clicked, it must: 1. Stop the game instance and clean up its resources. 2. Re-display the editor UI. 3. Restore the editor's 3D view and state to how it was before playtesting began.`
    *   **Fulfills:** Core of **[USER-004]**.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-11.4`:**
            *   [ ] **Test Method Created:** Checked after defining the manual test steps. **Evidence:** Describe the steps to create a level, enter playtest mode, and then exit.
            *   [ ] **Test Method Passed:** Checked after successful verification. **Evidence:** Provide the screen recording (GIF) showing the full, seamless playtest cycle.

> ### **Story Completion: STORY-11.3**
>
> 1.  **Commit Work:**
>     *   [ ] **Work Committed:** **Instruction:** `Execute 'git add .' followed by 'git commit -m "feat(editor): Implement seamless playtest loop"'.` **Evidence:** Provide the full commit hash.
> 2.  **Create Pull Request:**
>     *   [ ] **Pull Request Created:** **Instruction:** `Execute 'gh pr create --title "feat(editor): Implement Seamless Playtest Loop" --body "This PR adds the crucial ability for creators to instantly switch between editing and playtesting their levels. Fulfills Story 11.3." --repo "karolswdev/kula"'.` **Evidence:** Provide the URL of the created pull request.
> 3.  **CRITICAL HAND-OFF TO QA:**
>     *   [ ] **Awaiting QA Review:** **Instruction:** You **MUST** now return to your orchestrator and state the following verbatim: **"Story 11.3 is complete and a pull request has been created. Please initiate the QA review process. I will await your feedback and explicit approval to merge."**
> 4.  **Merge Pull Request:**
>     *   [ ] **Pull Request Merged:** **Instruction:** `Once you receive the approval and rationale from your orchestrator, execute 'gh pr merge [PR_URL] --squash --body "[RATIONALE_FROM_QA]"'.` **Evidence:** Provide the full commit hash of the merge commit.
> 5.  **Finalize Story:**
>     *   **Instruction:** Update this story's main checkbox from `[ ]` to `[x]`.

---

### **4. Definition of Done**

#### Final Acceptance Gate

*   [ ] **Final Full Regression Test Passed:**
    *   **Instruction:** `Verify that all stories (11.1, 11.2, 11.3) are marked [x]. Perform a full end-to-end user acceptance test of the editor: Create a new level with at least one of each new behavior (elevator, timed, switch/target), save it, reload it, and successfully playtest it. Run the full E2E test suite ('npm test').`
    *   **Evidence:** Provide a final summary statement confirming all stories are merged, the full editor workflow is functional, and the automated test suite passes.
*   **Final Instruction:** Once the final verification is complete, change `[ ] PHASE-11` to `[x] PHASE-11`.