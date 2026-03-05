# PLAN: Удаление входа

## Objective
Remove the "already have an account" (уже есть аккаунт) text and the corresponding login (Войти) button from all screens in the application.

## Mapped Affected Areas
Based on the codebase analysis, the login link is only present in one file:
- `NatalKartaExpo/src/screens/OnboardingScreen.tsx` (around line 777)
  ```tsx
  Уже есть аккаунт? <Text style={styles.signInLink} onPress={() => { }}>Войти</Text>
  ```

## Proposed Changes
1. **OnboardingScreen:** Remove the text "Уже есть аккаунт?" and the `<Text>` component for "Войти" from the render method.
2. **Cleanup:** Ensure that any unused styles (like `signInLink`) or unused imports related to this button are also removed to adhere to clean code principles.

## Next Steps
Upon user approval, the Orchestrator will:
1. Setup a worktree environment for the `frontend-specialist` (or `mobile-developer` since it's an Expo app).
2. Execute the changes in isolation.
3. Merge and verify the changes.
