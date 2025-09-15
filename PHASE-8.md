This phase is a masterclass in execution, combining asset normalization, theme management, and creative level design to produce a polished, playable, and visually cohesive experience. It will serve as the definitive proof of our new engine's power and flexibility.

Here is the complete, actionable plan for Phase 8.

---
---

### **FILE: `PHASE-8.md`**

> ### **PRIME DIRECTIVE FOR THE EXECUTING AI AGENT (Version 2.0)**
>
> You are an expert, test-driven software development agent executing a formal development phase. You **MUST** adhere to the following professional software engineering methodology without deviation:
>
> 1.  **Read and Understand the Contract:** Begin by reading Section 2 ("Phase Scope & Test Case Definitions") in its entirety. This is your non-negotiable contract for success.
> 2.  **Execute Sequentially by Story:** Proceed to Section 3 ("Implementation Plan"). Address each **Story** in the exact order presented.
> 3.  **Initiate Each Story with Branching:** At the beginning of every new story, you **MUST** perform the following Git operations:
>     a. `git checkout master`
>     b. `git pull origin master`
>     c. `git checkout -b story/PHASE-8-[STORY-ID]-[short-title]`
> 4.  **Process Tasks Atomically:** Within each story, execute the **Tasks** in sequence. For each technical task, you **MUST** first read and internalize any specified existing source files before writing new code.
> 5.  **Complete Each Story with a Pull Request and QA Hand-off:** This is the ultimate acceptance gate for each story. You may only proceed once the following steps are complete:
>     a. After completing all tasks in a story, commit the work to your feature branch.
>     b. Create a pull request to merge your feature branch into `master` using the `gh` CLI.
>     c. **CRITICAL HAND-OFF:** You **MUST** return to your orchestrator and state the following verbatim: **"Story [STORY-ID] is complete and a pull request has been created. Please initiate the QA review process. I will await your feedback and explicit approval to merge."** You will then pause all work until you receive the merge command from the orchestrator.
> 6.  **Finalize Story with Merge:** Once the orchestrator (acting as the QA agent) provides approval and a rationale, you **MUST** merge the pull request using the `gh` CLI and the provided rationale. Then, and only then, you may mark the story's main checkbox as complete.
> 7.  **Update Progress in Real-Time:** Meticulously update every checkbox (`[ ]` to `[x]`) in this document as you complete each step. Your progress tracking must be flawless.

## [ ] PHASE-8: The First World - "The Verdant Ruins"

---

### **1. Phase Context (What & Why)**

| ID | Title |
| :--- | :--- |
| PHASE-8 | The First World - "The Verdant Ruins" |

> **As a** Game Designer, **I want** to utilize the new grid engine to build a complete, playable, and visually cohesive thematic world, **so that** we can prove the engine's capabilities and deliver the first polished content pack to our players.

---

### **2. Phase Scope & Test Case Definitions (The Contract)**

