---
description: Coordinate multiple agents for complex tasks using git worktree isolation. This is the mandatory orchestration method.
---

# Multi-Agent Orchestration (Isolated)

You are now in **ORCHESTRATION MODE**. Coordinate specialized agents using `git worktree` isolation to avoid environment and branch conflicts.

## 🔴 CRITICAL: Isolation Protocol

> ⚠️ **NO PARALLEL AGENTS WITHOUT ISOLATION**
> 
> Parallel agents must NEVER work in the same physical folder. If they do, they WILL step on each other's git state.

---

## EXECUTION WORKFLOW

### PHASE 1: PLANNING (Sequential)
1. Use `project-planner` to create `docs/PLAN.md`.
2. Map affected areas.
3. **STOP** and ask for user approval.

### PHASE 2: PREPARATION (Isolation)
Before invoking any parallel agents:
1. **Garbage Collection**: Run `.agent/scripts/workspace_manager.py gc` to clean old sessions.
2. **Setup Spaces**: For each parallel task, run `python3 .agent/scripts/workspace_manager.py setup [agent_name]`.
3. Capture the `PATH` returned by the script.

### PHASE 3: PARALLEL EXECUTION (Isolated)
Invoke agents in parallel. **MANDATORY**: Tell each agent:
> "📍 YOUR WORKSPACE: `[captured_path]`
> 📍 YOUR BRANCH: `session/[agent_name_timestamp]`
> 
> 🛑 **STRICT RULE**: Only use tools (Read, Write, run_command) WITHIN your workspace path. Do NOT modify the root directory."

### PHASE 4: CONSOLIDATION & SYNTHESIS
1. Review changes in EACH workspace.
2. **Merge**: Once review is done, merge changes into the feature branch.
3. **Synthesis**: Combine findings into one report.
4. **Git cleanup (MANDATORY)**: After merge, run `git status` in the root. Stage and commit ANY unstaged or untracked files that belong to the task. Do NOT leave dangling changes.
5. **Cleanup**: Let the 7-day GC rule handle the cleanup unless you want to call `workspace_manager.py cleanup [path]` explicitly.

### 🗺️ PHASE 5: ROADMAP Sync (MANDATORY)
The orchestrator is responsible for maintaining the state of tasks in `ROADMAP.md`:
1.  **Mark tasks as IN PROGRESS** (`[/]`) when agents are invoked and work begins.
2.  **Mark tasks as COMPLETED** (`[x]` or `✅`) after synthesis and successful verification.
3. **Add new requested features/tasks** to the appropriate Phase in `ROADMAP.md`.
4. **Ensure `ROADMAP.md` always reflects** the current state of the project.

---

## Verification Protocols
- Last agent MUST run `python .agent/skills/vulnerability-scanner/scripts/security_scan.py .` within their workspace.
- Final synthesis MUST run `python .agent/skills/lint-and-validate/scripts/lint_runner.py .` in the root (after merging).

---

## Example Task Command
"Use the @frontend-specialist agent to build components in `.agent/workspaces/frontend_agent_123456789` and follow the plan."
