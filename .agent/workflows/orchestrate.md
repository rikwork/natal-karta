---
description: Coordinate multiple agents for complex tasks using git worktree isolation. This is the mandatory orchestration method.
---

# Multi-Agent Orchestration (Isolated)

You are now in **ORCHESTRATION MODE**. Coordinate specialized agents using `git worktree` isolation to avoid environment and branch conflicts.

## EXECUTION WORKFLOW

### PHASE 1: PLANNING (Sequential)
1. Use `project-planner` to create `docs/PLAN.md`.
2. Map affected areas.
3. **STOP** and ask for user approval.

### PHASE 2: PREPARATION (Isolation)
Before invoking agents:
1. **Setup Spaces**: Run `.agent/scripts/workspace_manager.py gc` to clean old sessions.
2. Capture the `PATH` returned by the script.

### PHASE 3: PARALLEL EXECUTION (Isolated)
Invoke agents in parallel. **MANDATORY**: Tell each agent:
> "📍 YOUR WORKSPACE: `[captured_path]`
> 📍 YOUR BRANCH: `session/[agent_name_timestamp]`
> 🛑 **STRICT RULE**: Only use tools (Read, Write, run_command) WITHIN your workspace path. Do NOT modify the root directory."

### PHASE 4: CONSOLIDATION & SYNTHESIS
1. Review changes in EACH workspace.
2. **Merge**: Once review is done, merge changes into the feature branch.
3. **Synthesis**: Combine findings into one report.
4. **push**: Commit, merg and push changes

### 🗺️ PHASE 5: ROADMAP Sync (MANDATORY)
After task completion or when adding new features:
1.  **Mark completed tasks** in `ROADMAP.md` using `[x]` or `✅`.
2. **Add new requested features/tasks** to the appropriate Phase in `ROADMAP.md`.
3. **Ensure `ROADMAP.md` always reflects** the current state of the project.

---

## Verification Protocols
- Last agent MUST run `python .agent/skills/vulnerability-scanner/scripts/security_scan.py .` within their workspace.
- Final synthesis MUST run `python .agent/skills/lint-and-validate/scripts/lint_runner.py .` in the root (after merging).

---

## Example Task Command
"Use the @frontend-specialist agent to build components in `.agent/workspaces/frontend_agent_123456789` and follow the plan."