# Claude Code Agent Team — RCS Website

Five specialized agents for the rcs-website-live repo. Each is narrow on purpose — they catch what they're best at, and they don't step on each other's responsibilities.

## Install

These agent files belong in `.claude/agents/` inside the rcs-website-live repo. Copy them in:

```powershell
# From PowerShell on Justin's laptop:
mkdir C:\Users\Jmorr\rcs-website-live\.claude\agents -Force
Copy-Item C:\Users\Jmorr\Desktop\RCS-Gutters\claude-agents-staging\*.md C:\Users\Jmorr\rcs-website-live\.claude\agents\
```

After copying, commit them to the repo:
```powershell
cd C:\Users\Jmorr\rcs-website-live
git add .claude
git commit -m "chore: add Claude Code agent team for code review and funnel validation"
git push
```

## Roster

| Agent | Use when | What it catches |
|---|---|---|
| `code-reviewer` | Before merging any non-trivial PR | Bugs, edge cases, security issues, RCS coding conventions |
| `funnel-validator` ⭐ | After any change to /api/quote, /free-estimate, MultiStepForm.tsx, Tracking.astro | Funnel breakage — wrong endpoint, missing event_callback, broken redirect, dataLayer payload changes |
| `build-validator` | Before every commit | TypeScript errors, missing imports, broken build, dependency issues |
| `content-checker` ⭐ | After any copy/marketing change | Banned claims (BBB A+, VA Class A, "Scott personal"), banned symbols in ad text, missing SMS opt-out language |
| `vision-tester` | After deploy completes | Live page renders correctly at 375/768/1280 viewports, no broken images, scripts loaded |

⭐ = RCS-specific (not generic agents — they encode rules from this codebase's history of breakage)

## Standard workflow when shipping a non-trivial change

```
1. Main agent makes the change
2. Spawn build-validator → must PASS before continuing
3. Spawn code-reviewer → must APPROVE before opening PR
4. If funnel paths touched → spawn funnel-validator → must PASS
5. If marketing copy touched → spawn content-checker → must APPROVE
6. Open PR via `gh pr create --fill --base main`
7. Merge PR via `gh pr merge --squash --delete-branch`
8. After Vercel deploy completes → spawn vision-tester → must PASS
9. Report back to user with summary
```

For trivial changes (typo fixes, comment-only edits) — skip steps 2-5, just commit and push.

## Adding a new agent

If you want to add a new specialist (e.g., `seo-auditor`, `lighthouse-runner`, `accessibility-checker`):

1. Create a new `.md` file in `.claude/agents/` following the same frontmatter format (name, description, tools)
2. Define exactly what it checks and what it doesn't
3. Use one of the existing 5 as a template
4. Test it on a small change first
5. Document it in this README

## Don't do

- Don't have an agent both review AND fix — separation prevents agents from rubber-stamping their own work
- Don't make agents too broad — narrow scope is what makes them effective
- Don't run agents on trivial changes (overhead > benefit)
- Don't ignore agent FAIL verdicts — if they're wrong, refine the agent definition, don't just override

## When agents disagree

If two agents return conflicting verdicts (e.g. code-reviewer APPROVE but funnel-validator FAIL), trust the more specific one. Funnel-validator is purpose-built for funnel paths, so its FAIL takes precedence over code-reviewer's APPROVE.
