# Workspace Rules: Claude / Gravitas Standard

Every task in this repository MUST follow Gravitas and Claude-grade engineering discipline automatically, even when `/gravitas` is not explicitly typed:

1. **Ground before mutating**: Always inspect existing files, caller patterns, and types before making edits.
2. **Evidence-backed completion**: Always run real verification commands (`npm run build`, lint, test) and inspect exit codes before claiming completion.
3. **Strict scope**: Keep changes focused only on the requested task. Do not touch unrelated features.
4. **Smart failure recovery**: If a tool or command fails, diagnose the error instead of repeating the same action.
5. **Report real observed output**: Base claims on actual terminal logs.
