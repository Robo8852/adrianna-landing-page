# Trajectory Engineering: The SCRUB Method

**For: Richard**
**From: Leo**
**Framework credit: Roman (Machine Coaching)**

You know PowerShell. You know Python. You already think in shells. This doc does two things: (1) makes the case for running Claude Code from the terminal instead of the desktop app, and (2) teaches you the workflow — trajectory engineering — that keeps you from ever hitting your usage limits.

The second part is the one that actually matters. Read it even if you ignore the first.

---

## Part 1: Why the terminal (the honest version)

Straight up: the Claude Code desktop app and the terminal CLI run the **same engine**. Same models, same slash commands, same local session files. Nobody's going to tell you the desktop app is missing features, because it isn't.

So why switch? Because you're a shell guy, and the CLI fits how you already work:

- **It runs where you are.** `cd` into any repo, type `claude`, done. No separate window, no app switching. It's another tool in your terminal alongside `git`, `ssh`, and everything else.
- **It's scriptable.** `claude -p "summarize the failed logins in this log"` runs headless and prints to stdout. You can pipe into it, pipe out of it, and put it in scripts. The desktop app can't be a pipeline stage.
- **It works over SSH.** Remote box, jump host, a server with no GUI — anywhere you have a shell, you have Claude Code. For security work that's not a nice-to-have.
- **It keeps you close to the metal.** You see exactly what it's running before you approve it. For someone whose job is knowing what code actually executes on a machine, that's the right default posture.

### The Python multiplier (this part's for you)

You write Python. Here's what that's worth once Claude Code lives in your terminal:

- **Claude writes the script AND runs it, in one breath.** "Parse this auth log, give me failed logins grouped by source IP, flag anything over 50 attempts" — it writes the Python, executes it right there, and shows you the results. No editor, no save-and-switch, no ceremony. You review the code before it runs, tweak the ask, done in two minutes.
- **Real example:** Leo asked how many tokens his sessions were burning. Claude wrote a Python script on the spot that crunched 138 session files and produced a full usage report — totals, per-session breakdown, cost math — in about thirty seconds. Nobody opened an IDE.
- **Your one-off security chores become one-liners.** Parse nmap XML into a CSV. Dedupe a pile of IOCs across three feeds. Decode that base64-in-base64 garbage from a phishing sample. Hit an API and reshape the JSON. These are all "describe it, review it, run it" tasks now.
- **It debugs your existing tools where they live.** `cd` into your scripts folder, run `claude`, and say "this script chokes on IPv6 addresses, fix it." It reads the actual file, finds the problem, patches it, and can run your tests — no copy-pasting code into a chat window and pasting fixes back.
- **It composes with everything else in your shell.** `python recon.py | claude -p "anything unusual in this output?"` — your scripts and Claude become pipeline stages in the same one-liner. That's the thing no GUI can ever give you.

The pattern: you stop being the person who *types* the Python and become the person who *directs and reviews* it. Your Python knowledge doesn't get less valuable — it's exactly what lets you review at a glance and catch when the model's wrong.

The desktop app is fine. The terminal is *yours*.

--- 

## Part 2: Setup on Windows (PowerShell)(THis for leo you dont have to read this./)

You may already have this — skim and verify.

**Install (native, no Node required):**

```powershell
irm https://claude.ai/install.ps1 | iex
```

**Or via npm if you have Node:**

```powershell
npm install -g @anthropic-ai/claude-code
```

**First run:**

```powershell
cd C:\path\to\your\project
claude
```

It'll walk you through logging in with your Claude account (Pro/Max subscription) the first time. After that, `claude` from any directory just works.

**Three commands to verify you're alive:**

| Command | What it shows |
|---|---|
| `/model` | Which model you're on (and lets you switch) |
| `/context` | How full your context window is **(this is the number trajectory engineering runs on)** |
| `/usage` | Your session and weekly limit gauges |

---

## Part 3: The problem trajectory engineering solves

Here's the mechanic almost nobody understands, and it's why people blow through their limits:

**Every message you send, the model re-reads the entire conversation so far.** All of it. Every file it opened, every command output, every tangent — re-read on every single turn.

So the cost of a session isn't linear, it compounds:

- At 30k tokens of context, each message is cheap.
- At 100k, every message costs roughly 3x more than it did at the start.
- At 180k, you're paying a heavy tax on every keystroke, and — worse — **the model gets dumber.** Long contexts dilute its attention. You pay more for worse answers.

Real numbers from Leo's machine: in one week his sessions generated **6M tokens of output** but **353M tokens of context re-reads**. The re-reading is 98% of the bill. The conversation length, not the work itself, is what drains your limits.

**Trajectory engineering is managing the length and quality of your context window on purpose.** That's the whole discipline.

---

## Part 4: The 80k–140k rule