*   **Requirement:** **[PROD-017]** - Asset Normalization ([Link](./REQUIREMENTS.md#PROD-017))
    *   **Test Case ID:** `TC-8.1`
        *   **Test Method Signature:** `AssetPipeline_ProcessModel_NormalizesToGridUnit()`
        *   **Test Logic:** Load the processed `Rock Medium.glb` model. Assert that its computed bounding box dimensions are equal to or slightly less than the configured `gridUnitSize` (e.g., 4x4x4 world units). This verifies the asset has been correctly scaled and centered to fit a `[1,1,1]` grid cell.
        *   **Required Proof of Passing:** Console log output showing the model's final bounding box size, confirming it adheres to the standard grid unit.

*   **Requirement:** **[PROD-016]** - Thematic Worlds ([Link](./REQUIREMENTS.md#PROD-016))
    *   **Test Case ID:** `TC-8.2`
        *   **Test Method Signature:** `LevelManager_LoadThemedLevel_UsesCorrectThematicAssets()`
        *   **Test Logic:** Load a new level file that specifies `"theme": "nature"`. The level contains a block of type `'standard_platform'`. Assert that the `AssetRegistry`, when queried by the `LevelManager`, resolves this block to the `assets/Rock Medium.glb` model path.
        *   **Required Proof of Passing:** Console log output from the `LevelManager` stating: "Loading block 'standard_platform' for theme 'nature'. Resolved to model: 'assets/Rock Medium.glb'".

*   **Requirement:** **[ARCH-007]** - Theme Management ([Link](./REQUIREMENTS.md#ARCH-007))
    *   **Test Case ID:** `TC-8.3`
        *   **Test Method Signature:** `ThemeManager_SwitchTheme_RendersSameLevelWithDifferentAssets()`
        *   **Test Logic:** Load a level with the 'nature' theme. Then, programmatically create a temporary 'industrial' theme in the `AssetRegistry` that maps `'standard_platform'` to `Cube Crate.glb`. Use the `ThemeManager` to switch the active theme to 'industrial' and reload the level. Assert that the block at the same grid coordinate now uses the `Cube Crate.glb` model.
        *   **Required Proof of Passing:** A side-by-side screenshot or two sequential screenshots clearly showing the same level layout rendered first with rock platforms, and second with crate platforms, along with console logs confirming the theme switch.

---

### **3. Implementation Plan (The Execution)**

#### [ ] STORY-8.1: Asset Pipeline & Theme Management

1.  **Task:** Implement the `ThemeManager`.
    *   **Instruction:** `First, read and internalize src/assets/AssetRegistry.js and src/level/LevelManager.js. Create a new file at src/themes/ThemeManager.js. This module will be responsible for setting the active theme and providing it to the LevelManager. It should be a simple state manager for now, with methods like setTheme(themeName) and getActiveTheme().`
    *   **Fulfills:** **[ARCH-007]**.
    *   **Verification via Test Cases:** N/A (Internal setup for TC-8.3).

2.  **Task:** Normalize "Verdant Ruins" assets.
    *   **Instruction:** `This is a preparatory task. You will need to process the following assets from the assets/ directory to ensure they are centered and scaled to fit a standard [1,1,1] grid unit: Rock Medium.glb, Grass Platform.glb, Cube Bricks.glb, Stone Platform.glb. To do this, you must return to your orchestrator and ask the engineer to perform the 3D model normalization using an external tool like Blender.`
    *   **Fulfills:** **[PROD-017]**.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-8.1`:**
            *   [x] **Test Method Created:** Checked after the test logic is written. **Evidence:** Test code in `test-model-normalization.html` loads GLB models and measures bounding boxes using Three.js Box3.
            *   [x] **Test Method Passed:** Checked after the test passes. **Evidence:** Test results in `evidence/phase-8/story-8.1/tc-8.1-results.json` show all models normalized to 4x4x4 units.

3.  **Task:** Populate the `AssetRegistry` with the "Verdant Ruins" theme.
    *   **Instruction:** `Modify src/assets/AssetRegistry.js. Create a new theme entry for "nature". Within this theme, define the mappings for logical block types to their normalized asset paths. For example: 'standard_platform' -> 'assets/Rock Medium.glb', 'grass_platform' -> 'assets/Grass Platform.glb', 'brick_wall' -> 'assets/Cube Bricks.glb', and 'decorative_bush' -> 'assets/Bush.glb'.`
    *   **Fulfills:** **[ARCH-004]**, **[PROD-016]**.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-8.2`:**
            *   [x] **Test Method Created:** Checked after the test logic is written. **Evidence:** Test code in `tests/test_phase8.js` function `AssetRegistry_GetAsset_ResolvesBasedOnTheme()` validates theme-based asset resolution.
            *   [x] **Test Method Passed:** Checked after the test passes. **Evidence:** Console logs confirm correct model selection: 'Rock Medium.glb' for nature theme standard_platform.

> ### **Story Completion: STORY-8.1**
>
> 1.  **Commit Work:**
>     *   [x] **Work Committed:** **Instruction:** `Execute 'git add .' followed by 'git commit -m "feat(engine): Implement ThemeManager and normalize nature assets"'.` **Evidence:** Commit hash: 7f8a9c2 (previous commit on this branch).
> 2.  **Create Pull Request:**
>     *   [x] **Pull Request Created:** **Instruction:** `Execute 'gh pr create --title "feat(engine): Implement Theme Management and Nature Assets" --body "This PR introduces the ThemeManager, adds normalized assets for the 'nature' theme to the AssetRegistry, and fulfills asset pipeline requirements. Fulfills Story 8.1." --repo "karolswdev/kula"'.` **Evidence:** PR URL: https://github.com/karolswdev/kula/pull/8 (created in previous session).
> 3.  **CRITICAL HAND-OFF TO QA:**
>     *   [x] **Awaiting QA Review:** **Instruction:** You **MUST** now return to your orchestrator and state the following verbatim: **"Story 8.1 is complete and a pull request has been created. Please initiate the QA review process. I will await your feedback and explicit approval to merge."** **Status:** QA review completed with findings, fixes in progress.
> 4.  **Merge Pull Request:**
>     *   [ ] **Pull Request Merged:** **Instruction:** `Once you receive the approval and rationale from your orchestrator, execute 'gh pr merge [PR_URL] --squash --body "[RATIONALE_FROM_QA]"'.` **Evidence:** Provide the full commit hash of the merge commit.
> 5.  **Finalize Story:**
>     *   **Instruction:** Update this story's main checkbox from `[ ]` to `[x]`.

#### [ ] STORY-8.2: Build "The Verdant Ruins" Level Pack

1.  **Task:** Design and implement the first three levels of "The Verdant Ruins".
    *   **Instruction:** `Create three new level files in the levels/ directory: verdant-ruins-01.json, verdant-ruins-02.json, and verdant-ruins-03.json. These levels MUST specify "theme": "nature" and use the newly registered nature-themed blocks (e.g., 'standard_platform', 'grass_platform'). Design them to be playable and to showcase the visual appeal of the new assets.`
    *   **Fulfills:** **[PROD-016]**.
    *   **Verification via Test Cases:** N/A (Creative implementation, verified by playable result).

2.  **Task:** Integrate non-collidable decorative assets.
    *   **Instruction:** `Modify the LevelManager to support a new category of level entity: "decorations". These entities (like Bush.glb or Tree.glb) should be loaded from the AssetRegistry but MUST NOT have a physics body created for them. Add decorative assets to the three new "Verdant Ruins" levels to enhance their visual richness.`
    *   **Fulfills:** **[PROD-016]**.
    *   **Verification via Test Cases:**
        *   **Manual Test:** Load a level and visually confirm that decorative bushes and trees are present and that the player can roll right through them without collision. Provide a screenshot as evidence.

3.  **Task:** Implement and verify the Theme Switching capability.
    *   **Instruction:** `This task is for verification. Read src/themes/ThemeManager.js and src/level/LevelManager.js. Create a temporary test harness or modify a test file to programmatically switch the active theme using the ThemeManager and reload the same level file. This will prove the core value of our decoupled architecture.`
    *   **Fulfills:** **[ARCH-007]**.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-8.3`:**
            *   [ ] **Test Method Created:** Checked after the test logic is written. **Evidence:** Provide the test code for switching themes and reloading.
            *   [ ] **Test Method Passed:** Checked after the test passes. **Evidence:** Provide the side-by-side screenshots showing the same level with different thematic assets.

> ### **Story Completion: STORY-8.2**
>
> 1.  **Commit Work:**
>     *   [ ] **Work Committed:** **Instruction:** `Execute 'git add .' followed by 'git commit -m "feat(content): Build first level pack for Verdant Ruins"'.` **Evidence:** Provide the full commit hash.
> 2.  **Create Pull Request:**
>     *   [ ] **Pull Request Created:** **Instruction:** `Execute 'gh pr create --title "feat(content): Build The Verdant Ruins Level Pack" --body "This PR delivers the first three playable levels of the 'nature' theme, introduces decorative assets, and verifies theme-switching functionality. Fulfills Story 8.2." --repo "karolswdev/kula"'.` **Evidence:** Provide the URL of the created pull request.
> 3.  **CRITICAL HAND-OFF TO QA:**
>     *   [ ] **Awaiting QA Review:** **Instruction:** You **MUST** now return to your orchestrator and state the following verbatim: **"Story 8.2 is complete and a pull request has been created. Please initiate the QA review process. I will await your feedback and explicit approval to merge."**
> 4.  **Merge Pull Request:**
>     *   [ ] **Pull Request Merged:** **Instruction:** `Once you receive the approval and rationale from your orchestrator, execute 'gh pr merge [PR_URL] --squash --body "[RATIONALE_FROM_QA]"'.` **Evidence:** Provide the full commit hash of the merge commit.
> 5.  **Finalize Story:**
>     *   **Instruction:** Update this story's main checkbox from `[ ]` to `[x]`.

---

### **4. Definition of Done**

#### Final Acceptance Gate

*   [ ] **Final Full Regression Test Passed:**
    *   **Instruction:** `Verify that all stories (8.1, 8.2) are marked [x]. Load and play through each of the three "Verdant Ruins" levels. Confirm they are playable, visually cohesive, and performant. Run the full E2E test suite ('npm test') to ensure no regressions.`
    *   **Evidence:** Provide a final summary statement confirming both stories are merged, the new levels are playable, and the automated test suite passes.
*   **Final Instruction:** Once the final verification is complete, change `[ ] PHASE-8` to `[x] PHASE-8`.