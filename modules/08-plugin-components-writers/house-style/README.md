# house-style

A **three-component** plugin. This is what a real team plugin looks like — not
the thirteen-component demo next door.

```
house-style/
├── .claude-plugin/
│   └── plugin.json                    ← the label on the box
├── skills/
│   └── house-style/
│       ├── SKILL.md                   ← the standard itself
│       └── examples.md                ← loaded only when asked for
├── hooks/
│   └── hooks.json                     ← "remind me after every edit"
├── scripts/
│   └── nudge.sh                       ← what the reminder runs
└── bin/
    └── longest-sentence               ← a tool Claude can run by name
```

## Try it

```bash
cd modules/08-plugin-components-writers
claude --plugin-dir ./house-style
```

Then, in the session:

```
/house-style ../08-plugin-components/fixture/needs-work.md
```

Edit any `.md` file and watch the hook fire.

## Make it yours

1. Open `skills/house-style/SKILL.md`. Replace the five rules with your team's.
2. Open `skills/house-style/examples.md`. Replace the before/afters with real ones from your docs.
3. Open `.claude-plugin/plugin.json`. Change `name`, `author`, and `description`.
4. Run `claude plugin validate ./house-style`.

That's the whole job. Everything else in the folder can stay as it is.
