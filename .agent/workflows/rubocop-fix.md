---
description: Systematically fix RuboCop offenses listed in .rubocop_todo.yml
---

# RuboCop Fix Workflow

Use this workflow to safely resolve technical debt from `.rubocop_todo.yml`.

## 1. Analysis
- Read `natal_karta_backend/.rubocop_todo.yml` to identify prioritized offenses.
- Standard order of fixing:
    1. **Style**: Easiest to fix, often automated.
    2. **Layout**: Visual consistency.
    3. **Lint**: Potential bugs or anti-patterns.
    4. **Metrics**: Complex refactoring (BlockLength, MethodLength).

## 2. Selection
- Choose ONE cop from the TODO list.
- Run `bundle exec rubocop --only [CopName]` to see affected files.

## 3. Implementation
// turbo
- Attempt safe autocorrect first: `bundle exec rubocop -a --only [CopName]`.
- If manual intervention is needed, use `@[backend-specialist]` to refactor.
- Verify changes by running the specific cop again.

## 4. Verification
- Ensure the application still boots: `bundle exec rails runner "puts 'OK'"`.
- Run tests: `bundle exec rails test`.

## 5. Cleanup
- Update `.rubocop_todo.yml` by running `bundle exec rubocop --auto-gen-config`.
- Commit changes with clear messages (e.g., `refactor: fix RuboCop Metrics/BlockLength in [File]`).
