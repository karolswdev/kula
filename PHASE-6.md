
> ### **PRIME DIRECTIVE FOR THE EXECUTING AI AGENT (Version 2.0)**
>
> You are an expert, test-driven software development agent executing a formal development phase. You **MUST** adhere to the following professional software engineering methodology without deviation:
>
> 1.  **Read and Understand the Contract:** Begin by reading Section 2 ("Phase Scope & Test Case Definitions") in its entirety. This is your non-negotiable contract for success.
> 2.  **Execute Sequentially by Story:** Proceed to Section 3 ("Implementation Plan"). Address each **Story** in the exact order presented.
> 3.  **Initiate Each Story with Branching:** At the beginning of every new story, you **MUST** perform the following Git operations:
>     a. `git checkout master`
>     b. `git pull origin master`
>     c. `git checkout -b story/[STORY-ID]-[short-title]`
> 4.  **Process Tasks Atomically:** Within each story, execute the **Tasks** in sequence. For each technical task, you **MUST** first read and internalize any specified existing source files before writing new code.
> 5.  **Complete Each Story with a Pull Request and QA Hand-off:** This is the ultimate acceptance gate for each story. You may only proceed once the following steps are complete:
>     a. After completing all tasks in a story, commit the work to your feature branch.
>     b. Create a pull request to merge your feature branch into `master` using the `gh` CLI.
>     c. **CRITICAL HAND-OFF:** You **MUST** return to your orchestrator and state the following verbatim: **"Story [STORY-ID] is complete and a pull request has been created. Please initiate the QA review process. I will await your feedback and explicit approval to merge."** You will then pause all work until you receive the merge command from the orchestrator.
> 6.  **Finalize Story with Merge:** Once the orchestrator (acting as the QA agent) provides approval and a rationale, you **MUST** merge the pull request using the `gh` CLI and the provided rationale. Then, and only then, you may mark the story's main checkbox as complete.
> 7.  **Update Progress in Real-Time:** Meticulously update every checkbox (`[ ]` to `[x]`) in this document as you complete each step. Your progress tracking must be flawless.

## [ ] PHASE-6: Engine Foundations - Documentation, CI/CD, & OSS Setup

---

### **1. Phase Context (What & Why)**

| ID | Title |
| :--- | :--- |
| PHASE-6 | Engine Foundations - Documentation, CI/CD, & OSS Setup |

> **As a** Lead Architect, **I want** to formalize our next-generation engine design, establish a professional open-source project structure, and implement a foundational CI/CD pipeline, **so that** we have a clear, automated, and high-quality framework for all future development.

---

### **2. Phase Scope & Test Case Definitions (The Contract)**

*   **Requirement:** Internalize the existing strategic design document.
    *   **Test Case ID:** `TC-6.1`
        *   **Test Method Signature:** `System_Onboarding_VerifyUnderstandingOfGlobalDesignPlan()`
        *   **Test Logic:** Read and process the existing `GLOBAL-DESIGN-PLAN.md` file. Produce a concise, bulleted summary of the four core pillars and the high-level implementation roadmap.
        *   **Required Proof of Passing:** A markdown-formatted summary that accurately reflects the key strategic points of the design plan.

*   **Requirement:** Update the existing `REQUIREMENTS.md` file with new specifications.
    *   **Test Case ID:** `TC-6.2`
        *   **Test Method Signature:** `System_Documentation_UpdateSoftwareRequirementsForGridEngine()`
        *   **Test Logic:** Modify the `REQUIREMENTS.md` file to include new, detailed requirements for the grid system, the asset registry (explicitly mentioning assets like `Rock Medium.glb`, `Cube Bricks.glb`, and `Hazard Spike Trap.glb`), declarative behaviors, thematic worlds, and asset normalization.
        *   **Required Proof of Passing:** A `diff` or quoted markdown of all newly added sections to the `REQUIREMENTS.md` file.

*   **Requirement:** Establish a Continuous Integration (CI) pipeline.
    *   **Test Case ID:** `TC-6.3`
        *   **Test Method Signature:** `System_DevOps_CreateCIWorkflow()`
        *   **Test Logic:** Create a new GitHub Actions workflow file at `.github/workflows/ci.yml`. The workflow must trigger on pushes to `master` and on pull requests. It must contain jobs for linting the code (`npm run lint`) and running the E2E tests (`npm test`).
        *   **Required Proof of Passing:** The complete, final YAML content of the `.github/workflows/ci.yml` file.