The operating rule, as practiced:

1. **Work freely below 80k.** Don't think about it. Check `/context` occasionally.
2. **Between 80k and 140k, you're in the decision zone.** Finish your current task and make a move (see SCRUB below).
3. **Never ride past 140k.** At that point you burn — `/clear` — no exceptions. If the task isn't done, you write a handoff doc first (Part 5, Upload).

Why these numbers: below 80k the model is sharp and messages are cheap. Past 140k you're deep into the expensive-and-dumber zone. The window between is where you find a clean breakpoint instead of getting forced into a messy one.

---

## Part 5: The SCRUB framework

Five moves. Each one is a different way to control your trajectory.

| Letter | Action | Command | When |
|---|---|---|---|
| **S** | Spawn | Subagents | Isolated tasks |
| **C** | Cut | `Esc Esc` / `/rewind` | Surgical trimming |
| **R** | Reduce | `/compact` | Mid-session compression, keep the gist |
| **U** | Upload | Handoff document | Managed transitions |
| **B** | Burn | `/clear` | Clean breakpoints |

### S — Spawn (subagents for isolated tasks)

When a sub-task is self-contained — "search the codebase for every place auth tokens get logged," "audit this dependency list" — don't do it in your main conversation. Ask Claude to **use a subagent** (just say "use a subagent to...").

The subagent does the dirty work in its *own* context window and returns only the conclusion to yours. A search that would have dumped 40k tokens of file contents into your session comes back as a 500-token summary. Your trajectory stays clean.

**Rule of thumb:** if the task would fill your screen with output you'll only read once, spawn it.

### C — Cut (rewind when the model goes sideways)

You'll see it happen: the model latches onto a wrong theory and starts building on it. Every turn it continues down that path is wasted context *and* it poisons future answers, because the model re-reads its own bad reasoning as if it were established fact.

Don't argue with it — **cut**. Hit `Esc Esc` (or type `/rewind`) and jump back to the message before the wrong turn. The bad branch is gone from history like it never happened. Re-ask with better wording.

Arguing costs you 10k tokens of back-and-forth. Cutting costs zero.

### R — Reduce (compress mid-task)

`/compact` summarizes the conversation so far and replaces the full history with the summary. Context drops dramatically; the gist survives.

Use it when you're mid-task at ~100k+ and there's no clean breakpoint — you need the *decisions* made so far but not the 60k tokens of command output behind them. It's lossy, so don't compact away details you'll need verbatim (exact error messages, specific configs). For everything else, the summary is enough.

### U — Upload (the handoff document)

The pro move for when a task is bigger than one session. Before you burn, have Claude write a handoff file, then start fresh and feed it back. Say:

> "Write a handoff document to `HANDOFF.md` covering: what we're trying to accomplish, what's been done so far, key decisions and why, exact file paths and commands involved, current blockers, and the immediate next step. Write it for a fresh session with zero context."

Then `/clear`, and open the new session with:

> "Read HANDOFF.md and continue."

**Handoff template** (what a good one contains):

```markdown
# Handoff — [task name] — [date]

## Objective
One paragraph: what done looks like.

## State
- What's complete (with file paths)
- What's in progress
- What's untouched

## Key decisions
- [Decision]: [why] — so the next session doesn't relitigate it

## Critical details
Exact strings that must survive verbatim: error messages,
config values, commands that worked, commands that failed and why.

## Next step
The single first action the fresh session should take.
```

A 2k-token handoff replaces a 130k-token history. The fresh session is sharper than the old one was, because it's reading a clean brief instead of wading through the journey.

### B — Burn (clear at clean breakpoints)

`/clear` wipes the conversation. Full reset, fresh window, model at maximum sharpness.

Burn at every natural boundary: task finished, bug fixed, question answered. Don't carry a dead task's context into a new task "just in case" — that's paying rent on a room you moved out of. If there's genuinely unfinished state, that's what Upload is for. Otherwise: burn and move on.

This is the move you'll use most. The 80k–140k rule mostly resolves to: *finish the thing, burn, start clean.*

---

## Part 6: A typical session, start to finish

1. `cd` into the project, run `claude`.
2. Work the task. Spawn subagents for any bulk searching or auditing.
3. Model starts reasoning down a wrong path → `Esc Esc`, cut the branch, re-prompt.
4. Glance at `/context` when things feel long. Under 80k? Keep going.
5. Cross into the 80–140k zone → wrap up the current piece.
   - Task done → **Burn** (`/clear`).
   - Task continues but history is bloated → **Reduce** (`/compact`) or **Upload** (handoff doc, then burn).
6. Repeat. Check `/usage` once a day out of curiosity, then ignore it — if you're running this loop, the weekly bar barely moves.

---

## Part 7: Reading `/usage` — a real session, annotated

