# Contributing to Kula Browser

Thank you for your interest in contributing to Kula Browser! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

Please note that this project is released with a [Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## Development Process

We follow a structured development process to maintain code quality and project consistency:

### 1. Branching Strategy

- **Main Branch**: `master` - The stable, production-ready code
- **Feature Branches**: Created for each story/feature using the naming convention:
  - `story/[STORY-ID]-[short-title]` for story implementations
  - `feature/[description]` for standalone features
  - `bugfix/[issue-number]-[description]` for bug fixes
  - `docs/[description]` for documentation updates

### 2. Development Workflow

1. **Start from Master**: Always create your branch from the latest `master`
   ```bash
   git checkout master
   git pull origin master
   git checkout -b story/6.1-your-feature
   ```

2. **Make Changes**: Implement your changes following our coding standards
   - Write clean, self-documenting code
   - Include appropriate comments for complex logic
   - Follow the existing code style and patterns
   - Ensure all tests pass

3. **Commit Guidelines**: Use conventional commit messages
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `style:` for formatting changes
   - `refactor:` for code refactoring
   - `test:` for test additions/changes
   - `chore:` for maintenance tasks

   Example: `feat(physics): Add gravity reorientation system`

4. **Testing**: Ensure all tests pass before submitting
   ```bash
   npm run lint
   npm test
   ```

### 3. Pull Request Process

1. **Create Pull Request**: Once your changes are ready, create a PR to `master`
   - Use a clear, descriptive title
   - Reference any related issues or stories
   - Provide a comprehensive description of changes
   - Include evidence of testing (screenshots, test results, etc.)

2. **QA Review Process**: All PRs undergo QA review
   - Automated CI checks must pass (linting, tests)
   - Manual QA review for functionality
   - Code review for quality and standards
   - Documentation review for completeness

3. **Merge**: After approval, PRs are squash-merged to maintain a clean history

## Coding Standards

### JavaScript/TypeScript
- Use ES6+ features where appropriate
- Prefer `const` over `let`, avoid `var`
- Use meaningful variable and function names
- Keep functions small and focused (single responsibility)
- Use JSDoc comments for public APIs

### Three.js Specific
- Dispose of geometries, materials, and textures when no longer needed
- Use object pooling for frequently created/destroyed objects
- Optimize render calls and draw calls
- Follow Three.js best practices for performance

### File Organization
```
src/
├── core/           # Core game engine modules
├── entities/       # Game entities (player, enemies, etc.)
├── levels/         # Level data and loaders
├── physics/        # Physics system
├── rendering/      # Rendering utilities
├── ui/            # User interface components
└── utils/         # Utility functions
```

## Testing Guidelines

### Unit Tests
- Write tests for all new functionality
- Aim for high code coverage (>80%)
- Use descriptive test names that explain what is being tested
- Follow the Arrange-Act-Assert pattern

### E2E Tests
- Use Playwright for end-to-end testing
- Test critical user journeys
- Include both happy path and error scenarios
- Ensure tests are deterministic and reliable

## Documentation

- Update README.md if adding new features or changing setup instructions
- Document complex algorithms or non-obvious code
- Keep API documentation up to date
- Update REQUIREMENTS.md when requirements change
- Include examples where helpful

## Getting Started

1. **Fork the Repository**: Create your own fork of the project

2. **Clone Your Fork**:
   ```bash
   git clone https://github.com/YOUR-USERNAME/kula-browser.git
   cd kula-browser
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Run Development Server**:
   ```bash
   npm start
   ```

5. **Run Tests**:
   ```bash
   npm test
   npm run lint
   ```

## Reporting Issues

Use our issue templates to report bugs or request features:
- [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md)
- [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md)

When reporting issues:
- Search existing issues first to avoid duplicates
- Provide clear reproduction steps for bugs
- Include relevant system information
- Attach screenshots or videos when helpful

## Questions?

If you have questions about contributing, feel free to:
- Open a discussion in the GitHub Discussions tab
- Review existing documentation in the `docs/` folder
- Check the project wiki for additional resources

Thank you for helping make Kula Browser better!