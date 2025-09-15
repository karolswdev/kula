Phase 7 will be the crucible where our new design is forged into reality. We will refactor our engine's core, transforming it from its free-form origins into the robust, deterministic grid-based platform we have envisioned. This is a critical, foundational step, and we will execute it flawlessly.

### **FILE: `PHASE-7.md`**

> ### **PRIME DIRECTIVE FOR THE EXECUTING AI AGENT (Version 2.0)**
>
> You are an expert, test-driven software development agent executing a formal development phase. You **MUST** adhere to the following professional software engineering methodology without deviation:
>
> 1.  **Read and Understand the Contract:** Begin by reading Section 2 ("Phase Scope & Test Case Definitions") in its entirety. This is your non-negotiable contract for success.
> 2.  **Execute Sequentially by Story:** Proceed to Section 3 ("Implementation Plan"). Address each **Story** in the exact order presented.
> 3.  **Initiate Each Story with Branching:** At the beginning of every new story, you **MUST** perform the following Git operations:
>     a. `git checkout master`
>     b. `git pull origin master`
>     c. `git checkout -b story/PHASE-7-[STORY-ID]-[short-title]`
> 4.  **Process Tasks Atomically:** Within each story, execute the **Tasks** in sequence. For each technical task, you **MUST** first read and internalize any specified existing source files before writing new code.
> 5.  **Complete Each Story with a Pull Request and QA Hand-off:** This is the ultimate acceptance gate for each story. You may only proceed once the following steps are complete:
>     a. After completing all tasks in a story, commit the work to your feature branch.
>     b. Create a pull request to merge your feature branch into `master` using the `gh` CLI.
>     c. **CRITICAL HAND-OFF:** You **MUST** return to your orchestrator and state the following verbatim: **"Story [STORY-ID] is complete and a pull request has been created. Please initiate the QA review process. I will await your feedback and explicit approval to merge."** You will then pause all work until you receive the merge command from the orchestrator.
> 6.  **Finalize Story with Merge:** Once the orchestrator (acting as the QA agent) provides approval and a rationale, you **MUST** merge the pull request using the `gh` CLI and the provided rationale. Then, and only then, you may mark the story's main checkbox as complete.
> 7.  **Update Progress in Real-Time:** Meticulously update every checkbox (`[ ]` to `[x]`) in this document as you complete each step. Your progress tracking must be flawless.

## [ ] PHASE-7: The Grid Engine Refactor

---

### **1. Phase Context (What & Why)**

| ID | Title |
| :--- | :--- |
| PHASE-7 | The Grid Engine Refactor |

> **As a** Core Engine Developer, **I want** to refactor the `LevelManager` to use a universal grid system and implement a `Block & Asset Registry`, **so that** we can build deterministic, themeable, and performance-optimized levels from simple, declarative data.

---

### **2. Phase Scope & Test Case Definitions (The Contract)**