This is actual output from one of Leo's sessions (the one where this doc was written), with notes on what each piece means.

```
Session
  Total cost:            $3.10
  Total duration (API):  9m 25s
  Total duration (wall): 1h 36m 24s

  Usage by model:
      claude-haiku-4-5:  34.6k input, 2.5k output, 146.8k cache read  ($0.15)
     claude-sonnet-4-6:    346 input, 543 output,   36.2k cache read  ($0.04)
        claude-fable-5:   4.9k input, 19.5k output,  1.1m cache read  ($2.92)

  Current session
  ███████████████████▌                               39% used
  Resets 2:30pm

  Current week (all models)
  ██                                                  4% used
  Resets Jun 13, 5am

  What's contributing to your limits usage?
  68% of your usage came from subagent-heavy sessions
  21% of your usage came from MCP server "firecrawl"
```

**How to read it, top to bottom:**

- **$3.10 total, and Fable is $2.92 of it.** Look at *why*: Fable's output was only 19.5k tokens, but its **cache reads were 1.1 million**. That's the re-reading mechanic from Part 3, live. The conversation ran long (a 1.5-hour session), so every message re-read the whole history. The work was cheap; the *carrying* of context was the cost.
- **Haiku did more raw work than you'd guess (147k cache reads) for $0.15.** Cheaper models doing isolated chores — that's the Spawn principle paying off. The expensive model thinks; cheap models fetch.
- **Session bar: 39%.** The 5-hour tank. Even if you drain it, it refills the same afternoon. Don't sweat this one.
- **Week bar: 4%.** The only number that decides whether you "run out." At 4% mid-week, the answer is: not even close. This session started the week at 2% — an hour and a half of heavy use, with documents written and software installed, moved it two points.
- **The "contributing" section is your diagnosis, not your bill.** Here it flags that subagent-heavy sessions and the firecrawl MCP server (web scraping — its results sit in context for the rest of the session) are the big drivers. If the weekly bar ever climbs faster than you like, this section tells you which habit to adjust — usually it means: `/clear` after web-research-heavy stretches, because those tool results are dead weight being re-read every turn afterward.

**The takeaway from this example:** one long-running session at high context cost $2.92; the same work split into two or three SCRUB cycles would have cost roughly half that. The meter doesn't punish working hard — it punishes carrying a long conversation.

---

## Part 8: The orchestrator pattern (Spawn, scaled up)

Once you're comfortable with subagents, this is the workflow for real builds. The idea: your main session stops being the worker and becomes the **orchestrator** — it plans, delegates, and reviews. The subagents do the actual build.

**How it works:**

1. **Your main session is the brain.** Run it on the smart model (Fable or Opus). It holds the plan, makes the decisions, and dispatches subagents for the build work.
2. **Subagents are the hands — put them on cheap models.** Haiku for simple chores (searching, file reads, boilerplate), Sonnet for heavier lifts. **Never run subagents on Fable.** Subagents chew through tokens in bulk — that's their job — and at Fable's 2× pricing they will murder your usage. One smart brain, many cheap hands.
3. **Size your tasks to the window.** Plan the build so each work package lands complete by the time the orchestrator hits 80–90k. Don't start something at 70k that needs 40k to finish.
4. **At 80–90k: burn the orchestrator.** The subagents' work product is in files on disk — the orchestrator's chat history is just management chatter about work that's already done. Clear it, brief a fresh orchestrator (handoff doc if mid-build), keep going.

**Setting subagent models in practice:** the simple way is to just say it in your prompt — "use a haiku subagent to search the codebase for X." For recurring roles, define custom agents in `.claude/agents/` with a `model: haiku` line in the frontmatter, and they'll always run cheap.

**Why this works when you're driving interactively:** you're sitting in front of it, so *you* are the persistence layer — you see what's done, you decide what's next, you trigger the burn. No automation needed. The orchestrator stays sharp because it never carries the build debris, the build stays cheap because Haiku is doing the bulk reading, and your weekly bar barely moves while real work ships.

---

## Quick reference

| Situation | Move | Command |
|---|---|---|
| Bulk search/audit incoming | Spawn | "use a haiku subagent to..." |
| Real build, many moving parts | Orchestrate | smart model directs, Haiku/Sonnet subagents build, burn at 80–90k |
| Model went down a wrong path | Cut | `Esc Esc` or `/rewind` |
| Mid-task, context bloated, no breakpoint | Reduce | `/compact` |
| Big task needs to span sessions | Upload | handoff doc → `/clear` → "read HANDOFF.md" |
| Task done | Burn | `/clear` |
| "How full am I?" | Check | `/context` |
| "How close to my limit am I?" | Check | `/usage` |

**The one-line version: keep your context between fresh and 140k, never argue with a derailed model, and treat `/clear` as a power move, not a loss.**
