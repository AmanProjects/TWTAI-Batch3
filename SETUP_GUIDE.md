# Setup Guide — AI-Powered Documentation Mastery
## Tech Writer's Tribe | Prerequisites and Installation (Cursor IDE)

**Read this guide once before installing anything.** Plan for about 60 minutes the first time through.

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

> **Windows users:** Use [Windows Terminal](https://aka.ms/terminal) or [Git Bash](https://git-scm.com/downloads) instead of Command Prompt.

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

### macOS
```bash
git --version     # may already be installed
```
If not installed, you'll be prompted to install developer tools — click **Install**. Or use `brew install git`.

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
2. If you already use Jira/Confluence at work, use that Atlassian account
3. If needed, create or join a Jira project and Confluence space for the workshop exercises
4. Keep your login ready — Claude Code will prompt you to authorize access when the Atlassian MCP server is configured

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
git clone https://github.com/AmanProjects/TWTAI-Batch4.git
cd TWTAI-Batch4
```

Open the folder in Cursor: **File → Open Folder…** and select `TWTAI-Batch4`.

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
cd ~/Documents/TWTAI-Batch4/sample-project && npm run build   # no errors
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

### Cursor's AI keeps suggesting things while I'm trying to focus
Toggle Cursor AI off with `Cmd+L` / `Ctrl+L` (chat) or in **Settings → Cursor Tab** to disable inline suggestions. Cursor AI is independent of Claude Code CLI — turning it off does not affect Claude Code.

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
────────────────────────────────────────────────────────────────────────
Cursor        open the app                                window opens
Node.js       node --version                              v18+ (v20+ preferred)
npm           npm --version                               9+
Git           git --version                               2.x
Claude Code   claude --version                            any version
GitHub        github.com account                           active account
Atlassian     id.atlassian.com account                    active Jira/Confluence access
Repo          cd ~/Documents/TWTAI-Batch4 && ls           lists folders
Sample proj   cd sample-project && npm run build           no errors
```

---

*Tech Writer's Tribe | AI-Powered Documentation Mastery | Setup Guide v1.3 (Cursor)*
