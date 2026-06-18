# Orchestration Plan: Update Onboarding Button Text

## Objective
Change the "Continue" button text to "Продолжить" during the onboarding flow.

## Affected Areas
- `/Users/nikita/projects/natal_karta/NatalKartaExpo/src/screens/OnboardingScreen.tsx` (Line 168)

## Execution Phases
**Phase 1: Planning**
- [x] Create this PLAN.md
- [ ] Receive user approval

**Phase 2: Preparation**
- [ ] Run `.agent/scripts/workspace_manager.py gc` to set up isolated workspace (if user approves full orchestration).

**Phase 3: Execution**
- [ ] Delegate the `mobile-developer` agent to update the text in `OnboardingScreen.tsx` inside the isolated workspace.

**Phase 4 & 5: Consolidation & Roadmap Sync**
- [ ] Merge changes back to root and sync `ROADMAP.md`

> **Note to User:** Since this is a very simple change (one word in one file), a full isolated `git worktree` orchestration might be overkill and slow down execution. Would you still like to proceed with the full isolated `/orchestrate` workflow, or should we execute this directly in the current directory?