*   **Requirement:** **[ARCH-003]** - Grid Coordinate System ([Link](./REQUIREMENTS.md#ARCH-003))
    *   **Test Case ID:** `TC-7.1`
        *   **Test Method Signature:** `LevelManager_LoadGridLevel_PlacesBlocksAtCorrectWorldPositions()`
        *   **Test Logic:** Create a new grid-based level file (`grid-level-1.json`) with blocks at integer coordinates `[0,0,0]` and `[2,0,1]`. Assuming a `gridUnitSize` of 4, load the level. Assert that the resulting meshes are created at world positions `(0,0,0)` and `(8,0,4)`.
        *   **Required Proof of Passing:** Console log output showing the grid coordinates and the calculated world coordinates for each placed block, confirming the transformation is correct.

*   **Requirement:** **[ARCH-004]** - Asset Registry Architecture ([Link](./REQUIREMENTS.md#ARCH-004))
    *   **Test Case ID:** `TC-7.2`
        *   **Test Method Signature:** `AssetRegistry_GetBlockDefinition_ReturnsCorrectModelAndPhysics()`
        *   **Test Logic:** Query the `AssetRegistry` for a `'nature_rock_platform'` block type. Assert that the registry returns a definition containing the visual model path (`assets/Rock Medium.glb`) and a simplified physics primitive (`CANNON.Box`).
        *   **Required Proof of Passing:** Console log output showing the fetched block definition, explicitly stating the model path and the type of the physics shape.

*   **Requirement:** **[NFR-004]** - Asset Loading & Instancing ([Link](./REQUIREMENTS.md#NFR-004))
    *   **Test Case ID:** `TC-7.3`
        *   **Test Method Signature:** `AssetManager_LoadLevel_InstancesRepeatedModels()`
        *   **Test Logic:** Load a level containing multiple instances of the same block type (e.g., three `'nature_rock_platform'` blocks). Assert that the `.glb` model for `Rock Medium.glb` is loaded only once and that the three visual meshes in the scene are clones/instances sharing the same geometry data.
        *   **Required Proof of Passing:** Console logs showing the asset loader fetching the model once, followed by logs confirming the creation of three instances from the cached asset. A check of the meshes' geometry UUIDs should confirm they are identical.

*   **Requirement:** **[ARCH-006]** - Physics Optimization ([Link](./REQUIREMENTS.md#ARCH-006))
    *   **Test Case ID:** `TC-7.4`
        *   **Test Method Signature:** `PhysicsManager_OnLoad_UsesSimplifiedColliders()`
        *   **Test Logic:** Load a level block that uses the visually complex `Rock Medium.glb` model. Assert that the corresponding physics body created in the `PhysicsManager` is a simple `CANNON.Box` shape, not a complex mesh-based collider.
        *   **Required Proof of Passing:** Console log output from the `PhysicsManager` detailing the creation of the physics body, confirming its `type` is `Box`.

---

### **3. Implementation Plan (The Execution)**

#### [ ] STORY-7.1: Implement the Universal Grid System

1.  **Task:** Create a new grid-based level definition file.
    *   **Instruction:** `Create a new file named levels/grid-level-1.json. This file will serve as the contract for the refactored engine. It MUST define a theme, a gridUnitSize, and a list of blocks using integer-based grid coordinates (e.g., { "type": "standard", "at": [0, 0, 1] }).`
    *   **Fulfills:** Supports **[PROD-013]**, **[ARCH-003]**.
    *   **Verification via Test Cases:** N/A (Setup task).

2.  **Task:** Create the `AssetRegistry` module.
    *   **Instruction:** `Create a new file at src/assets/AssetRegistry.js. Implement a class that holds a mapping of logical block types to their definitions. Initially, hardcode a few definitions for a 'nature' theme, mapping 'standard' to a definition object containing a model path (e.g., 'assets/Rock Medium.glb') and a physics shape type ('Box'). This fulfills requirement ARCH-004.`
    *   **Fulfills:** **[ARCH-004]**, **[PROD-014]**.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-7.2`:**
            *   [ ] **Test Method Created:** Checked after the test logic is written. **Evidence:** Provide the code for a standalone test function that queries the new `AssetRegistry`.
            *   [ ] **Test Method Passed:** Checked after the test passes. **Evidence:** Provide the console log output from the test function proving the correct definition was returned.

3.  **Task:** Refactor the `LevelManager` to be grid-aware.
    *   **Instruction:** `First, read and internalize the existing src/level/LevelManager.js file. Then, refactor its load method. It MUST now: 1. Read the new grid-based JSON format. 2. For each block, query the AssetRegistry to get its definition. 3. Use the block's grid coordinate ("at") and the level's "gridUnitSize" to calculate the final world position. 4. Place a placeholder mesh at the calculated position. This task focuses only on the grid logic.`
    *   **Fulfills:** **[ARCH-003]**, **[PROD-013]**.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-7.1`:**
            *   [ ] **Test Method Created:** Checked after the test logic is written. **Evidence:** Provide the test code that loads `grid-level-1.json` and logs the resulting world positions.
            *   [ ] **Test Method Passed:** Checked after the test passes. **Evidence:** Provide the console logs confirming that grid coordinates `[2,0,1]` correctly translates to world coordinates `(8,0,4)`.

> ### **Story Completion: STORY-7.1**
>
> 1.  **Commit Work:**
>     *   [ ] **Work Committed:** **Instruction:** `Execute 'git add .' followed by 'git commit -m "feat(engine): Implement universal grid and asset registry"'.` **Evidence:** Provide the full commit hash.
> 2.  **Create Pull Request:**
>     *   [ ] **Pull Request Created:** **Instruction:** `Execute 'gh pr create --title "feat(engine): Implement Universal Grid System" --body "This PR refactors the LevelManager to a grid-based system and introduces the AssetRegistry. Fulfills Story 7.1." --repo "karolswdev/kula"'.` **Evidence:** Provide the URL of the created pull request.
> 3.  **CRITICAL HAND-OFF TO QA:**
>     *   [ ] **Awaiting QA Review:** **Instruction:** You **MUST** now return to your orchestrator and state the following verbatim: **"Story 7.1 is complete and a pull request has been created. Please initiate the QA review process. I will await your feedback and explicit approval to merge."**
> 4.  **Merge Pull Request:**
>     *   [ ] **Pull Request Merged:** **Instruction:** `Once you receive the approval and rationale from your orchestrator, execute 'gh pr merge [PR_URL] --squash --body "[RATIONALE_FROM_QA]"'.` **Evidence:** Provide the full commit hash of the merge commit.
> 5.  **Finalize Story:**
>     *   **Instruction:** Update this story's main checkbox from `[ ]` to `[x]`.

#### [ ] STORY-7.2: Asset Integration & Physics Optimization

1.  **Task:** Create an `AssetManager` for loading and caching `.glb` models.
    *   **Instruction:** `Create a new file at src/assets/AssetManager.js. Implement a class that can preload a list of .glb files using Three.js's GLTFLoader. It MUST cache the loaded assets to prevent duplicate network requests and re-parsing. This fulfills requirement NFR-004.`
    *   **Fulfills:** **[NFR-004]**.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-7.3`:**
            *   [ ] **Test Method Created:** Checked after the test logic is written. **Evidence:** Provide the test code that loads a level with duplicate assets and logs the loading/instancing process.
            *   [ ] **Test Method Passed:** Checked after the test passes. **Evidence:** Provide console logs showing the model is fetched once and instanced multiple times.

2.  **Task:** Integrate `AssetManager` with `LevelManager` and `PhysicsManager`.
    *   **Instruction:** `First, read and internalize src/level/LevelManager.js, src/physics/PhysicsManager.js, and the new src/assets/AssetManager.js. Then, modify the LevelManager to use the AssetManager. Instead of placing a placeholder, it should now place a clone of the actual pre-loaded .glb model (e.g., Rock Medium.glb) from the asset cache. Concurrently, modify the PhysicsManager so that when it creates the physics body for this block, it uses the simple 'Box' primitive from the AssetRegistry, NOT a collider derived from the complex visual model.`
    *   **Fulfills:** **[PROD-017]**, **[ARCH-006]**.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-7.4`:**
            *   [ ] **Test Method Created:** Checked after the test logic is written. **Evidence:** Provide test code that logs the type of physics body created for a visually complex block.
            *   [ ] **Test Method Passed:** Checked after the test passes. **Evidence:** Provide console logs from the `PhysicsManager` confirming a `CANNON.Box` was created for the `Rock Medium.glb` model.

> ### **Story Completion: STORY-7.2**
>
> 1.  **Commit Work:**
>     *   [ ] **Work Committed:** **Instruction:** `Execute 'git add .' followed by 'git commit -m "feat(engine): Integrate GLB assets and optimized physics"'.` **Evidence:** Provide the full commit hash.
> 2.  **Create Pull Request:**
>     *   [ ] **Pull Request Created:** **Instruction:** `Execute 'gh pr create --title "feat(engine): Integrate Asset Loading and Physics Primitives" --body "This PR implements the AssetManager for loading .glb files and ensures physics bodies are decoupled, simplified primitives. Fulfills Story 7.2." --repo "karolswdev/kula"'.` **Evidence:** Provide the URL of the created pull request.
> 3.  **CRITICAL HAND-OFF TO QA:**
>     *   [ ] **Awaiting QA Review:** **Instruction:** You **MUST** now return to your orchestrator and state the following verbatim: **"Story 7.2 is complete and a pull request has been created. Please initiate the QA review process. I will await your feedback and explicit approval to merge."**
> 4.  **Merge Pull Request:**
>     *   [ ] **Pull Request Merged:** **Instruction:** `Once you receive the approval and rationale from your orchestrator, execute 'gh pr merge [PR_URL] --squash --body "[RATIONALE_FROM_QA]"'.` **Evidence:** Provide the full commit hash of the merge commit.
> 5.  **Finalize Story:**
>     *   **Instruction:** Update this story's main checkbox from `[ ]` to `[x]`.

---

### **4. Definition of Done**

#### Final Acceptance Gate

*   [ ] **Final Full Regression Test Passed:**
    *   **Instruction:** `Verify that all stories (7.1, 7.2) are marked [x], indicating they have passed QA and been merged. Run the full E2E test suite ('npm test') to ensure the refactor has not broken any core gameplay mechanics from Phases 1-5.`
    *   **Evidence:** Provide a final summary statement confirming both stories are merged and that the full E2E test suite passes without regressions.
*   **Final Instruction:** Once the final verification is complete, change `[ ] PHASE-7` to `[x] PHASE-7`.