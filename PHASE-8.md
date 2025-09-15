# PHASE-8: The First World - "The Verdant Ruins"

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

> **As a** Game Developer, **I want** to create the first complete thematic world using our new grid engine with nature-themed assets, **so that** we can showcase the power of our grid system and provide 5-10 fully playable levels with visual cohesion and engaging gameplay.

---

### **2. Phase Scope & Test Case Definitions (The Contract)**

*   **Requirement:** **[PROD-016]** - Thematic Worlds ([Link](./REQUIREMENTS.md#PROD-016))
    *   **Test Case ID:** `TC-8.1`
        *   **Test Method Signature:** `ThemeManager_LoadTheme_AppliesNatureAssets()`
        *   **Test Logic:** Load a level with theme set to "nature". Verify that when requesting a `standard_platform` block, the system loads the nature-themed asset (e.g., `Stone Platform.glb` or `Rock Medium.glb`) instead of generic placeholders.
        *   **Required Proof of Passing:** Console logs showing theme "nature" loaded and correct asset paths resolved for block types.

*   **Requirement:** **[ARCH-007]** - Theme Management ([Link](./REQUIREMENTS.md#ARCH-007))
    *   **Test Case ID:** `TC-8.2`
        *   **Test Method Signature:** `AssetRegistry_GetThemeDefinition_ReturnsNatureAssets()`
        *   **Test Logic:** Query the AssetRegistry for theme "nature" definitions. Assert that it returns mappings for standard blocks to nature assets like `Grass Platform.glb`, `Rock Medium.glb`, `Stone Platform.glb`, etc.
        *   **Required Proof of Passing:** Console output showing the complete nature theme mapping with correct asset paths.

*   **Requirement:** **[PROD-013]** - Grid-Based Level Design ([Link](./REQUIREMENTS.md#PROD-013))
    *   **Test Case ID:** `TC-8.3`
        *   **Test Method Signature:** `LevelLoader_LoadVerdantLevel_CreatesPlayableGrid()`
        *   **Test Logic:** Load one of the new Verdant Ruins levels (e.g., `verdant-1.json`). Verify that all blocks are placed on grid coordinates, the level is fully playable with keys and exit, and visual assets match the nature theme.
        *   **Required Proof of Passing:** Screenshot or log showing level loaded with proper grid alignment and nature-themed visuals.

*   **Requirement:** **[NFR-003]** - Visual Identity ([Link](./REQUIREMENTS.md#NFR-003))
    *   **Test Case ID:** `TC-8.4`
        *   **Test Method Signature:** `Renderer_DisplayLevel_ShowsCohesiveNatureTheme()`
        *   **Test Logic:** Load and render a Verdant Ruins level. Verify that the visual presentation is cohesive with nature elements (greens, browns, organic shapes) and the player avatar remains clearly visible against the environment.
        *   **Required Proof of Passing:** Screenshot showing the rendered level with cohesive nature theming.

---

### **3. Implementation Plan (The Execution)**

#### [ ] STORY-8.1: Nature Theme Asset Configuration

1.  **Task:** Extend AssetRegistry with nature theme definitions.
    *   **Instruction:** `First, read src/assets/AssetRegistry.js. Then extend it to include a comprehensive "nature" theme mapping. Map logical block types to nature assets: standard_platform -> Stone Platform.glb, decorative_rock -> Rock Medium.glb, grass_platform -> Grass Platform.glb, hazard -> Hazard Spike Trap.glb, etc. Include at least 10 different block type mappings.`
    *   **Fulfills:** **[ARCH-007]**, **[PROD-016]**.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-8.2`:**
            *   [ ] **Test Method Created:** Checked after the test logic is written. **Evidence:** Provide the test code.
            *   [ ] **Test Method Passed:** Checked after the test passes. **Evidence:** Provide console output showing nature theme mappings.

2.  **Task:** Create ThemeManager module.
    *   **Instruction:** `Create src/theme/ThemeManager.js. This module should work with AssetRegistry to apply theme-specific asset mappings. It must have methods to setTheme(themeName), getCurrentTheme(), and getThemedAsset(blockType). When a theme is set, it should configure AssetRegistry to return theme-appropriate assets.`
    *   **Fulfills:** **[ARCH-007]**.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-8.1`:**
            *   [ ] **Test Method Created:** Checked after the test logic is written. **Evidence:** Provide the test code.
            *   [ ] **Test Method Passed:** Checked after the test passes. **Evidence:** Provide console logs showing theme application.

> ### **Story Completion: STORY-8.1**
>
> 1.  **Commit Work:**
>     *   [ ] **Work Committed:** **Instruction:** `Execute 'git add .' followed by 'git commit -m "feat(world): Add nature theme configuration and ThemeManager"'.` **Evidence:** Provide the full commit hash.
> 2.  **Create Pull Request:**
>     *   [ ] **Pull Request Created:** **Instruction:** `Execute 'gh pr create --title "feat(world): Nature Theme Configuration" --body "This PR adds nature theme asset mappings and ThemeManager for The Verdant Ruins world. Fulfills Story 8.1." --repo "karolswdev/kula"'.` **Evidence:** Provide the URL of the created pull request.
> 3.  **CRITICAL HAND-OFF TO QA:**
>     *   [ ] **Awaiting QA Review:** **Instruction:** You **MUST** now return to your orchestrator and state the following verbatim: **"Story 8.1 is complete and a pull request has been created. Please initiate the QA review process. I will await your feedback and explicit approval to merge."**
> 4.  **Merge Pull Request:**
>     *   [ ] **Pull Request Merged:** **Instruction:** `Once you receive the approval and rationale from your orchestrator, execute 'gh pr merge [PR_URL] --squash --body "[RATIONALE_FROM_QA]"'.` **Evidence:** Provide the full commit hash of the merge commit.
> 5.  **Finalize Story:**
>     *   **Instruction:** Update this story's main checkbox from `[ ]` to `[x]`.

#### [ ] STORY-8.2: The Verdant Ruins Levels

1.  **Task:** Create the first set of grid-based nature levels.
    *   **Instruction:** `Create 5 level files in levels/verdant/ directory: verdant-1.json through verdant-5.json. Each level must use the grid system with nature theme. Start simple (verdant-1: basic platforms and 2 keys) and increase complexity. Include varied layouts: vertical climbing, horizontal platforming, spiral paths. Use nature-appropriate blocks and ensure proper grid alignment.`
    *   **Fulfills:** **[PROD-013]**, **[PROD-016]**.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-8.3`:**
            *   [ ] **Test Method Created:** Checked after the test logic is written. **Evidence:** Provide the test code.
            *   [ ] **Test Method Passed:** Checked after the test passes. **Evidence:** Provide logs showing level loaded successfully.

2.  **Task:** Create advanced Verdant Ruins levels.
    *   **Instruction:** `Create 5 more levels (verdant-6.json through verdant-10.json) with increased difficulty. Include: multi-tier platforms, longer jump sequences, strategic key placement requiring backtracking, hazard placement (using spike traps), and creative use of the 3D grid space. Each level should take 2-5 minutes to complete.`
    *   **Fulfills:** **[PROD-011]**, **[PROD-004]**.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-8.4`:**
            *   [ ] **Test Method Created:** Checked after the test logic is written. **Evidence:** Provide the test code.
            *   [ ] **Test Method Passed:** Checked after the test passes. **Evidence:** Provide screenshot of rendered level.

3.  **Task:** Create level progression configuration.
    *   **Instruction:** `Create levels/worlds.json that defines world progression. Include "verdant_ruins" world with metadata: name, description, theme, level_order (verdant-1 through verdant-10), and difficulty progression. This will allow the game to present levels in proper sequence.`
    *   **Fulfills:** **[USER-003]**, **[PROD-016]**.
    *   **Verification via Test Cases:** N/A (Configuration task).

> ### **Story Completion: STORY-8.2**
>
> 1.  **Commit Work:**
>     *   [ ] **Work Committed:** **Instruction:** `Execute 'git add .' followed by 'git commit -m "feat(world): Add 10 Verdant Ruins levels with progression"'.` **Evidence:** Provide the full commit hash.
> 2.  **Create Pull Request:**
>     *   [ ] **Pull Request Created:** **Instruction:** `Execute 'gh pr create --title "feat(world): The Verdant Ruins Level Pack" --body "This PR adds 10 fully playable grid-based levels for The Verdant Ruins world with nature theming and difficulty progression. Fulfills Story 8.2." --repo "karolswdev/kula"'.` **Evidence:** Provide the URL of the created pull request.
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
    *   **Instruction:** `Verify that all stories (8.1, 8.2) are marked [x], indicating they have passed QA and been merged. Test that all 10 Verdant Ruins levels are fully playable with proper theming. Run the new theme tests to ensure the system works correctly.`
    *   **Evidence:** Provide a final summary confirming both stories are merged and levels are playable.
*   **Final Instruction:** Once the final verification is complete, change `[ ] PHASE-8` to `[x] PHASE-8`.