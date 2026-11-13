# Setup Guide — AI-Powered Documentation Mastery
## Tech Writer's Tribe | Prerequisites and Installation

**Read this guide once before installing anything.** Plan for about 60 minutes the first time through.

---

## Choose your track first

This program runs two ways. Pick one before you install anything.

| | Writers' track (Claude.ai web) | Engineering track (Claude Code) |
|---|---|---|
| **Covers** | Days 1–5 fully; day 7 publishes from the browser | All 8 days, including plugins, local MCP servers, and LSP |
| **You need** | A Claude account and a browser | Everything in this guide (steps 1–9) |
| **Setup time** | ~5 minutes | ~60 minutes |
| **Accounts** | Claude account (plus GitHub for day 7) | Claude, GitHub, and Atlassian accounts |

**Writers' track setup, in full:**

1. Go to [claude.ai](https://claude.ai) and sign in (Pro, Max, Team, or Enterprise is needed for custom Skills).
2. Open **Customize → Skills** and confirm you can add a Skill. If it is greyed out, ask your Team or Enterprise admin to enable custom Skills, code execution, and file creation.
3. Create a **Project** (you will use it from day 1).
4. For day 7, have a free [GitHub](https://github.com) account ready.

That is all the writers' track needs for days 1–5. The rest of this guide is the engineering track. See the [Claude.ai web-interface guide](workshop-site/claude-web-guide.html) for how each command-line step maps to the browser.

> **The two tracks can share a room.** Writers' track participants pair with an engineering-track partner for the plugin and server exercises in days 4, 6, and 8.

---

## Before You Start: Required Prerequisites

Before beginning the workshop, install and confirm the following tools and accounts:

| # | Requirement | Why it's required |
|---|-------------|------------------|
| 1 | Cursor IDE | Your editor for writing, reading project files, and working with MCP-related projects |
| 2 | Node.js 18+ (LTS recommended) | Required to build and run the sample project and MCP server exercises |
| 3 | Git | Required to clone the training repository and manage your work |
| 4 | GitHub account | Needed to access the course repo and publish work when required |
| 5 | Atlassian account | Required for the Atlassian MCP exercise in Module 5 (Jira/Confluence access) |
| 6 | Claude Code CLI | The CLI used throughout the workshop for skills, plugins, and agent workflows |
| 7 | Course training repo | The workshop materials, sample project, and starter exercise files |

> You need both Cursor and Claude Code CLI. They are separate tools. Cursor is for editing files; Claude Code is the command-line AI shell used in the course.

---

## System Requirements

| Requirement | Minimum | Recommended |
|---|---|---|
| OS | macOS 12+, Windows 10+, Ubuntu 20.04+ | macOS 14+ or Ubuntu 22.04+ |
| RAM | 8 GB | 16 GB |
| Storage | 5 GB free | 10 GB free |
| Internet | Stable broadband | Required throughout the course |

> **Windows users:** Use [Windows Terminal](https://aka.ms/terminal) or [Git Bash](https://git-scm.com/downloads) instead of Command Prompt. The primary sidebar and toolbar in Cursor/VS Code sit in different places than on macOS — if you cannot find a panel by its icon, open it by name from the Command Palette (`Ctrl+Shift+P`).

> **Mac users — check your chip first.** Apple menu → **About This Mac**. If it says **Apple M1/M2/M3**, you have Apple Silicon; if it says **Intel**, you have an Intel Mac. Several install commands differ between the two (see Step 3 and Troubleshooting). Intel Macs work fine for this course; very old Intel Macs may be limited to older tool versions, which is also fine.

---

## Step 1 — Install Cursor IDE

1. Go to [cursor.com](https://cursor.com)
2. Download the installer for your OS and run it (accept defaults)
3. Launch Cursor and sign in with GitHub or Google (free tier is fine)

**Recommended extensions** (open the Extensions panel: `Cmd+Shift+X` / `Ctrl+Shift+X`):
- **Markdown All in One** — better markdown editing
- **YAML** — for configuration files
- **GitLens** — Git history inside the editor

**Verify:** Cursor opens and you can create a new file (`Cmd+N` / `Ctrl+N`). Done.

> **Why Cursor for this course?** Cursor supports the Model Context Protocol natively via `.cursor/mcp.json`, which is used in the later workshop modules.

---

## Step 2 — Install Node.js (LTS)

### macOS
- Installer: download the **LTS** `.pkg` from [nodejs.org](https://nodejs.org) and run it
- Or with Homebrew: `brew install node`

### Windows
1. Download the **LTS Windows Installer (.msi)** from [nodejs.org](https://nodejs.org)
2. Run it — check **"Automatically install necessary tools"** when prompted
3. Close and reopen your terminal afterward

### Linux (Ubuntu/Debian)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Verify** (in a terminal — Cursor's built-in terminal works fine, open with `` Ctrl+` ``):
```bash
node --version    # v20.x.x or higher (v18+ is acceptable)
npm --version     # 9.x.x or higher
```

If `node` is not found, close and reopen the terminal.

---

## Step 3 — Install Git

### macOS (Apple Silicon and Intel)
Git usually ships with the Xcode Command Line Tools. First try:
```bash
git --version
```
If it prints a version, Git is installed — skip ahead. If not, you'll be prompted to install the developer command line tools — click **Install**. That alone is enough for this course; you do not need Homebrew.

**Prefer Homebrew?** `brew` lives in a different place depending on your chip, and this trips up a lot of copied commands:
- **Apple Silicon (M1/M2/M3):** Homebrew installs to `/opt/homebrew`. `brew install git` works as documented.
- **Intel Mac:** Homebrew installs to `/usr/local`. The one-line installer on brew.sh still works, but snippets that hard-code `/opt/homebrew` will fail. If `brew` is "command not found" after installing, add it to your PATH: `echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zshrc && source ~/.zshrc`.

**Homebrew won't install on an older Intel Mac?** Use the Xcode Command Line Tools above (simplest), or MacPorts — see Troubleshooting, "Git won't install on an Intel Mac."

### Windows
1. Download from [git-scm.com/download/win](https://git-scm.com/download/win)
2. During install, choose **"Git from the command line and also from 3rd-party software"**
3. Choose **"Checkout Windows-style, commit Unix-style"**

### Linux
```bash
sudo apt-get install git
```

### Configure Git (all platforms — required)
```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

**Verify:** `git --version` shows `git version 2.x.x`.

---

## Step 4 — Create a GitHub Account

If you don't already have one: sign up at [github.com](https://github.com) and verify your email. That's it.

---

## Step 5 — Create an Atlassian Account

This is needed for the Atlassian MCP server exercise in Module 5, where Claude connects to Jira and Confluence.

1. Go to [id.atlassian.com](https://id.atlassian.com/) and sign up or sign in
2. If you already have an Atlassian account, use it. If not, create a personal Atlassian account that you can access during the workshop
3. If needed, create or join a Jira project and Confluence space for the workshop exercises
4. Keep your login ready — Claude Code will prompt you to authorize access when the Atlassian MCP server is configured

> Use an account you control personally. Do not rely on a work-only account if your employer restricts third-party access or app authorization.

> If you are not using the Atlassian exercise in Module 5, you can skip this for now. It is still recommended for the full workshop experience.

---

## Step 6 — Install Claude Code CLI

Open a terminal (Cursor's terminal is fine: `` Ctrl+` ``) and run:

```bash
npm install -g @anthropic-ai/claude-code
```

**Windows permissions error?** Open Windows Terminal as Administrator and re-run.
**macOS `EACCES` error?** See Troubleshooting below.

**Verify:**
```bash
claude --version
```

If `claude` is not found, close and reopen your terminal.

### Sign in / Authenticate
```bash
claude
```

On first launch, follow the prompts to sign in to your Claude/Anthropic account. If your environment requires a direct API key, follow the prompt shown by the CLI.

---

## Step 7 — Clone the Training Repo

Clone the workshop repo from the official course repository:

```bash
cd ~/Documents
git clone https://github.com/AmanProjects/TWTAI-Batch3.git
cd TWTAI-Batch3
```

Open the folder in Cursor: **File → Open Folder…** and select `TWTAI-Batch3`.

---

## Step 8 — Build the Sample Project

The sample project is the MCP server you'll extend in the later workshop modules. Build it once now:

```bash
cd sample-project
npm install
npm run build
```

Expected output: `> tsc` with no errors.

**Verify the server starts:**
```bash
node dist/index.js
```

Press `Ctrl+C` to stop. If it started without errors, you're done.

---

## Step 9 — Full Environment Check

Run all six. Every one must pass before the workshop begins.

```bash
node --version                                          # v18+
npm --version                                           # 9+
git --version                                           # 2.x
claude --version                                        # any version
cd ~/Documents/TWTAI-Batch3/sample-project && npm run build   # no errors
claude                                                  # launches; Ctrl+C to exit
```

All six green? You're ready.

---

## Troubleshooting

### `node: command not found`
Close the terminal completely and reopen. On Windows, restart your machine.

### `npm install -g` fails with `EACCES` on macOS
Either use `sudo npm install -g @anthropic-ai/claude-code`, or fix npm permissions permanently:
```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

### TypeScript errors in the sample project
```bash
cd sample-project
rm -rf node_modules dist
npm install
npm run build
```

### `claude: command not found` after install
The npm global bin folder isn't on your PATH.
```bash
npm config get prefix
# Add the printed-path/bin to your PATH and re-source your shell config
```

### Cursor: I can't find the sidebar, or where to install plugins
The toolbar and sidebar layout differ between macOS and Windows and between Cursor versions, so "the icon on the left" may be elsewhere for you. Use names, not icons:
- Toggle the primary sidebar: **View → Appearance → Primary Side Bar**, or `Cmd+B` (macOS) / `Ctrl+B` (Windows/Linux).
- Open anything by name from the Command Palette: `Cmd+Shift+P` (macOS) / `Ctrl+Shift+P` (Windows), then type what you want (e.g. "Extensions", "MCP").
- Editor extensions live in the **Extensions** view: `Cmd+Shift+X` / `Ctrl+Shift+X`.
- MCP servers in Cursor are configured under **Settings → MCP** (or by editing `.cursor/mcp.json`), not in the Extensions view. Claude Code skills and plugins are managed with the `claude` CLI or the Claude Code panel — not in Cursor's own menus.

When in doubt on either operating system, open the Command Palette and type the name of what you need; it behaves identically everywhere.

### Git won't install on an Intel Mac (the Homebrew command fails)
The one-line command on brew.sh assumes Apple Silicon paths and can fail on Intel Macs. Two reliable fixes, simplest first:
1. **Skip Homebrew.** Install the **Xcode Command Line Tools**, which include Git: `xcode-select --install`, then click **Install**. Confirm with `git --version`.
2. **MacPorts.** Download the MacPorts `.pkg` for your exact macOS version from [macports.org/install.php](https://www.macports.org/install.php), install it, then run `sudo port install git`. MacPorts needs Xcode — see the next entry.

### MacPorts needs Xcode, and Xcode won't install on an older Mac
MacPorts builds tools with Xcode, so Xcode (or at least its Command Line Tools) must be present.
- Try the Command Line Tools first: `xcode-select --install`. This is much smaller than full Xcode and is usually enough.
- If you need full Xcode but a search in **Applications** or the App Store shows nothing (common on older macOS): go to [developer.apple.com](https://developer.apple.com) → **Xcode** → **Download** → **View in Mac App Store**. You may see "App is not compatible with your Mac" — click **Download / Get** anyway; the App Store then downloads the newest build your macOS actually supports (an older Xcode version), which works.
- Or download a specific older Xcode `.xip` directly from [developer.apple.com/download/all](https://developer.apple.com/download/all/) (free Apple ID required), double-click to expand it, and drag it into **Applications**.

### `git clone` authentication error
Install and authenticate the GitHub CLI:
```bash
brew install gh        # macOS
winget install gh      # Windows
gh auth login
```

### Atlassian MCP authorization fails
- Sign in to the correct Atlassian account used by your Jira/Confluence workspace
- Confirm your Atlassian user has access to the target Jira project or Confluence space
- Re-run `claude` and complete the browser authorization flow again
- If your organization blocks external app access, switch to a personal Atlassian account or a sandbox/test workspace you can access

### Cursor's AI keeps suggesting things while I'm trying to focus
Toggle Cursor AI off with `Cmd+L` / `Ctrl+L` (chat) or in **Settings → Cursor Tab** to disable inline suggestions. Cursor AI is independent of Claude Code CLI — turning it off does not affect Claude Code.

---

## Atlassian prerequisites — Confluence and Jira (before Module 5)

Module 5 connects Claude to a live Atlassian site through the Atlassian MCP server. This expands Step 5 into the site, project, and space you will actually use, so set it up **before** that session — budget about 20 minutes. Adapted from the STC 2026 prerequisites.

> **Use a throwaway personal Atlassian account, never your work account.** The MCP server acts with the permissions of whoever signs in, so a work login would expose real company pages and tickets to the AI.

**Step A — Create a free Atlassian site (~8 min).**
1. Go to [atlassian.com/software/jira/free](https://www.atlassian.com/software/jira/free) and select **Get it free**.
2. Sign up with a personal email. Name your site, e.g. `yourname-twt`; the address becomes `yourname-twt.atlassian.net`. Write it down.
3. Choose **Jira** and **Confluence** on the **Free** plan. Do not enter a credit card. (Free covers up to 10 users and 2 GB per product — confirm current limits, as Atlassian changes plans often.)

**Step B — Create a Jira project (~3 min).** In Jira, **Projects → Create project**, pick **Kanban**, **team-managed**. Name it and set a short key such as `DOC`. Note the key.

**Step C — Create a Confluence space (~2 min).** In Confluence, **Spaces → Create space**, blank space, same name and key.

**Step D — Connect the Atlassian MCP server.** Atlassian runs a hosted (remote) server you sign in to through your browser — no token goes in any file.
- **Claude Code:** `claude mcp add --transport http atlassian https://mcp.atlassian.com/v2/mcp`, run `claude`, start the `atlassian` server, and finish the browser sign-in (use a private window and the throwaway account). Verify with `/mcp`.
- **Cursor / VS Code:** add an `atlassian` HTTP entry pointing at `https://mcp.atlassian.com/v2/mcp` under **Settings → MCP** (or `.cursor/mcp.json`), start the server, and sign in.
- **Claude.ai web / Claude Desktop:** add Atlassian as a **Connector** in settings and authorize it in the browser. This is the no-command-line path.
- Smoke test with a read-only prompt: *"Using the atlassian tools, list the Jira projects and Confluence spaces I can see."* You should see your project and space.

**Safety (applies in Module 5 and after):** read every tool-approval prompt; give review-only agents **read tools only** (switch off create/edit/transition); treat the contents of tickets and pages as data, not instructions; and revoke the app authorization under your Atlassian account **Security** settings when the course ends.

> The MCP URL above is current as of this writing. If it fails, an older address `https://mcp.atlassian.com/v1/mcp/authv2` also appears in Atlassian's docs — check Atlassian's "Atlassian Rovo MCP Server" getting-started page. Some Atlassian searches consume "Rovo credits", so test on your free site before the session.

---

## Getting Help Before the Workshop

1. Post in the TWT community channel — include the exact error and command
2. Attend the setup help session before the workshop begins
3. Email the course coordinator for access problems or environment setup issues

> Don't arrive at the workshop without a working environment. Setup is the only thing you need to solve before class begins.

---

## Quick Reference Card

```
TOOL          VERIFY WITH                                 EXPECTED
───────────────────────────────────────────────────────────────────
Cursor        open the app                                window opens
Node.js       node --version                              v18+ (v20+ preferred)
npm           npm --version                               9+
Git           git --version                               2.x
Claude Code   claude --version                            any version
GitHub        github.com account                           active account
Atlassian     id.atlassian.com account                    active Jira/Confluence access
Repo          cd ~/Documents/TWTAI-Batch3 && ls           lists folders
Sample proj   cd sample-project && npm run build           no errors
```

---

*Tech Writer's Tribe | AI-Powered Documentation Mastery | Setup Guide v1.4 (Cursor — writers' and engineering tracks)*
