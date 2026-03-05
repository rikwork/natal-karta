# PLAN: DaData Refactor Final Polish & Cleanup

## Goal
Finalize the migration to DaData with consistent naming and results limit, purging all non-related changes.

## Steps

### 1. Frontend Consistency (frontend-specialist)
- **File**: `NatalKartaExpo/src/services/api.ts`
- **Action**: Update `max_rows` from `20` to `5` to match backend speed optimization.
- **Acc**: Frontend request sends `max_rows=5`.

### 2. UI Robustness (frontend-specialist)
- **File**: `NatalKartaExpo/src/screens/OnboardingScreen.tsx`
- **Action**: Ensure the error handling gracefully clears the list if the server fails.
- **Acc**: UI doesn't hang on search failure.

### 3. Verification (test-engineer)
- **Action**: Run Rails tests for `DadataGeocodingService` and `CitiesController`.
- **Acc**: All tests pass.

### 4. Cleanup Verification (explorer-agent)
- **Action**: Ensure NO "Firebase" or "Native SDK" related changes exist in this PR/branch compared to `main`.
- **Acc**: `git diff main` only shows DaData-related files.

---

## Deliverables
- Cleaned and consistent DaData search implementation on both sides.
- Clean PR branch containing ONLY DaData refactor.