*   **Requirement:** Create standard Open-Source Software (OSS) documentation.
    *   **Test Case ID:** `TC-6.4`
        *   **Test Method Signature:** `System_OSS_CreateCommunityGuidelines()`
        *   **Test Logic:** Create a `CONTRIBUTING.md` file with guidelines for branching, PRs, and coding standards. Create a `CODE_OF_CONDUCT.md` file using a standard template. Create issue templates in the `.github/` directory for bug reports and feature requests.
        *   **Required Proof of Passing:** The complete content of `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and the issue template files.

---

### **3. Implementation Plan (The Execution)**

#### [x] STORY-6.1: Project Onboarding & OSS Foundation

1.  **Task:** Read and summarize core strategic documents.
    *   **Instruction:** `Begin by reading the following files in their entirety to build context: VISION.md, REQUIREMENTS.md, and GLOBAL-DESIGN-PLAN.md.`
    *   **Fulfills:** This task prepares you for the phase.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-6.1`:**
            *   [x] **Summary Created:** Checked after you produce the summary. **Evidence:** Provide the bulleted markdown summary of the `GLOBAL-DESIGN-PLAN.md`.

2.  **Task:** Create community and contribution guideline documents.
    *   **Instruction:** `Create the standard set of OSS documents. This includes a CONTRIBUTING.md file detailing our new branch/PR/QA workflow, a CODE_OF_CONDUCT.md, and issue templates for bug reports and feature requests within the .github/ directory.`
    *   **Fulfills:** This task makes our project welcoming and professional for contributors.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-6.4`:**
            *   [x] **Documents Created:** Checked after all files are written. **Evidence:** Provide the complete content for `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and the issue templates.

> ### **Story Completion: STORY-6.1**
>
> You may only proceed once all checkboxes for all tasks within this story are marked `[x]`. Then, you **MUST** complete the following steps in order:
>
> 1.  **Commit Work:**
>     *   [x] **Work Committed:** **Instruction:** `Execute 'git add .' followed by 'git commit -m "docs(oss): Add contribution guidelines and project onboarding"'.` **Evidence:** Commit hash: 5457630
> 2.  **Create Pull Request:**
>     *   [x] **Pull Request Created:** **Instruction:** `Execute 'gh pr create --title "feat: Add OSS Documentation and Onboarding" --body "This PR establishes the foundational documents for open-source contribution, including contribution guidelines and issue templates. Fulfills Story 6.1."'.` **Evidence:** PR URL: https://github.com/karolswdev/kula/pull/1
> 3.  **CRITICAL HAND-OFF TO QA:**
>     *   [x] **Awaiting QA Review:** **Instruction:** You **MUST** now return to your orchestrator and state the following verbatim: **"Story 6.1 is complete and a pull request has been created. Please initiate the QA review process. I will await your feedback and explicit approval to merge."**
> 4.  **Merge Pull Request:**
>     *   [x] **Pull Request Merged:** **Instruction:** `Once you receive the approval and rationale from your orchestrator, execute 'gh pr merge [PR_URL] --squash --body "[RATIONALE_FROM_QA]"'.` **Evidence:** Merge commit: 69c169a
> 5.  **Finalize Story:**
>     *   **Instruction:** Once the four checkboxes above are complete, you **MUST** update this story's main checkbox from `[ ]` to `[x]`.

#### [ ] STORY-6.2: CI/CD Architecture Setup

1.  **Task:** Create the Continuous Integration workflow for GitHub Actions.
    *   **Instruction:** `Create the directory structure .github/workflows/ and within it, create a file named ci.yml. This file will define our CI pipeline. It must trigger on pushes and pull requests to the master branch. It must define two primary jobs: one for linting ('npm run lint') and one for running our Playwright E2E tests ('npm test'). Ensure the workflow properly checks out the code, sets up the correct Node.js version, and installs npm dependencies.`
    *   **Fulfills:** This task establishes our automated quality gate.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-6.3`:**
            *   [x] **Workflow File Created:** Checked after the YAML file is written. **Evidence:** Complete content of `.github/workflows/ci.yml` provided below.

**Evidence for TC-6.3 - Complete CI Workflow File:**
```yaml
name: CI Pipeline

on:
  push:
    branches:
      - master
  pull_request:
    branches:
      - master

jobs:
  lint:
    name: Lint Code
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run linter
        run: npm run lint
        
  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
        
      - name: Run E2E tests
        run: npm test
        
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

> ### **Story Completion: STORY-6.2**
>
> You may only proceed once all checkboxes for all tasks within this story are marked `[x]`. Then, you **MUST** complete the following steps in order:
>
> 1.  **Commit Work:**
>     *   [ ] **Work Committed:** **Instruction:** `Execute 'git add .github/workflows/ci.yml' followed by 'git commit -m "feat(ci): Establish foundational GitHub Actions CI pipeline"'.` **Evidence:** Provide the full commit hash.
> 2.  **Create Pull Request:**
>     *   [ ] **Pull Request Created:** **Instruction:** `Execute 'gh pr create --title "feat: Establish CI Pipeline" --body "This PR introduces the foundational GitHub Actions workflow for automated linting and testing. Fulfills Story 6.2."'.` **Evidence:** Provide the URL of the created pull request.
> 3.  **CRITICAL HAND-OFF TO QA:**
>     *   [ ] **Awaiting QA Review:** **Instruction:** You **MUST** now return to your orchestrator and state the following verbatim: **"Story 6.2 is complete and a pull request has been created. Please initiate the QA review process. I will await your feedback and explicit approval to merge."**
> 4.  **Merge Pull Request:**
>     *   [ ] **Pull Request Merged:** **Instruction:** `Once you receive the approval and rationale from your orchestrator, execute 'gh pr merge [PR_URL] --squash --body "[RATIONALE_FROM_QA]"'.` **Evidence:** Provide the full commit hash of the merge commit.
> 5.  **Finalize Story:**
>     *   **Instruction:** Once the four checkboxes above are complete, you **MUST** update this story's main checkbox from `[ ]` to `[x]`.

#### [ ] STORY-6.3: Evolve Software Requirements

1.  **Task:** Update the `REQUIREMENTS.md` file with all new specifications for the grid engine.
    *   **Context:** GLOBAL-DESIGN-PLAN.md - read it thoroughly, then analyze the current code, and the current requirements.md, and then make sure that we upgrade them to that vision in our global design plan.
    *   **Instruction:** `Modify the REQUIREMENTS.md file. Add the new Architectural, Product, and Non-Functional requirements as defined in TC-6.2. When describing the new requirements, you MUST explicitly reference assets from our library (e.g., 'A standard platform block may be visually represented by Cube Bricks.glb or Stone Platform.glb depending on the world theme'; 'A spike trap hazard MUST use the Hazard Spike Trap.glb model'). This level of detail is critical for clarity.`
    *   **Fulfills:** This task aligns our formal requirements with our new strategic vision.
    *   **Verification via Test Cases:**
        *   **Test Case `TC-6.2`:**
            *   [ ] **Requirements Updated:** Checked after the file is modified. **Evidence:** Provide a full `diff` of the `REQUIREMENTS.md` file, showing all additions.

> ### **Story Completion: STORY-6.3**
>
> You may only proceed once all checkboxes for all tasks within this story are marked `[x]`. Then, you **MUST** complete the following steps in order:
>
> 1.  **Commit Work:**
>     *   [ ] **Work Committed:** **Instruction:** `Execute 'git add REQUIREMENTS.md' followed by 'git commit -m "docs(requirements): Evolve requirements for v2 grid engine"'.` **Evidence:** Provide the full commit hash.
> 2.  **Create Pull Request:**
>     *   [ ] **Pull Request Created:** **Instruction:** `Execute 'gh pr create --title "docs: Evolve Requirements for Grid Engine" --body "This PR updates the master software requirements document to reflect the new architecture and features outlined in the Global Design Plan. Fulfills Story 6.3."'.` **Evidence:** Provide the URL of the created pull request.
> 3.  **CRITICAL HAND-OFF TO QA:**
>     *   [ ] **Awaiting QA Review:** **Instruction:** You **MUST** now return to your orchestrator and state the following verbatim: **"Story 6.3 is complete and a pull request has been created. Please initiate the QA review process. I will await your feedback and explicit approval to merge."**
> 4.  **Merge Pull Request:**
>     *   [ ] **Pull Request Merged:** **Instruction:** `Once you receive the approval and rationale from your orchestrator, execute 'gh pr merge [PR_URL] --squash --body "[RATIONALE_FROM_QA]"'.` **Evidence:** Provide the full commit hash of the merge commit.
> 5.  **Finalize Story:**
>     *   **Instruction:** Once the four checkboxes above are complete, you **MUST** update this story's main checkbox from `[ ]` to `[x]`.

---

### **4. Definition of Done**

#### Final Acceptance Gate

*   [ ] **Final Full Regression Test Passed:**
    *   **Instruction:** `Verify that all stories (6.1, 6.2, 6.3) are marked [x], indicating that each has successfully passed its individual QA review and been merged into master.`
    *   **Evidence:** Provide a final summary statement confirming all three stories have been completed and merged.
*   **Final Instruction:** Once the final verification is complete, change `[ ] PHASE-6` to `[x] PHASE-6`.